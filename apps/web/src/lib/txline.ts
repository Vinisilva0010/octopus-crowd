const NETWORK = process.env.TXLINE_NETWORK ?? "devnet";
const API_ORIGIN =
  NETWORK === "mainnet"
    ? "https://txline.txodds.com"
    : "https://txline-dev.txodds.com";

export async function fetchFixtures(): Promise<any[]> {
  const API_TOKEN = process.env.TXLINE_API_TOKEN;
  if (!API_TOKEN) throw new Error("TXLINE_API_TOKEN ausente");

  const authRes = await fetch(`${API_ORIGIN}/auth/guest/start`, { method: "POST" });
  if (!authRes.ok) throw new Error("Falha ao obter JWT");
  const { token: jwt } = (await authRes.json()) as { token: string };

  const fixturesRes = await fetch(`${API_ORIGIN}/api/fixtures/snapshot`, {
    headers: { Authorization: `Bearer ${jwt}`, "X-Api-Token": API_TOKEN },
    cache: "no-store",
  });

  if (!fixturesRes.ok) {
    const body = await fixturesRes.text();
    throw new Error(`TxLINE respondeu ${fixturesRes.status}: ${body}`);
  }

  return fixturesRes.json();
}