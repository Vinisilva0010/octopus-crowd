import { NextResponse } from "next/server";
import { fetchFixtures } from "@/lib/txline";

export async function GET() {
  try {
    const fixtures = await fetchFixtures();
    return NextResponse.json(fixtures);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}