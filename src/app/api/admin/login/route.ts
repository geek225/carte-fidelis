import { NextResponse } from "next/server";
import { verifyAdminCredentials, getAdminSessionToken } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Identifiants manquants." }, { status: 400 });
    }

    const isValid = verifyAdminCredentials(username, password);

    if (!isValid) {
      return NextResponse.json({ error: "Utilisateur ou mot de passe incorrect." }, { status: 401 });
    }

    const token = getAdminSessionToken();
    const response = NextResponse.json({ success: true });
    
    // Set httpOnly secure cookie
    response.cookies.set({
      name: "admin_session",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Une erreur est survenue lors de la connexion." }, { status: 500 });
  }
}
