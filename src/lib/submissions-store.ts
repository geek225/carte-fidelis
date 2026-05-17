import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { getSupabaseAdmin } from "@/lib/supabase";

const filePath = path.join(process.cwd(), "src", "data", "submissions.json");

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface FinancingSubmission {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  ville: string;
  quartier: string;
  situationMatrimoniale: string;
  phone: string;
  hasLocal: boolean;
  amount: string;
  createdAt: string;
}

export interface SubmissionsData {
  contact: ContactSubmission[];
  financing: FinancingSubmission[];
}

const DEFAULT_SUBMISSIONS: SubmissionsData = {
  contact: [],
  financing: [],
};

async function readLocalSubmissions(): Promise<SubmissionsData> {
  try {
    const file = await readFile(filePath, "utf8");
    return JSON.parse(file) as SubmissionsData;
  } catch {
    return DEFAULT_SUBMISSIONS;
  }
}

async function writeLocalSubmissions(data: SubmissionsData) {
  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write submissions locally:", err);
  }
}

export async function addContactSubmission(name: string, email: string, subject: string, message: string) {
  const newSubmission: ContactSubmission = {
    id: `c-${Date.now()}`,
    name,
    email,
    subject,
    message,
    createdAt: new Date().toISOString(),
  };

  // 1. Try Supabase
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { error } = await (supabase.from("contact_submissions") as any).insert({
        name,
        email,
        subject,
        message,
        created_at: newSubmission.createdAt,
      });

      if (!error) {
        return { success: true, mode: "supabase" };
      }
      console.warn("Supabase contact insert failed, falling back to local storage:", error.message);
    } catch (err) {
      console.warn("Supabase contact write failed, falling back to local storage:", err);
    }
  }

  // 2. Local fallback
  const localData = await readLocalSubmissions();
  localData.contact.unshift(newSubmission);
  await writeLocalSubmissions(localData);
  return { success: true, mode: "local" };
}

export async function addFinancingSubmission(
  nom: string,
  prenom: string,
  dateNaissance: string,
  ville: string,
  quartier: string,
  situationMatrimoniale: string,
  phone: string,
  hasLocal: boolean,
  amount: string,
) {
  const newSubmission: FinancingSubmission = {
    id: `f-${Date.now()}`,
    nom,
    prenom,
    dateNaissance,
    ville,
    quartier,
    situationMatrimoniale,
    phone,
    hasLocal,
    amount,
    createdAt: new Date().toISOString(),
  };

  // 1. Try Supabase
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { error } = await (supabase.from("financing_submissions") as any).insert({
        nom,
        prenom,
        date_naissance: dateNaissance,
        ville,
        quartier,
        situation_matrimoniale: situationMatrimoniale,
        phone,
        has_local: hasLocal,
        amount,
        created_at: newSubmission.createdAt,
      });

      if (!error) {
        return { success: true, mode: "supabase" };
      }
      console.warn("Supabase financing insert failed, falling back to local storage:", error.message);
    } catch (err) {
      console.warn("Supabase financing write failed, falling back to local storage:", err);
    }
  }

  // 2. Local fallback
  const localData = await readLocalSubmissions();
  localData.financing.unshift(newSubmission);
  await writeLocalSubmissions(localData);
  return { success: true, mode: "local" };
}

export async function getSubmissions(): Promise<SubmissionsData> {
  const supabase = getSupabaseAdmin();
  
  if (supabase) {
    try {
      // Fetch both from Supabase
      const [contactRes, financingRes] = await Promise.all([
        (supabase.from("contact_submissions") as any).select("*").order("created_at", { ascending: false }),
        (supabase.from("financing_submissions") as any).select("*").order("created_at", { ascending: false }),
      ]);

      if (!contactRes.error && !financingRes.error && contactRes.data && financingRes.data) {
        const contact = contactRes.data.map((c: any) => ({
          id: c.id?.toString() || `c-${c.created_at}`,
          name: c.name || "",
          email: c.email || "",
          subject: c.subject || "",
          message: c.message || "",
          createdAt: c.created_at || new Date().toISOString(),
        }));

        const financing = financingRes.data.map((f: any) => ({
          id: f.id?.toString() || `f-${f.created_at}`,
          nom: f.nom || "",
          prenom: f.prenom || "",
          dateNaissance: f.date_naissance || "",
          ville: f.ville || "",
          quartier: f.quartier || "",
          situationMatrimoniale: f.situation_matrimoniale || "",
          phone: f.phone || "",
          hasLocal: f.has_local ?? false,
          amount: f.amount || "",
          createdAt: f.created_at || new Date().toISOString(),
        }));

        return { contact, financing };
      }
      console.warn("Supabase fetch failed, fallback to local submissions:", contactRes.error?.message || financingRes.error?.message);
    } catch (err) {
      console.warn("Supabase submissions fetch failed, fallback to local submissions:", err);
    }
  }

  return readLocalSubmissions();
}
