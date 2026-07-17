"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletButton from "@/components/WalletButton";

type Stats = {
  walletPubkey: string;
  currentStreak: number;
  bestStreak: number;
  totalCorrect: number;
  totalAnswered: number;
};

function profileLine(stats: Stats): string {
  if (stats.totalAnswered === 0) return "Ainda sem histórico — responde seu primeiro desafio.";
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
    <main className="min-h-screen bg-black text-white p-8">
      <a href="/" className="text-zinc-400 text-sm">&larr; voltar</a>

      <div className="flex items-center justify-between mt-2 mb-8">
        <h1 className="text-2xl font-bold">Perfil</h1>
        <WalletButton />
      </div>

      {!publicKey && (
        <p className="text-zinc-400">Conecta sua wallet pra ver seu perfil.</p>
      )}

      {publicKey && !stats && <p className="text-zinc-500">Carregando...</p>}

      {publicKey && stats && (
        <div className="space-y-6">
          <p className="text-xs text-zinc-500 break-all">{stats.walletPubkey}</p>

          <p className="text-lg text-zinc-200">{profileLine(stats)}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-500">Streak atual</p>
              <p className="text-3xl font-bold">{stats.currentStreak}</p>
            </div>
            <div className="border border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-500">Melhor streak</p>
              <p className="text-3xl font-bold">{stats.bestStreak}</p>
            </div>
            <div className="border border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-500">Acertos</p>
              <p className="text-3xl font-bold">{stats.totalCorrect}</p>
            </div>
            <div className="border border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-500">Respondidos</p>
              <p className="text-3xl font-bold">{stats.totalAnswered}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}