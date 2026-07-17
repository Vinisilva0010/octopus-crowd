import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL ausente" }, { status: 500 });
  }

  const sql = neon(DATABASE_URL);

  const rows = await sql`
    SELECT wallet_pubkey, current_streak, best_streak, total_correct, total_answered
    FROM user_stats
    WHERE total_answered > 0
    ORDER BY best_streak DESC, total_correct DESC
    LIMIT 50
  `;

  return NextResponse.json(rows);
}