import { AdminDashboard } from "@/components/admin-dashboard";
import { getSiteContent } from "@/lib/site-content-store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const content = await getSiteContent();

  return <AdminDashboard initialContent={content} />;
}
