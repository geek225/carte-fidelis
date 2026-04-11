import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { isAdminRequestAuthorized } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const uploadBucket = process.env.SUPABASE_UPLOAD_BUCKET ?? "site-assets";
const maxUploadSizeBytes = 5 * 1024 * 1024;

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
}

function makeObjectPath(fileName: string) {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `cms/${yyyy}/${mm}/${Date.now()}-${safeFileName(fileName)}`;
}

async function uploadToSupabase(file: File, buffer: Buffer) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  const objectPath = makeObjectPath(file.name);
  const { error: uploadError } = await supabase.storage.from(uploadBucket).upload(objectPath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (uploadError) {
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(uploadBucket).getPublicUrl(objectPath);
  if (!data.publicUrl) {
    throw new Error("Supabase public URL unavailable.");
  }

  return data.publicUrl;
}

function internalError(defaultMessage: string, error: unknown) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: defaultMessage }, { status: 500 });
  }

  const details = error instanceof Error ? error.message : "unknown";
  return NextResponse.json({ error: `${defaultMessage} (${details})` }, { status: 500 });
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Acces refuse." }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Content-Type invalide." }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Format invalide: image uniquement." }, { status: 400 });
    }

    if (file.size > maxUploadSizeBytes) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 5 Mo)." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabaseUrl = await uploadToSupabase(file, buffer);

    if (supabaseUrl) {
      return NextResponse.json({ path: supabaseUrl, mode: "supabase" });
    }

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error:
            "Supabase non configure pour l'upload en production. Definis NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY et SUPABASE_UPLOAD_BUCKET.",
        },
        { status: 503 },
      );
    }

    const fileName = `${Date.now()}-${safeFileName(file.name)}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, fileName);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);

    return NextResponse.json({ path: `/uploads/${fileName}`, mode: "local" });
  } catch (error) {
    return internalError("Upload impossible.", error);
  }
}
