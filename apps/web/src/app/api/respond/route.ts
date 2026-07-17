import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isResponseWindowOpen, type Challenge } from "core";

export async function POST(req: Request) {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL ausente" }, { status: 500 });
  }

  const body = await req.json();
  const { challengeId, walletPubkey, answer } = body ?? {};

  if (!challengeId || !walletPubkey || !answer) {
    return NextResponse.json(
      { error: "challengeId, walletPubkey e answer são obrigatórios" },
      { status: 400 }
    );
  }

  const sql = neon(DATABASE_URL);

  const [row] = await sql`
    SELECT id, fixture_id, type, opens_at, closes_at, status, correct_answer
    FROM challenges WHERE id = ${challengeId}
  `;

  if (!row) {
    return NextResponse.json({ error: "Desafio não encontrado" }, { status: 404 });
  }

  const challenge: Challenge = {
    id: row.id,
    fixtureId: row.fixture_id,
    type: row.type,
    opensAt: new Date(row.opens_at),
    closesAt: new Date(row.closes_at),
    status: row.status,
    correctAnswer: row.correct_answer,
  };

  // "agora" vem do relógio do próprio servidor, nunca do cliente —
  // é isso que impede alguém de responder depois de já saber o resultado.
  const serverNow = new Date();

  if (!isResponseWindowOpen(challenge, serverNow)) {
    return NextResponse.json({ error: "Janela de resposta fechada" }, { status: 403 });
  }

  const [existing] = await sql`
    SELECT id FROM responses WHERE challenge_id = ${challengeId} AND wallet_pubkey = ${walletPubkey}
  `;
  if (existing) {
    return NextResponse.json({ error: "Você já respondeu esse desafio" }, { status: 409 });
  }

  const [created] = await sql`
    INSERT INTO responses (challenge_id, wallet_pubkey, answer)
    VALUES (${challengeId}, ${walletPubkey}, ${answer})
    RETURNING id, challenge_id, wallet_pubkey, answer, submitted_at
  `;

  return NextResponse.json(created);
}