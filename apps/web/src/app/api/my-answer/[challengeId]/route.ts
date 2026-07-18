import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) return NextResponse.json(null);

  const { challengeId } = await params;
  const wallet = new URL(req.url).searchParams.get("wallet");
  if (!wallet) return NextResponse.json(null);

  const sql = neon(DATABASE_URL);
  const [row] = await sql`
    SELECT answer, is_correct FROM responses
    WHERE challenge_id = ${challengeId} AND wallet_pubkey = ${wallet}
  `;

  return NextResponse.json(row ?? null);
}