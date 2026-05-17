import { NextResponse } from "next/server";

import { getSubmissions } from "@/lib/submissions-store";

export async function GET() {
  try {
    const data = await getSubmissions();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET submissions API error:", err);
    return NextResponse.json({ error: "Impossible de récupérer les messages." }, { status: 500 });
  }
}
