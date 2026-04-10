import { NextResponse } from "next/server";

import type { SiteContent } from "@/lib/site-content-schema";
import { getSiteContent, saveSiteContent } from "@/lib/site-content-store";

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load site content.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const content = (await request.json()) as SiteContent;
    const result = await saveSiteContent(content);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save site content.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
