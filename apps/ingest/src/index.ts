import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { neon } from "@neondatabase/serverless";
import { isGoalEvent, resolveGoalScorer } from "core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
loadEnv({ path: resolve(__dirname, "../../../.env") });

const NETWORK = process.env.TXLINE_NETWORK ?? "devnet";
const API_ORIGIN =
  NETWORK === "mainnet"
    ? "https://txline.txodds.com"
    : "https://txline-dev.txodds.com";

const API_TOKEN = process.env.TXLINE_API_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;

if (!API_TOKEN) throw new Error("TXLINE_API_TOKEN não definido no .env");
if (!DATABASE_URL) throw new Error("DATABASE_URL não definido no .env");

const sql = neon(DATABASE_URL);



const WEB_API_BASE_URL = process.env.WEB_API_BASE_URL ?? "http://localhost:3000";

async function resolveIfGoal(fixtureId: number | null, payload: any) {
  if (fixtureId === null || !isGoalEvent(payload)) return;

  const scorer = resolveGoalScorer(payload);
  if (!scorer) {
    console.log(`[gol] evento de gol sem participant identificável, fixture=${fixtureId}`);
    return;
  }

  const [openChallenge] = await sql`
    SELECT id FROM challenges WHERE fixture_id = ${fixtureId} AND status = 'open'
  `;

  if (!openChallenge) {
    console.log(`[gol] gol real detectado (fixture=${fixtureId}, ${scorer}), mas não tinha desafio aberto`);
    return;
  }

  try {
    const res = await fetch(`${WEB_API_BASE_URL}/api/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengeId: openChallenge.id,
        correctAnswer: scorer,
        resolvingEventSeq: payload.Seq ?? null,
      }),
    });
    const body = await res.json();
    console.log(`[gol] desafio ${openChallenge.id} resolvido automaticamente:`, body);
  } catch (err) {
    console.error(`[gol] falha ao resolver desafio ${openChallenge.id}:`, err);
  }
}

type RawEvent = {
  source: "scores" | "odds";
  eventId: string | null;
  fixtureId: number | null;
  ts: number | null;
  payload: unknown;
};

let buffer: RawEvent[] = [];

async function flush() {
  if (buffer.length === 0) return;
  const batch = buffer;
  buffer = [];
  try {
    for (const ev of batch) {
      await sql`
        INSERT INTO raw_events (source, event_id, fixture_id, ts, payload)
        VALUES (${ev.source}, ${ev.eventId}, ${ev.fixtureId}, ${ev.ts}, ${JSON.stringify(ev.payload)})
      `;
    }
    console.log(`[db] gravou ${batch.length} eventos`);
  } catch (err) {
    console.error("[db] falha ao gravar lote, devolvendo pro buffer:", err);
    buffer = [...batch, ...buffer];
  }
}

setInterval(flush, 2000);

async function getFreshJwt(): Promise<string> {
  const res = await fetch(`${API_ORIGIN}/auth/guest/start`, { method: "POST" });
  if (!res.ok) throw new Error(`Falha ao obter JWT: ${res.status}`);
  const data = (await res.json()) as { token: string };
  return data.token;
}

async function consumeStream(path: "scores" | "odds", jwt: string) {
  const url = `${API_ORIGIN}/api/${path}/stream`;
  console.log(`[${path}] conectando em ${url}`);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "X-Api-Token": API_TOKEN!,
    },
  });

  if (!res.ok || !res.body) {
    throw new Error(`[${path}] falha ao conectar: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";

  console.log(`[${path}] conectado, ouvindo eventos...`);

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.log(`[${path}] stream encerrado pelo servidor`);
      break;
    }

    textBuffer += decoder.decode(value, { stream: true });
    const chunks = textBuffer.split("\n\n");
    textBuffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const lines = chunk.split("\n");
      let eventId: string | null = null;
      let eventType = "message";
      let dataLine = "";

      for (const line of lines) {
        if (line.startsWith("id:")) eventId = line.slice(3).trim();
        else if (line.startsWith("event:")) eventType = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
      }

      if (!dataLine) continue;

      let parsed: any;
      try {
        parsed = JSON.parse(dataLine);
      } catch {
        continue;
      }

      if (path === "scores") {
        console.log(`[scores][debug] event="${eventType}" fixtureId=${parsed.fixtureId ?? parsed.FixtureId} dataLen=${dataLine.length}`);
      }

      if (eventType === "heartbeat") continue;

      const fixtureId = parsed.FixtureId ?? parsed.fixtureId ?? null;
      const ts = parsed.Ts ?? parsed.ts ?? null;

      console.log(`[${path}] fixture=${fixtureId} ts=${ts}`);
      buffer.push({ source: path, eventId, fixtureId, ts, payload: parsed });

      if (path === "scores") await resolveIfGoal(fixtureId, parsed);
    }
  }
}

async function main() {
  const jwt = await getFreshJwt();
  console.log("[auth] JWT obtido");

  await Promise.all([
    consumeStream("scores", jwt).catch((err) => console.error("[scores] erro fatal:", err)),
    consumeStream("odds", jwt).catch((err) => console.error("[odds] erro fatal:", err)),
  ]);

  await flush();
}

async function shutdown(signal: string) {
  console.log(`\n[shutdown] recebido ${signal}, gravando o que falta...`);
  await flush();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});