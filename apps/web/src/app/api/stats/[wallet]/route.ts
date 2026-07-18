import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ wallet: string }> }
) {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL ausente" }, { status: 500 });
  }

  const { wallet } = await params;
  const sql = neon(DATABASE_URL);

  const [stats] = await sql`
    SELECT wallet_pubkey, current_streak, best_streak, total_correct, total_answered, stats_by_type
    FROM user_stats WHERE wallet_pubkey = ${wallet}
  `;

  if (!stats) {
    return NextResponse.json({
      walletPubkey: wallet,
      currentStreak: 0,
      bestStreak: 0,
      totalCorrect: 0,
      totalAnswered: 0,
    });
  }

 return NextResponse.json({
    walletPubkey: stats.wallet_pubkey,
    currentStreak: stats.current_streak,
    bestStreak: stats.best_streak,
    totalCorrect: stats.total_correct,
    totalAnswered: stats.total_answered,
    statsByType: stats.stats_by_type ?? {},
  });
}