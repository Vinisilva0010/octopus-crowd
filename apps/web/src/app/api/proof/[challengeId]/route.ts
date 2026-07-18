import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const NETWORK = process.env.TXLINE_NETWORK ?? "devnet";
const API_ORIGIN =
  NETWORK === "mainnet"
    ? "https://txline.txodds.com"
    : "https://txline-dev.txodds.com";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const DATABASE_URL = process.env.DATABASE_URL;
  const API_TOKEN = process.env.TXLINE_API_TOKEN;
  if (!DATABASE_URL || !API_TOKEN) {
    return NextResponse.json({ error: "Configuração ausente" }, { status: 500 });
  }

  const { challengeId } = await params;
  const sql = neon(DATABASE_URL);

  const [challenge] = await sql`
    SELECT fixture_id, resolving_event_seq, status
    FROM challenges WHERE id = ${challengeId}
  `;

  if (!challenge || challenge.status !== "resolved" || challenge.resolving_event_seq === null) {
    return NextResponse.json({ available: false });
  }

  const authRes = await fetch(`${API_ORIGIN}/auth/guest/start`, { method: "POST" });
  const { token: jwt } = (await authRes.json()) as { token: string };

  const proofRes = await fetch(
    `${API_ORIGIN}/api/scores/stat-validation?fixtureId=${challenge.fixture_id}&seq=${challenge.resolving_event_seq}&statKey=1`,
    { headers: { Authorization: `Bearer ${jwt}`, "X-Api-Token": API_TOKEN } }
  );

  if (!proofRes.ok) {
    return NextResponse.json({ available: false });
  }

  const proof = await proofRes.json();
  return NextResponse.json({ available: true, proof });
}