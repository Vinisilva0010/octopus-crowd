"use client";

import { useState } from "react";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "how-it-works", label: "How it works" },
  { id: "differentiation", label: "What makes it different" },
  { id: "architecture", label: "Architecture" },
  { id: "tech-stack", label: "Tech stack" },
  { id: "txline-endpoints", label: "TxLINE endpoints" },
  { id: "security", label: "Security & integrity" },
  { id: "testing", label: "Testing" },
  { id: "roadmap", label: "Roadmap" },
  { id: "feedback", label: "TxLINE API feedback" },
];

export default function Docs() {
  const [open, setOpen] = useState(false);

  return (
    <main className="bg-violet-200">
      <button
        onClick={() => setOpen(!open)}
        className="docs-mobile-toggle fixed left-3 top-3 z-50 h-10 w-10 items-center justify-center border-3 border-black bg-yellow-300 font-black shadow-[3px_3px_0_#000]"
      >
        {open ? "✕" : "☰"}
      </button>

      <div className="docs-layout">
        <aside className={`docs-sidebar ${open ? "docs-sidebar-open" : ""}`}>
          <div className="mb-4 flex items-center gap-2">
            <img src="/polvo.png" alt="Octopus Crowd" className="w-10" />
            <p className="text-sm font-black uppercase leading-none">
              Octopus
              <br />
              Crowd Docs
            </p>
          </div>
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} onClick={() => setOpen(false)} className="docs-nav-link">
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="docs-content">
          <section id="overview" className="docs-section">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-700">
              Consumer & Fan Experiences
            </p>
            <h1 className="hero-title-outline mt-2 text-4xl font-black uppercase leading-[0.9] sm:text-5xl">
              Octopus Crowd
            </h1>
            <p className="mt-4 text-lg font-bold text-zinc-800">
              A real-time prediction game for World Cup fans, built on TxLINE's live sports data feed
              and Solana. Predict the next goal before it happens, build a streak, and discover your
              fan instinct — all backed by cryptographically verifiable data, not a black box.
            </p>
          </section>

          <section id="how-it-works" className="docs-section">
            <h2 className="text-2xl font-black uppercase text-black">How it works</h2>
            <ol className="mt-4 space-y-3">
              {[
                "Connect a Solana wallet — identity only, never holds or risks funds.",
                "Pick a live match from the fixture list.",
                "When the match kicks off, a \"Next Goal\" challenge opens automatically.",
                "Predict Team 1 or Team 2, one tap, before the goal happens.",
                "When the real goal is detected in TxLINE's live feed, the challenge resolves automatically — no manual step.",
                "Streak, accuracy, and per-challenge-type reputation update instantly.",
                "Every resolved result links to a live, verifiable Merkle proof from TxLINE.",
              ].map((step, i) => (
                <li key={i} className="panel flex gap-3">
                  <span className="font-mono font-black text-violet-700">{i + 1}.</span>
                  <span className="font-bold text-zinc-800">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section id="differentiation" className="docs-section">
            <h2 className="text-2xl font-black uppercase text-black">What makes it different</h2>
            <p className="mt-3 font-bold text-zinc-800">
              Most fan-prediction products in this space are functionally identical: connect wallet,
              bet, win credits, climb a leaderboard. Octopus Crowd differs on two axes competitors
              don't touch:
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="panel bg-yellow-50">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-violet-700">
                  CrowdBrain reputation
                </p>
                <p className="mt-2 font-bold text-zinc-800">
                  Tracks accuracy per challenge type and surfaces a fan's actual "reading" of the
                  game — not just a raw score.
                </p>
              </div>
              <div className="panel bg-yellow-50">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-violet-700">
                  Verifiable settlement
                </p>
                <p className="mt-2 font-bold text-zinc-800">
                  Every result is checked against TxLINE's on-chain Merkle proof — independently
                  verifiable, not just trust in our server.
                </p>
              </div>
            </div>
            <p className="mt-4 font-bold text-zinc-800">
              It is not a sportsbook. No stake, no credits, no token ever changes hands — keeping the
              product outside the gambling-law grey zone competitors in this ecosystem sit in.
            </p>
          </section>

          <section id="architecture" className="docs-section">
            <h2 className="text-2xl font-black uppercase text-black">Architecture</h2>
            <div className="docs-code mt-4">
{`octopus-crowd/
├── apps/
│   ├── web/       Next.js 16 — frontend + API routes, on Vercel
│   └── ingest/    Node worker — TxLINE live SSE streams, on GitHub Actions
├── packages/
│   └── core/      Shared rules engine — challenges, scoring, reputation
└── .github/workflows/   Scheduled + manual live ingestion runs`}
            </div>
            <p className="mt-4 font-bold text-zinc-800">
              Data flow: TxLINE live SSE stream (scores + odds) → ingest worker → Neon Postgres →
              rules engine → API routes → wallet-authenticated frontend. Kickoff and goal detection
              run automatically inside the ingestion worker — no human in the loop during a live match.
            </p>
          </section>

          <section id="tech-stack" className="docs-section">
            <h2 className="text-2xl font-black uppercase text-black">Tech stack</h2>
            <ul className="mt-4 space-y-2">
              {[
                ["Frontend", "Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS 4"],
                ["Wallet", "@solana/wallet-adapter-react (Phantom), Solana devnet"],
                ["On-chain", "@coral-xyz/anchor, @solana/web3.js, @solana/spl-token"],
                ["Database", "Neon (serverless Postgres)"],
                ["Ingestion", "Node 22, SSE client, GitHub Actions (no always-on server)"],
                ["Testing", "Vitest — validated against real TxLINE event payloads"],
                ["Deployment", "Vercel + GitHub Actions + Neon"],
              ].map(([k, v]) => (
                <li key={k} className="panel flex flex-col gap-1 sm:flex-row sm:gap-4">
                  <span className="w-28 flex-shrink-0 font-mono text-xs font-black uppercase text-violet-700">
                    {k}
                  </span>
                  <span className="font-bold text-zinc-800">{v}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="txline-endpoints" className="docs-section">
            <h2 className="text-2xl font-black uppercase text-black">TxLINE endpoints used</h2>
            <ul className="mt-4 space-y-2">
              {[
                ["POST /auth/guest/start", "Guest JWT for session authentication"],
                ["on-chain subscribe", "Devnet subscription to the free World Cup bundle"],
                ["POST /api/token/activate", "Activates the long-lived API token"],
                ["GET /api/fixtures/snapshot", "Live/upcoming fixture list"],
                ["GET /api/scores/stream", "Live score stream — kickoff/goal detection"],
                ["GET /api/odds/stream", "Live odds stream — live activity feed"],
                ["GET /api/scores/historical/{id}", "Used to validate real event payloads"],
                ["GET /api/scores/stat-validation", "Live Merkle proof for a resolved challenge"],
              ].map(([k, v]) => (
                <li key={k} className="panel">
                  <p className="font-mono text-sm font-black text-black">{k}</p>
                  <p className="mt-1 font-bold text-zinc-700">{v}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="security" className="docs-section">
            <h2 className="text-2xl font-black uppercase text-black">Security & integrity</h2>
            <ul className="mt-4 space-y-3">
              {[
                "The activated TxLINE API token never reaches the client — all calls happen server-side.",
                "The response window is locked using TxLINE's event server timestamp, never the client's clock.",
                "Duplicate responses per wallet per challenge are rejected at the API layer.",
                "The ingestion worker only runs during live match windows — no always-on infrastructure cost.",
              ].map((item, i) => (
                <li key={i} className="panel bg-green-50 font-bold text-zinc-800">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="testing" className="docs-section">
            <h2 className="text-2xl font-black uppercase text-black">Testing</h2>
            <div className="docs-code mt-4">pnpm --filter core exec vitest run</div>
            <p className="mt-4 font-bold text-zinc-800">
              The rules engine suite validates challenge creation, response-window enforcement,
              duplicate prevention, scoring, streak calculation, and per-type reputation — including
              assertions built from a real goal event captured live from TxLINE, not a synthetic mock.
            </p>
          </section>

          <section id="roadmap" className="docs-section">
            <h2 className="text-2xl font-black uppercase text-black">Roadmap</h2>
            <ul className="mt-4 space-y-2">
              {[
                "On-chain badge/achievement issuance tied to the same verifiable proof",
                "Additional challenge types (next corner, next card)",
                "Branded challenges and private leagues for sports media partners",
                "Progression tiers (novice → advanced)",
              ].map((item, i) => (
                <li key={i} className="panel font-bold text-zinc-800">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="feedback" className="docs-section !border-b-0 !mb-0">
            <h2 className="text-2xl font-black uppercase text-black">TxLINE API feedback</h2>
            <p className="mt-4 font-bold text-zinc-800">
              The free World Cup devnet bundle made iteration fast. Two friction points worth
              flagging: the public API reference's schema examples don't fully match real event
              payloads for soccer — goal events surface via a top-level <code>Action</code>/
              <code>Participant</code> pair, not the <code>dataSoccer.Goal</code> field shown in the
              docs. Validating this required pulling real historical event data directly. Devnet and
              mainnet also expose different valid service level IDs without that being called out in
              the schema — discovering this took a failed transaction to catch.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}