"use client";

import { use, useEffect, useState } from "react";

function toHex(bytes: number[]): string {
  return bytes
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function ProofPage({ params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = use(params);
  const [proof, setProof] = useState<any>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    fetch(`/api/proof/${challengeId}`)
      .then((r) => r.json())
      .then(setProof);
  }, [challengeId]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-violet-200">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-violet-700 via-blue-600 to-yellow-400" />

      <div className="mx-auto max-w-2xl px-4 pt-10 pb-10">
        <a href="javascript:history.back()" className="back-chip">
          &larr; back
        </a>

        <h1 className="hero-title-outline mt-4 text-4xl font-black uppercase leading-[0.85] tracking-tight sm:text-6xl">
          Verifiable Proof
        </h1>

        {!proof && <p className="mt-6 font-bold text-zinc-700">Loading...</p>}

        {proof && !proof.available && (
          <div className="panel mt-6">
            <p className="font-bold text-black">No cryptographic proof stored for this challenge.</p>
          </div>
        )}

        {proof?.available && (
          <div className="mt-6 space-y-4">
            <div className="panel bg-green-100">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-700">Status</p>
              <p className="mt-1 text-2xl font-black text-black">✓ Cryptographically Verified</p>
              <p className="mt-2 text-sm font-bold text-zinc-700">
                This result was checked against a live Merkle proof from the TxLINE oracle — not a
                claim from our server.
              </p>
            </div>

            <div className="panel">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-700">Fixture</p>
              <p className="text-xl font-black text-black">{proof.proof.summary.fixtureId}</p>
            </div>

            <div className="panel">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-700">
                Event timestamp
              </p>
              <p className="text-xl font-black text-black">{new Date(proof.proof.ts).toLocaleString()}</p>
            </div>

            <div className="panel">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-700">
                Event stat root (Merkle root hash)
              </p>
              <p className="break-all font-mono text-sm font-bold text-black">
                {toHex(proof.proof.eventStatRoot)}...
              </p>
            </div>

            <div className="panel">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-700">
                Updates verified in this batch
              </p>
              <p className="text-xl font-black text-black">{proof.proof.summary.updateStats.updateCount}</p>
            </div>

            <button onClick={() => setShowRaw(!showRaw)} className="back-chip">
              {showRaw ? "Hide raw proof" : "Show raw Merkle proof (technical)"}
            </button>

            {showRaw && (
              <pre className="max-h-96 overflow-auto border-3 border-black bg-black p-4 font-mono text-xs text-green-400">
                {JSON.stringify(proof.proof, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </main>
  );
}