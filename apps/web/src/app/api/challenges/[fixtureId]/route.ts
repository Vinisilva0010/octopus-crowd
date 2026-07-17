import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { createNextGoalChallenge } from "core";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL ausente" }, { status: 500 });
  }

  const { fixtureId: fixtureIdParam } = await params;
  const fixtureId = Number(fixtureIdParam);
  const sql = neon(DATABASE_URL);

  // Fecha qualquer desafio antigo ainda aberto pra essa fixture, antes de abrir um novo.
  await sql`
    UPDATE challenges SET status = 'void'
    WHERE fixture_id = ${fixtureId} AND status = 'open'
  `;

  const draft = createNextGoalChallenge(fixtureId, new Date(), 180);

  const [created] = await sql`
    INSERT INTO challenges (fixture_id, type, opens_at, closes_at, status)
    VALUES (${fixtureId}, ${draft.type}, ${draft.opensAt.toISOString()}, ${draft.closesAt.toISOString()}, ${draft.status})
    RETURNING id, fixture_id, type, opens_at, closes_at, status
  `;

  return NextResponse.json(created);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL ausente" }, { status: 500 });
  }

  const { fixtureId: fixtureIdParam } = await params;
  const fixtureId = Number(fixtureIdParam);
  const sql = neon(DATABASE_URL);

  const [current] = await sql`
    SELECT id, fixture_id, type, opens_at, closes_at, status, correct_answer
    FROM challenges
    WHERE fixture_id = ${fixtureId}
    ORDER BY id DESC LIMIT 1
  `;

  return NextResponse.json(current ?? null);
}