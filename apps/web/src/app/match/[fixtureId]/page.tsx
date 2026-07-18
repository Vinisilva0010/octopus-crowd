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

async function checkProofAvailable(challengeId: number): Promise<boolean> {
  const res = await fetch(`/api/proof/${challengeId}`);
  const data = await res.json();
  return data.available === true;
}

export default function MatchRoom({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { publicKey } = useWallet();
  const [fixtureId, setFixtureId] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [proofAvailable, setProofAvailable] = useState(false);

  useEffect(() => {
    params.then((p) => setFixtureId(p.fixtureId));
  }, [params]);

  useEffect(() => {
    if (!fixtureId) return;
    fetch(`/api/challenges/${fixtureId}`)
      .then((r) => r.json())
      .then((data) => {
        setChallenge(data);
        if (data?.status === "resolved") {
          checkProofAvailable(data.id).then(setProofAvailable);
        }
      });
  }, [fixtureId]);

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
    <main className="relative min-h-screen overflow-x-hidden bg-violet-200">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-violet-700 via-blue-600 to-yellow-400" />

      <div className="mx-auto max-w-3xl px-4 pt-4">
        <a href="/" className="back-chip">
          &larr; voltar
        </a>

        <div className="flex flex-col items-center text-center">
          <img
            src="/bola.png"
            alt="Bola"
            className="ball-move pointer-events-none w-24 sm:w-32"
          />
          <h1 className="hero-title-outline mt-2 text-5xl font-black uppercase leading-[0.85] tracking-tight sm:text-7xl">
            Match Room
            <span className="mt-2 block font-mono text-sm font-bold normal-case tracking-normal text-black sm:text-base">
              Fixture {fixtureId}
            </span>
          </h1>
        </div>

        <section className="panel mt-6">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-700">Desafio</p>
          <h2 className="mt-1 text-2xl font-black uppercase leading-tight text-black">Próximo gol</h2>

          {!challenge && (
            <p className="mt-4 font-bold text-zinc-700">
              Aguardando o início da partida — o desafio abre automaticamente no apito inicial.
            </p>
          )}

          {challenge && challenge.status === "open" && (
            <>
              <p className="mt-4 font-mono text-sm font-bold text-zinc-700">
                Fecha em: {new Date(challenge.closes_at).toLocaleTimeString()}
              </p>
              {!publicKey && (
                <p className="mt-3 border-2 border-black bg-yellow-300 px-3 py-2 text-sm font-bold text-black">
                  Conecta sua wallet pra poder responder.
                </p>
              )}
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => respond("participant1")}
                  disabled={myAnswer !== null || !publicKey}
                  className={`pick-btn pick-btn-violet ${myAnswer === "participant1" ? "pick-btn-selected" : ""}`}
                >
                  Time 1
                </button>
                <button
                  onClick={() => respond("participant2")}
                  disabled={myAnswer !== null || !publicKey}
                  className={`pick-btn pick-btn-blue ${myAnswer === "participant2" ? "pick-btn-selected" : ""}`}
                >
                  Time 2
                </button>
              </div>
            </>
          )}

          {challenge && challenge.status === "resolved" && (
            <div className="mt-4">
              <p className="mb-2 font-bold text-black">
                Resolvido — resposta certa: <b>{challenge.correct_answer}</b>
              </p>
              {proofAvailable && (
                
                 <a href={`/api/proof/${challenge.id}`}
                  target="_blank"
                  className="text-xs font-bold text-blue-700 underline"
                >
                  Ver prova verificável (Merkle proof da TxLINE)
                </a>
              )}
            </div>
          )}

          {feedback && (
            <p className="mt-4 border-2 border-black bg-yellow-300 px-3 py-2 text-sm font-bold text-black">
              {feedback}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}