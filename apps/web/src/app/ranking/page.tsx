import { getBaseUrl } from "@/lib/base-url";

async function getRanking() {
  const res = await fetch(`${getBaseUrl()}/api/ranking`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

function shortWallet(wallet: string): string {
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

export default async function Ranking() {
  const rows = await getRanking();

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <a href="/" className="text-zinc-400 text-sm">&larr; voltar</a>
      <h1 className="text-2xl font-bold mt-2 mb-6">Ranking</h1>

      {rows.length === 0 && (
        <p className="text-zinc-500">Ninguém no ranking ainda — seja o primeiro a responder um desafio.</p>
      )}

      <div className="space-y-2">
        {rows.map((r: any, i: number) => (
          <div
            key={r.wallet_pubkey}
            className="flex items-center justify-between border border-zinc-800 rounded-lg p-4"
          >
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 w-6 text-right">{i + 1}</span>
              <span className="font-mono text-sm">{shortWallet(r.wallet_pubkey)}</span>
            </div>
            <div className="flex gap-6 text-sm text-zinc-400">
              <span>Melhor streak: <b className="text-white">{r.best_streak}</b></span>
              <span>{r.total_correct}/{r.total_answered} acertos</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}