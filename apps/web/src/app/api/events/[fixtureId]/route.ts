import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL ausente" }, { status: 500 });
  }

  const sql = neon(DATABASE_URL);
  const { fixtureId: fixtureIdParam } = await params;
  const fixtureId = Number(fixtureIdParam);

  const scores = await sql`
    SELECT payload, ts FROM raw_events
    WHERE source = 'scores' AND fixture_id = ${fixtureId}
    ORDER BY ts DESC LIMIT 20
  `;
  const odds = await sql`
    SELECT payload, ts FROM raw_events
    WHERE source = 'odds' AND fixture_id = ${fixtureId}
    ORDER BY ts DESC LIMIT 5
  `;

  return NextResponse.json({ scores, odds });
}