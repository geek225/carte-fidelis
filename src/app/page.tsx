import { ModernLanding } from "@/components/modern-landing";
import { getSiteContent } from "@/lib/site-content-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getSiteContent();
  return <ModernLanding content={content} />;
}
