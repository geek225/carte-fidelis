import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { SiteContent } from "@/lib/site-content-schema";
import { getSupabaseAdmin } from "@/lib/supabase";

const dataFilePath = path.join(process.cwd(), "src", "data", "site-content.json");
const tableName = process.env.SUPABASE_SITE_CONTENT_TABLE ?? "site_content";
const rowId = process.env.SUPABASE_SITE_CONTENT_ROW_ID ?? "main";

type SupabaseLooseClient = {
  from: (table: string) => {
    select: (query: string) => {
      eq: (column: string, value: string) => {
        single: () => Promise<{ data: { content?: SiteContent } | null; error: { message?: string } | null }>;
      };
    };
    upsert: (
      value: { id: string; content: SiteContent; updated_at: string },
      options: { onConflict: string },
    ) => Promise<{ error: { message?: string } | null }>;
  };
};

async function readLocalContent() {
  const file = await readFile(dataFilePath, "utf8");
  return JSON.parse(file) as SiteContent;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeSiteContent<T>(base: T, override: unknown): T {
  if (Array.isArray(base)) {
    return (Array.isArray(override) ? override : base) as T;
  }

  if (isPlainObject(base) && isPlainObject(override)) {
    const merged: Record<string, unknown> = { ...base };

    for (const [key, baseValue] of Object.entries(base)) {
      merged[key] = mergeSiteContent(baseValue, override[key]);
    }

    return merged as T;
  }

  return (override ?? base) as T;
}

async function writeLocalContent(content: SiteContent) {
  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(content, null, 2), "utf8");
}

export async function getSiteContent() {
  const defaultContent = await readLocalContent();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const client = supabase as unknown as SupabaseLooseClient;
    const { data, error } = await client
      .from(tableName)
      .select("content")
      .eq("id", rowId)
      .single();

    if (!error && data?.content) {
      return mergeSiteContent(defaultContent, data.content);
    }
  }

  return defaultContent;
}

export async function saveSiteContent(content: SiteContent) {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const client = supabase as unknown as SupabaseLooseClient;
    const { error } = await client.from(tableName).upsert(
      {
        id: rowId,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) {
      throw new Error(`Supabase save failed: ${error.message}`);
    }

    return { mode: "supabase" as const };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Supabase non configure en production. Definis NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  await writeLocalContent(content);
  return { mode: "local" as const };
}
