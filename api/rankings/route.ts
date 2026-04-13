import { NextRequest, NextResponse } from "next/server";
import { getRankings } from "@/lib/scraper";
import type { RankingPeriod } from "@/lib/types";

export const dynamic = "force-dynamic";

const valid: RankingPeriod[] = ["24h", "1week", "1month"];

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get("period") as RankingPeriod | null;
  const value: RankingPeriod = valid.includes(period as RankingPeriod) ? (period as RankingPeriod) : "24h";

  try {
    const data = await getRankings(value);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=60"
      }
    });
  } catch (error) {
    console.error("[api/rankings] error:", error);

    return NextResponse.json(
      { error: "ランキングの取得に失敗しました。" },
      { status: 500 }
    );
  }
}
