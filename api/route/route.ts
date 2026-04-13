import { NextRequest, NextResponse } from "next/server";
import { getRankings } from "@/lib/scraper";
import type { RankingPeriod } from "@/lib/types";

export const dynamic = "force-dynamic";

const periods: RankingPeriod[] = ["24h", "1week", "1month"];

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await Promise.all(
      periods.map(async (period) => {
        const data = await getRankings(period, true);
        return {
          period,
          count: data.items.length,
          sourceName: data.sourceName,
          fallbackUsed: data.fallbackUsed,
          warning: data.warning ?? null
        };
      })
    );

    return NextResponse.json({
      ok: true,
      refreshedAt: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error("[api/cron/scrape] error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
