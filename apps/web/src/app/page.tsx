import WalletButton from "@/components/WalletButton";
async function getFixtures() {
  const res = await fetch("http://localhost:3000/api/fixtures", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function Home() {
  const fixtures = await getFixtures();

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Octopus Crowd — Fixtures</h1>
        <WalletButton />
      </div>
      <div className="space-y-3">
        {fixtures.length === 0 && <p className="text-zinc-400">Nenhuma fixture carregada ainda.</p>}
        {fixtures.map((f: any, i: number) => (
  <a href={`/match/${f.FixtureId}`} key={i} className="block border border-zinc-800 rounded-lg p-4 hover:border-zinc-600">
            <p className="text-sm text-zinc-400">{f.Competition}</p>
            <p className="text-lg">
              {f.Participant1 ?? "?"} <span className="text-zinc-500">vs</span> {f.Participant2 ?? "?"}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}