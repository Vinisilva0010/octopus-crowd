"use client";

import { use, useEffect, useState } from "react";
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

type EventsData = {
  scores: { payload: any; ts: number }[];
  odds: { payload: any; ts: number }[];
};

const TEAM_LABEL: Record<string, string> = {
  participant1: "Team 1",
  participant2: "Team 2",
};

async function checkProofAvailable(challengeId: number): Promise<boolean> {
  const res = await fetch(`/api/proof/${challengeId}`);
  const data = await res.json();
  return data.available === true;
}

export default function MatchRoom({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const { publicKey } = useWallet();
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [myResult, setMyResult] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [proofAvailable, setProofAvailable] = useState(false);
  const [events, setEvents] = useState<EventsData>({ scores: [], odds: [] });

  useEffect(() => {
    fetch(`/api/challenges/${fixtureId}`)
      .then((r) => r.json())
      .then((data) => {
        setChallenge(data);
        if (data?.status === "resolved") {
          checkProofAvailable(data.id).then(setProofAvailable);
        }
      });

    fetch(`/api/events/${fixtureId}`)
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => setEvents({ scores: [], odds: [] }));
  }, [fixtureId]);

  useEffect(() => {
    if (!challenge || !publicKey) return;
    fetch(`/api/my-answer/${challenge.id}?wallet=${publicKey.toBase58()}`)
      .then((r) => r.json())
      .then((row) => {
        if (row) {
          setMyAnswer(row.answer);
          setMyResult(row.is_correct);
        }
      });
  }, [challenge, publicKey]);

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
      setFeedback("Answer submitted. Waiting for the challenge to resolve.");
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-violet-200">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-violet-700 via-blue-600 to-yellow-400" />

      <div className="mx-auto max-w-3xl px-4 pt-4 pb-10">
        <a href="/" className="back-chip">
          &larr; back
        </a>

        <div className="flex flex-col items-center text-center">
          <img src="/bola.png" alt="Ball" className="ball-move pointer-events-none w-24 sm:w-32" />
          <h1 className="hero-title-outline mt-2 text-5xl font-black uppercase leading-[0.85] tracking-tight sm:text-7xl">
            Match Room
          </h1>
          <span
            style={{ textShadow: "none" }}
            className="mt-2 block font-mono text-sm font-bold normal-case tracking-normal text-black sm:text-base"
          >
            Fixture {fixtureId}
          </span>
        </div>

        <section className="panel mt-6">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-700">Challenge</p>
          <h2 className="mt-1 text-2xl font-black uppercase leading-tight text-black">Next goal</h2>

          {!challenge && (
            <p className="mt-4 font-bold text-zinc-700">
              Waiting for kickoff — the challenge opens automatically once the match starts.
            </p>
          )}

          {challenge && challenge.status === "open" && (
            <>
              <p className="mt-4 font-mono text-sm font-bold text-zinc-700">
                Closes at: {new Date(challenge.closes_at).toLocaleTimeString()}
              </p>
              {!publicKey && (
                <p className="mt-3 border-2 border-black bg-yellow-300 px-3 py-2 text-sm font-bold text-black">
                  Connect your wallet to answer.
                </p>
              )}
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => respond("participant1")}
                  disabled={myAnswer !== null || !publicKey}
                  className={`pick-btn pick-btn-violet ${myAnswer === "participant1" ? "pick-btn-selected" : ""}`}
                >
                  Team 1
                </button>
                <button
                  onClick={() => respond("participant2")}
                  disabled={myAnswer !== null || !publicKey}
                  className={`pick-btn pick-btn-blue ${myAnswer === "participant2" ? "pick-btn-selected" : ""}`}
                >
                  Team 2
                </button>
              </div>
            </>
          )}

          {challenge && challenge.status === "resolved" && (
            <div className="mt-4">
              {myResult === true && (
                <div className="mb-3 border-3 border-black bg-green-300 px-4 py-3 font-black uppercase text-black shadow-[4px_4px_0_#000]">
                  ✓ You called it right!
                </div>
              )}
              {myResult === false && (
                <div className="mb-3 border-3 border-black bg-red-300 px-4 py-3 font-black uppercase text-black shadow-[4px_4px_0_#000]">
                  ✗ Not this time — you picked {TEAM_LABEL[myAnswer ?? ""] ?? myAnswer}
                </div>
              )}
              <p className="mb-2 font-bold text-black">
                Resolved — correct answer:{" "}
                <b>{TEAM_LABEL[challenge.correct_answer ?? ""] ?? challenge.correct_answer}</b>
              </p>
              {proofAvailable && (
                
                 <a href={`/proof/${challenge.id}`}
                  target="_blank"
                  className="text-xs font-bold text-blue-700 underline"
                >
                  View verifiable proof (TxLINE Merkle proof)
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

        {events.odds.length > 0 && (
          <section className="panel mt-6">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-700">Live feed</p>
            <h2 className="mt-1 text-xl font-black uppercase leading-tight text-black">
              {events.odds.length} price updates captured live
            </h2>
            <p className="mt-1 font-mono text-xs font-bold text-zinc-600">
              Latest at {new Date(Number(events.odds[0].ts)).toLocaleTimeString()}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}