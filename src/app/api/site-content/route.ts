import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { isAdminRequestAuthorized, isSessionAuthorized } from "@/lib/admin-auth";
import { siteContentSchema } from "@/lib/site-content-schema";
import { getSiteContent, saveSiteContent } from "@/lib/site-content-store";

function internalError(defaultMessage: string, error: unknown) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: defaultMessage }, { status: 500 });
  }

  const details = error instanceof Error ? error.message : "unknown";
  return NextResponse.json({ error: `${defaultMessage} (${details})` }, { status: 500 });
}

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json(content);
  } catch (error) {
    return internalError("Impossible de charger le contenu.", error);
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  
  const isAuthorized = 
    (session && isSessionAuthorized(session)) || 
    isAdminRequestAuthorized(request.headers.get("authorization"));

  if (!isAuthorized) {
    return NextResponse.json({ error: "Acces refuse." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = siteContentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Payload invalide.",
          details: parsed.error.issues.slice(0, 12).map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 422 },
      );
    }

    const content = parsed.data;
    const result = await saveSiteContent(content);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
    }

    return internalError("Impossible de sauvegarder le contenu.", error);
  }
}
