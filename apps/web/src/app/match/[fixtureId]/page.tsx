async function getEvents(fixtureId: string) {
  const res = await fetch(`http://localhost:3000/api/events/${fixtureId}`, { cache: "no-store" });
  if (!res.ok) return { scores: [], odds: [] };
  return res.json();
}

export default async function MatchRoom({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = await params;
  const { scores, odds } = await getEvents(fixtureId);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <a href="/" className="text-zinc-400 text-sm">&larr; voltar</a>
      <h1 className="text-2xl font-bold mt-2 mb-6">Match Room — Fixture {fixtureId}</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Eventos de placar recentes</h2>
        {scores.length === 0 && (
          <p className="text-zinc-500">Nenhum evento de placar ainda nessa partida.</p>
        )}
        <ul className="space-y-2">
          {scores.map((s: any, i: number) => (
            <li key={i} className="border border-zinc-800 rounded p-3 text-sm">
              <pre className="whitespace-pre-wrap text-xs text-zinc-300">
                {JSON.stringify(s.payload, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Últimas odds</h2>
        {odds.length === 0 && <p className="text-zinc-500">Nenhuma odd registrada ainda.</p>}
        <ul className="space-y-2">
          {odds.map((o: any, i: number) => (
            <li key={i} className="border border-zinc-800 rounded p-3 text-sm text-zinc-400">
              {o.payload.Bookmaker ?? "?"}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}