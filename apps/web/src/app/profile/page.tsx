"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletButton from "@/components/WalletButton";
import { bestChallengeType, type StatsByType } from "core";

type Stats = {
  walletPubkey: string;
  currentStreak: number;
  bestStreak: number;
  totalCorrect: number;
  totalAnswered: number;
  statsByType: StatsByType;
};

const TYPE_LABELS: Record<string, string> = {
  next_goal: "predicting goals",
};

function profileLine(stats: Stats): string {
  if (stats.totalAnswered === 0) return "No history yet — answer your first challenge.";

  const specialty = bestChallengeType(stats.statsByType, 3);
  if (specialty) {
    const label = TYPE_LABELS[specialty] ?? specialty;
    return `You're especially good at ${label}.`;
  }

  const rate = stats.totalCorrect / stats.totalAnswered;
  if (rate >= 0.7) return "You read the game well.";
  if (rate >= 0.4) return "You're getting the hang of it.";
  return "Every fan starts somewhere — keep predicting.";
}

export default function Profile() {
  const { publicKey } = useWallet();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setStats(null);
      return;
    }
    fetch(`/api/stats/${publicKey.toBase58()}`)
      .then((r) => r.json())
      .then(setStats);
  }, [publicKey]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-violet-200">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-violet-700 via-blue-600 to-yellow-400" />

      <div className="mx-auto max-w-3xl px-4 pt-4 pb-10">
        <a href="/" className="back-chip">
          &larr; back
        </a>

        <div className="flex items-center justify-between mt-4">
          <h1 className="hero-title-outline text-5xl font-black uppercase leading-[0.85] tracking-tight sm:text-7xl">
            Profile
          </h1>
          <WalletButton />
        </div>

        {!publicKey && (
          <div className="panel mt-6 text-center">
            <p className="font-bold text-zinc-700">Connect your wallet to see your profile.</p>
          </div>
        )}

        {publicKey && !stats && <p className="mt-6 font-bold text-zinc-700">Loading...</p>}

        {publicKey && stats && (
          <div className="mt-6 space-y-6">
            <p className="break-all font-mono text-xs font-bold text-zinc-600">{stats.walletPubkey}</p>

            <div className="panel">
              <p className="text-lg font-black text-black">{profileLine(stats)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="stat-box">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-700">
                  Current streak
                </p>
                <p className="text-3xl font-black text-black">{stats.currentStreak}</p>
              </div>
              <div className="stat-box">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-700">
                  Best streak
                </p>
                <p className="text-3xl font-black text-black">{stats.bestStreak}</p>
              </div>
              <div className="stat-box">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-700">Correct</p>
                <p className="text-3xl font-black text-black">{stats.totalCorrect}</p>
              </div>
              <div className="stat-box">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-700">Answered</p>
                <p className="text-3xl font-black text-black">{stats.totalAnswered}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}