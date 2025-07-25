import { NextRequest, NextResponse } from "next/server";
import { supabase } from "./supabase";


// GET /api/leaderboard?category=recipe
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  if (!category) {
    return NextResponse.json({ error: "Missing category parameter." }, { status: 400 });
  }
  // Fetch leaderboard from Supabase
  const { data, error } = await supabase
    .from("leaderboard")
    .select("name,category,score")
    .eq("category", category)
    .order("score", { ascending: false })
    .limit(10);
  if (error) {
    return NextResponse.json({ error: "Could not read leaderboard." }, { status: 500 });
  }
  return NextResponse.json({ leaderboard: data });
}

export async function POST(req: NextRequest) {
  try {
    const { name, category, score } = await req.json();
    if (!name || !category || typeof score !== "number") {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }
    // Insert score into Supabase
    const { error } = await supabase
      .from("leaderboard")
      .insert([{ name, category, score }]);
    if (error) {
      return NextResponse.json({ error: "Could not save score." }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Could not save score." }, { status: 500 });
  }
}