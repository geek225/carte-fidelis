import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isAdminAuthConfigured, isAdminRequestAuthorized, isSessionAuthorized } from "@/lib/admin-auth";

function isProtectedRequest(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // NEVER protect the login page or login endpoint or we get infinite loops
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return false;
  }

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

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/admin/login", request.url);
  // Pass origin url to redirect back after login if preferred later
  return NextResponse.redirect(loginUrl);
}

function unauthorizedJsonResponse() {
  return NextResponse.json(
    { error: "Authentification requise." },
    { status: 401 }
  );
}

export function proxy(request: NextRequest) {
  if (!isProtectedRequest(request)) {
    return NextResponse.next();
  }

  if (!isAdminAuthConfigured()) {
    return NextResponse.next();
  }

  // 1. Check session cookie (Primary)
  const sessionCookie = request.cookies.get("admin_session")?.value;
  if (sessionCookie && isSessionAuthorized(sessionCookie)) {
    return NextResponse.next();
  }

  // 2. Check legacy authorization header (API support fallback)
  const authorization = request.headers.get("authorization");
  if (authorization && isAdminRequestAuthorized(authorization)) {
    return NextResponse.next();
  }

  // If unauthorized, identify context. APIs get 401, GUI pages get redirection to custom login.
  const isApi = request.nextUrl.pathname.startsWith("/api/");
  
  if (isApi) {
    return unauthorizedJsonResponse();
  } else {
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/site-content", "/api/upload"],
};
