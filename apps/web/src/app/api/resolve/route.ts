import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { gradeResponses, applyResultToStats, applyResultToTypeStats, emptyStats } from "core";

/**
 * Resolve manualmente um desafio específico dado o vencedor real.
 * Uso: quando o worker de ingestão detectar um gol real (Action === "goal",
 * via isGoalEvent/resolveGoalScorer), ele chama essa rota — por enquanto,
 * testamos ela na mão, direto.
 */
export async function POST(req: Request) {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL ausente" }, { status: 500 });
  }

  const { challengeId, correctAnswer, resolvingEventSeq } = await req.json();
  if (!challengeId || !correctAnswer) {
    return NextResponse.json({ error: "challengeId e correctAnswer são obrigatórios" }, { status: 400 });
  }

  const sql = neon(DATABASE_URL);

  const [challenge] = await sql`
    SELECT id, status, type FROM challenges WHERE id = ${challengeId}
  `;
  if (!challenge) {
    return NextResponse.json({ error: "Desafio não encontrado" }, { status: 404 });
  }
  if (challenge.status === "resolved") {
    return NextResponse.json({ error: "Desafio já resolvido" }, { status: 409 });
  }

  const responses = await sql`
    SELECT wallet_pubkey, answer FROM responses WHERE challenge_id = ${challengeId}
  `;

  const graded = gradeResponses(
    responses.map((r) => ({ walletPubkey: r.wallet_pubkey, answer: r.answer })),
    correctAnswer
  );

  const results = [];
  for (const g of graded) {
    await sql`
      UPDATE responses SET is_correct = ${g.isCorrect}
      WHERE challenge_id = ${challengeId} AND wallet_pubkey = ${g.walletPubkey}
    `;

    const [existingStats] = await sql`
      SELECT * FROM user_stats WHERE wallet_pubkey = ${g.walletPubkey}
    `;

    const currentStats = existingStats
      ? {
          walletPubkey: existingStats.wallet_pubkey,
          currentStreak: existingStats.current_streak,
          bestStreak: existingStats.best_streak,
          totalCorrect: existingStats.total_correct,
          totalAnswered: existingStats.total_answered,
        }
      : emptyStats(g.walletPubkey);

    const currentStatsByType = existingStats?.stats_by_type ?? {};

    const updated = applyResultToStats(currentStats, g.isCorrect);
    const updatedStatsByType = applyResultToTypeStats(currentStatsByType, challenge.type, g.isCorrect);

    await sql`
      INSERT INTO user_stats (wallet_pubkey, current_streak, best_streak, total_correct, total_answered, stats_by_type)
      VALUES (${updated.walletPubkey}, ${updated.currentStreak}, ${updated.bestStreak}, ${updated.totalCorrect}, ${updated.totalAnswered}, ${JSON.stringify(updatedStatsByType)})
      ON CONFLICT (wallet_pubkey) DO UPDATE SET
        current_streak = ${updated.currentStreak},
        best_streak = ${updated.bestStreak},
        total_correct = ${updated.totalCorrect},
        total_answered = ${updated.totalAnswered},
        stats_by_type = ${JSON.stringify(updatedStatsByType)}
    `;

    results.push({ walletPubkey: g.walletPubkey, isCorrect: g.isCorrect, newStreak: updated.currentStreak });
  }

  await sql`
    UPDATE challenges
    SET status = 'resolved', correct_answer = ${correctAnswer}, resolved_at = now(), resolving_event_seq = ${resolvingEventSeq ?? null}
    WHERE id = ${challengeId}
  `;

  return NextResponse.json({ challengeId, correctAnswer, results });
} 