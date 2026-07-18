# Octopus Crowd

A real-time prediction game for World Cup fans, built on TxLINE's live sports data feed and Solana.
Octopus Crowd turns every World Cup match into a sequence of real-time micro-challenges. Predict the next goal before it happens, build a streak, climb the leaderboard, and discover your fan instinct — all backed by cryptographically verifiable data, not a black box.
Built for the TxLINE × Solana World Cup Hackathon — Consumer & Fan Experiences track.

---

## The problem

Most fans watch the World Cup with their phone in hand, but today's second-screen experience is passive: refresh a score, scroll a feed, wait for something to happen. Existing crypto-native alternatives solve this by turning fans into bettors — stake, odds, payout. Octopus Crowd doesn't.

---

## What it is — and what it isn't

It is a skill-based prediction game. Answer correctly, build a streak, build a reputation.  
It is not a sportsbook. No stake, no credits, no token ever changes hands. The wallet is identity only — it never holds or risks funds.  
It is provably fair. Every resolved challenge can be checked against a live Merkle proof pulled directly from the TxLINE oracle, not from our own database.

This positioning is deliberate: it keeps the product outside the crowded field of wallet-connect-and-bet apps already live in this ecosystem, and outside the gambling-law grey zone those products sit in.

---

## Core loop

Connect a Solana wallet (identity only).  
Pick a live match.  
When the match kicks off, a "Next Goal" challenge opens automatically.  
Predict Team 1 / Team 2, one tap, before the goal happens.  
When the real goal is detected in TxLINE's live feed, the challenge resolves automatically — no manual step.  
Streak, accuracy, and per-challenge-type reputation update instantly.  
Every resolved result links to a live, verifiable Merkle proof from TxLINE.

---

## What makes this different

Most fan-prediction products in this space are functionally identical: connect wallet, bet, win credits, climb a leaderboard. Octopus Crowd differs on two axes competitors don't touch:

CrowdBrain reputation layer — the system tracks accuracy per challenge type (goals, corners, cards) and surfaces a fan's actual "reading" of the game (e.g. "you're especially good at predicting goals"), not just a raw score.  
Verifiable settlement — results aren't just computed against our own Postgres database. Each resolution is checked against TxLINE's on-chain Merkle proof endpoint, so a fan (or a judge) can independently verify the outcome was correct — a level of transparency none of the stake-based competitors in this ecosystem currently offer.

---

## Architecture

octopus-crowd/  
├── apps/  
│   ├── web/       Next.js 16 (App Router, Turbopack) — frontend + API routes, deployed on Vercel  
│   └── ingest/    Node worker — consumes TxLINE's live SSE streams, runs on GitHub Actions  
├── packages/  
│   └── core/      Shared TypeScript rules engine — challenge lifecycle, scoring, reputation  
└── .github/workflows/   Scheduled + manually-triggered live ingestion runs

---

## Data flow

TxLINE live SSE stream (scores + odds) → ingest worker (Node, GitHub Actions) → Neon Postgres (raw_events) → rules engine (packages/core) → Next.js API routes → frontend (wallet-authenticated)

Kickoff and goal detection run automatically inside the ingestion worker: a kickoff event opens a new challenge, a goal event resolves the currently open one and immediately opens the next — no human in the loop during a live match.

---

## Tech stack

Frontend: Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS 4  
Wallet: @solana/wallet-adapter-react (Phantom), Solana devnet  
On-chain integration: @coral-xyz/anchor, @solana/web3.js, @solana/spl-token  
Database: Neon (serverless Postgres), accessed via @neondatabase/serverless  
Live ingestion: Node 22, Server-Sent Events client, deployed as a scheduled/manual GitHub Actions workflow (no always-on server required)  
Testing: Vitest — the rules engine is unit-tested against real event payloads captured from TxLINE, including a real goal event, not synthetic fixtures  
Deployment: Vercel (frontend + API), GitHub Actions (ingestion), Neon (data)

---

## TxLINE endpoints used

Endpoint  
Purpose  

POST /auth/guest/start  
Guest JWT for session authentication  

on-chain subscribe (Anchor program)  
Devnet subscription to the free World Cup data bundle  

POST /api/token/activate  
Activates the long-lived API token after on-chain subscription  

GET /api/fixtures/snapshot  
Live/upcoming fixture list shown on the home screen  

GET /api/scores/stream (SSE)  
Live score/event stream — kickoff and goal detection  

GET /api/odds/stream (SSE)  
Live odds stream — shown as live activity in the Match Room  

GET /api/scores/historical/{fixtureId}  
Used during development to validate real event payloads against the public schema  

GET /api/scores/stat-validation  
Live Merkle proof for a resolved challenge's underlying event  

---

## Security & integrity notes

The activated TxLINE API token is never exposed to the client — all TxLINE calls happen server-side (API routes or the ingestion worker), never in the browser bundle.  
The response window for a challenge is locked using the TxLINE event server timestamp, never the client's clock — this prevents a user from answering after the outcome is already known.  
Duplicate responses per wallet per challenge are rejected at the API layer.  
The ingestion worker only runs during live match windows (scheduled via GitHub Actions), so no always-on infrastructure or hosting cost is required — a deliberate architectural choice, not a limitation.

---

## Local development

pnpm install  
pnpm --filter web dev  

Environment variables (see .env.example):

TXLINE_NETWORK=devnet  
TXLINE_API_TOKEN=  
SOLANA_RPC_URL=https://api.devnet.solana.com  
DATABASE_URL=  

---

## Testing

pnpm --filter core exec vitest run  

The rules engine test suite validates challenge creation, response-window enforcement, duplicate prevention, scoring, streak calculation, and per-type reputation — including assertions built directly from a real goal event captured from TxLINE's live feed during development, not a synthetic mock.

---

## Roadmap beyond this submission

On-chain badge/achievement issuance tied to the same verifiable proof already integrated  
Additional challenge types (next corner, next card)  
Branded challenges and private leagues for sports media partners  
Progression tiers (novice → advanced) gating more complex, compound predictions  

---

## Feedback on the TxLINE API

Overall, the API is well-structured and the free World Cup devnet bundle made iteration fast. Two friction points worth flagging: the interactive API reference's public schema examples don't fully match real event payloads for soccer (e.g. goal events surface via a top-level Action/Participant pair, not the dataSoccer.Goal field shown in the docs) — validating this required pulling real historical event data directly. Devnet and mainnet also expose different valid service level IDs without that being called out in the schema; discovering this took a failed transaction to catch.

---

## Built solo

Built solo, under hackathon time constraints, with a strong bias toward verifying every integration against real API responses rather than trusting documentation at face value.
