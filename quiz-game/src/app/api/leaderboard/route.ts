import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";


function getCsvPath(category: string) {
  // Sanitize category to avoid path traversal
  const safeCategory = category.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(process.cwd(), "..", "public", `leaderboard_${safeCategory}.csv`);
}

function parseCSV(data: string) {
  const [header, ...rows] = data.trim().split("\n");
  const keys = header.split(",");
  return rows.map(row => {
    const values = row.split(",");
    return Object.fromEntries(keys.map((k, i) => [k, values[i]]));
  });
}

function toCSVRow(obj: Record<string, string>) {
  return `${obj.name},${obj.category},${obj.score}`;
}


// GET /api/leaderboard?category=recipe
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  if (!category) {
    return NextResponse.json({ error: "Missing category parameter." }, { status: 400 });
  }
  const csvPath = getCsvPath(category);
  try {
    const data = await fs.readFile(csvPath, "utf-8");
    const leaderboard = parseCSV(data);
    return NextResponse.json({ leaderboard });
  } catch (err) {
    return NextResponse.json({ error: "Could not read leaderboard." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, category, score } = await req.json();
    if (!name || !category || typeof score !== "number") {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }
    const csvPath = getCsvPath(category);
    const row = toCSVRow({ name, category, score: String(score) });
    let fileExists = true;
    try {
      await fs.access(csvPath);
    } catch {
      fileExists = false;
    }
    if (!fileExists) {
      // Write header and first row
      await fs.writeFile(csvPath, `name,category,score\n${row}`);
    } else {
      await fs.appendFile(csvPath, `\n${row}`);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Could not save score." }, { status: 500 });
  }
}