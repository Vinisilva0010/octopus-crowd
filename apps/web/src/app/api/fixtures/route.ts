import { NextResponse } from "next/server";

const NETWORK = process.env.TXLINE_NETWORK ?? "devnet";
const API_ORIGIN =
  NETWORK === "mainnet"
    ? "https://txline.txodds.com"
    : "https://txline-dev.txodds.com";

export async function GET() {
  const API_TOKEN = process.env.TXLINE_API_TOKEN;
  if (!API_TOKEN) {
    return NextResponse.json({ error: "TXLINE_API_TOKEN ausente" }, { status: 500 });
  }

  const authRes = await fetch(`${API_ORIGIN}/auth/guest/start`, { method: "POST" });
  if (!authRes.ok) {
    return NextResponse.json({ error: "Falha ao obter JWT" }, { status: 502 });
  }
  const { token: jwt } = (await authRes.json()) as { token: string };

  const fixturesRes = await fetch(`${API_ORIGIN}/api/fixtures/snapshot`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "X-Api-Token": API_TOKEN,
    },
    cache: "no-store",
  });

  if (!fixturesRes.ok) {
    const body = await fixturesRes.text();
    return NextResponse.json({ error: `TxLINE respondeu ${fixturesRes.status}: ${body}` }, { status: 502 });
  }

  const fixtures = await fixturesRes.json();
  return NextResponse.json(fixtures);
}