"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

type ChallengeData = {
  id: number;
  fixture_id: number;
  type: string;
  opens_at: string;
  closes_at: string;
  status: "open" | "resolved" | "void";
  correct_answer: string | null;
};




export default function MatchRoom({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { publicKey } = useWallet();
  const [fixtureId, setFixtureId] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setFixtureId(p.fixtureId));
  }, [params]);

  useEffect(() => {
    if (!fixtureId) return;
    fetch(`/api/challenges/${fixtureId}`)
      .then((r) => r.json())
      .then(setChallenge);
  }, [fixtureId]);

  async function openNewChallenge() {
    if (!fixtureId) return;
    const res = await fetch(`/api/challenges/${fixtureId}`, { method: "POST" });
    const data = await res.json();
    setChallenge(data);
    setMyAnswer(null);
    setFeedback(null);
  }

  async function respond(answer: string) {
    if (!challenge || !publicKey) return;
    setMyAnswer(answer);
    const res = await fetch("/api/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: challenge.id, walletPubkey: publicKey.toBase58(), answer }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback(data.error);
    } else {
      setFeedback("Resposta registrada. Aguardando o desafio resolver.");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <a href="/" className="text-zinc-400 text-sm">&larr; voltar</a>
      <h1 className="text-2xl font-bold mt-2 mb-6">Match Room — Fixture {fixtureId}</h1>

      <section className="border border-zinc-800 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-3">Desafio: Próximo gol</h2>

        {!challenge && <p className="text-zinc-500">Nenhum desafio aberto ainda.</p>}

        {challenge && challenge.status === "open" && (
          <>
            <p className="text-sm text-zinc-400 mb-4">
              Fecha em: {new Date(challenge.closes_at).toLocaleTimeString()}
            </p>
            {!publicKey && (
              <p className="text-sm text-yellow-500 mb-3">Conecta sua wallet pra poder responder.</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => respond("participant1")}
                disabled={myAnswer !== null || !publicKey}
                className="flex-1 border border-zinc-700 rounded-lg py-3 hover:border-white disabled:opacity-40"
              >
                Time 1
              </button>
              <button
                onClick={() => respond("participant2")}
                disabled={myAnswer !== null || !publicKey}
                className="flex-1 border border-zinc-700 rounded-lg py-3 hover:border-white disabled:opacity-40"
              >
                Time 2
              </button>
            </div>
          </>
        )}

        {challenge && challenge.status === "resolved" && (
          <p className="text-zinc-300">
            Resolvido — resposta certa: <b>{challenge.correct_answer}</b>
          </p>
        )}

        {feedback && <p className="mt-4 text-sm text-yellow-400">{feedback}</p>}

        <button
          onClick={openNewChallenge}
          className="mt-6 text-xs text-zinc-500 underline"
        >
          Abrir novo desafio (teste)
        </button>
      </section>
    </main>
  );
}