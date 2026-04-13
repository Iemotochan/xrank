import FeedShell from "@/components/FeedShell";
import { getRankings } from "@/lib/scraper";

export const revalidate = 900;

export default async function Page() {
  const initial = await getRankings("24h");

  return <FeedShell initialData={initial} />;
}
