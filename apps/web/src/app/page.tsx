import WalletButton from "@/components/WalletButton";
import { fetchFixtures } from "@/lib/txline";
import FirstVisitRedirect from "@/components/FirstVisitRedirect";

async function getFixtures() {
  try {
    return await fetchFixtures();
  } catch {
    return [];
  }
}

export default async function Home() {
  const fixtures = await getFixtures();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-violet-200">
      <FirstVisitRedirect />
      <div className="h-1 w-full bg-gradient-to-r from-violet-700 via-blue-600 to-yellow-400" />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
        <div className="flex justify-end">
          <WalletButton />
        </div>

        <div className="relative flex flex-col items-center py-2 text-center sm:py-6">
          <img
            src="/polvo.png"
            alt="Octopus Crowd mascot"
            className="octopus-breathe pointer-events-none w-[78vw] max-w-[420px] sm:w-[55vw] sm:max-w-[560px] lg:max-w-[640px]"
          />
          <h1 className="mt-2 text-4xl font-black uppercase leading-[0.9] tracking-tight text-black sm:text-6xl">
            Octopus Crowd
            <span className="mt-2 block text-xl font-black uppercase tracking-tight text-violet-700 sm:text-3xl">
              Fixtures
            </span>
          </h1>
        </div>

        {fixtures.length === 0 && (
          <div className="border-2 border-dashed border-black/30 bg-violet-50 p-6 text-center">
            <p className="font-mono text-sm uppercase tracking-wide text-zinc-600">
              Nenhuma fixture carregada ainda.
            </p>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {fixtures.map((f: any, i: number) => (
            <a href={`/match/${f.FixtureId}`} key={i} className="fixture-card">
              <p className="font-mono text-xs uppercase tracking-widest text-blue-700">
                {f.Competition}
              </p>
              <p className="mt-3 text-2xl font-black leading-tight text-black">
                {f.Participant1 ?? "?"}{" "}
                <span className="font-mono text-sm font-normal text-yellow-600">vs</span>{" "}
                {f.Participant2 ?? "?"}
              </p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}