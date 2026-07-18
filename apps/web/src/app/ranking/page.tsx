import { neon } from "@neondatabase/serverless";

async function getRanking() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) return [];

  const sql = neon(DATABASE_URL);
  return sql`
    SELECT wallet_pubkey, current_streak, best_streak, total_correct, total_answered
    FROM user_stats
    WHERE total_answered > 0
    ORDER BY best_streak DESC, total_correct DESC
    LIMIT 50
  `;
}

function shortWallet(wallet: string): string {
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

export default async function Ranking() {
  const rows = await getRanking();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-violet-200">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-violet-700 via-blue-600 to-yellow-400" />

      <div className="mx-auto max-w-3xl px-4 pt-4 pb-10">
        <a href="/" className="back-chip">
          &larr; back
        </a>

        <h1 className="hero-title-outline mt-4 text-5xl font-black uppercase leading-[0.85] tracking-tight sm:text-7xl">
          Ranking
        </h1>

        {rows.length === 0 && (
          <div className="panel mt-6 text-center">
            <p className="font-bold text-zinc-700">
              No one on the leaderboard yet — be the first to answer a challenge.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {rows.map((r: any, i: number) => (
            <div key={r.wallet_pubkey} className="rank-row">
              <div className="flex items-center gap-4">
                <span className="rank-badge">{i + 1}</span>
                <span className="font-mono text-sm font-bold">{shortWallet(r.wallet_pubkey)}</span>
              </div>
              <div className="flex gap-6 text-sm font-bold text-zinc-700">
                <span>
                  Best streak: <b className="text-black">{r.best_streak}</b>
                </span>
                <span>
                  {r.total_correct}/{r.total_answered} correct
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}