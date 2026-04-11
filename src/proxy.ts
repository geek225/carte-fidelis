import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isAdminAuthConfigured, isAdminRequestAuthorized } from "@/lib/admin-auth";

function isProtectedRequest(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    return true;
  }

  if (pathname === "/api/upload") {
    return true;
  }

  if (pathname === "/api/site-content" && request.method !== "GET") {
    return true;
  }

  return false;
}

function unauthorizedResponse() {
  return new NextResponse("Authentification requise.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Fidelis Admin", charset="UTF-8"',
    },
  });
}

function missingConfigResponse() {
  return NextResponse.json(
    {
      error:
        "Configuration admin manquante: definir ADMIN_BASIC_AUTH_USER et ADMIN_BASIC_AUTH_PASSWORD.",
    },
    { status: 503 },
  );
}

export function proxy(request: NextRequest) {
  if (!isProtectedRequest(request)) {
    return NextResponse.next();
  }

  if (!isAdminAuthConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return missingConfigResponse();
    }

    return NextResponse.next();
  }

  const authorization = request.headers.get("authorization");
  if (!isAdminRequestAuthorized(authorization)) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/site-content", "/api/upload"],
};
