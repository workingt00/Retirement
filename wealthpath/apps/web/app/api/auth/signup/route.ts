import { NextResponse } from "next/server";

// Mock signup endpoint — no database required for demo
export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, name, mode } = body;

  if (!email || !password || !name) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // In production this would create a user in the DB
  // For now, just return success so the UI flow works
  return NextResponse.json({ success: true, user: { email, name, mode } });
}
