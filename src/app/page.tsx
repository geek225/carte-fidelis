import { getSiteContent } from "@/lib/site-content-store";
import { FidelisSite } from "@/components/fidelis-site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getSiteContent();

  return <FidelisSite content={content} />;
}
