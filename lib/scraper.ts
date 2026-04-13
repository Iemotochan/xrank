import { TTL_15M, withCache } from "@/lib/cache";
import type { RankingPeriod, RankingResponse, RankingVideoItem } from "@/lib/types";

const headers: HeadersInit = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  "accept-language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  pragma: "no-cache",
  "cache-control": "no-cache"
};

const SOURCE_URLS: Record<
  RankingPeriod,
  {
    primary: string[];
  }
> = {
  "24h": {
    primary: ["https://twivideo.net/?ranking"]
  },
  "1week": {
    primary: ["https://twivideo.net/?ranking&sort=week"]
  },
  "1month": {
    primary: [
      "https://twivideo.net/?ranking&sort=month",
      "https://twivideo.net/?trending"
    ]
  }
};

export async function getRankings(
  period: RankingPeriod,
  force = false
): Promise<RankingResponse> {
  return withCache(`rankings:${period}`, () => scrape(period), TTL_15M, force);
}

async function scrape(period: RankingPeriod): Promise<RankingResponse> {
  const urls = SOURCE_URLS[period].primary;

  for (const url of urls) {
    try {
      const html = await fetchHtml(url);
      const items = extractTwivideoRanking(html, url);

      if (items.length > 0) {
        return {
          period,
          items,
          sourceName: "twivideo",
          sourcePageUrl: url,
          fetchedAt: new Date().toISOString(),
          cacheTtlMs: TTL_15M,
          fallbackUsed: period === "1month" && url.includes("trending"),
          warning:
            period === "1month" && url.includes("trending")
              ? "1monthデータ取得に失敗したため、急上昇ソースへフォールバックしています。"
              : undefined
        };
      }
    } catch (error) {
      console.error("[scraper] source failed:", url, error);
    }
  }

  return {
    period,
    items: [],
    sourceName: "none",
    sourcePageUrl: null,
    fetchedAt: new Date().toISOString(),
    cacheTtlMs: TTL_15M,
    fallbackUsed: false,
    error: "ランキングの取得に失敗しました。少し時間をおいて再度お試しください。"
  };
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers,
    next: { revalidate: 900 }
  });

  if (!res.ok) {
    throw new Error(`fetch failed: ${res.status}`);
  }

  return res.text();
}

function extractTwivideoRanking(html: string, pageUrl: string): RankingVideoItem[] {
  const cleaned = html.replace(/\\\//g, "/").replace(/&amp;/g, "&");

  const pairPattern =
    /\[\!\[\]\((https:\/\/pbs\.twimg\.com\/[^)]+)\)\]\((https:\/\/video\.twimg\.com\/[^)\s]+\.mp4(?:\?[^)\s]+)?)\)\s*[\r\n\s]*No\.(\d+)/g;

  const results: RankingVideoItem[] = [];
  const seen = new Set<string>();

  let match: RegExpExecArray | null = null;
  while ((match = pairPattern.exec(cleaned)) !== null) {
    const thumbUrl = match[1];
    const videoUrl = match[2];
    const rank = Number(match[3]);

    if (!videoUrl || seen.has(videoUrl)) continue;
    seen.add(videoUrl);

    results.push({
      rank,
      videoUrl,
      thumbUrl,
      pageUrl,
      sourceName: "twivideo"
    });
  }

  if (results.length > 0) {
    return results.sort((a, b) => a.rank - b.rank);
  }

  const videos = [...cleaned.matchAll(/https:\/\/video\.twimg\.com\/[^\s)"']+\.mp4(?:\?[^\s)"']+)?/g)]
    .map((m) => m[0]);

  const thumbs = [...cleaned.matchAll(/https:\/\/pbs\.twimg\.com\/[^\s)"']+/g)]
    .map((m) => m[0]);

  const fallback: RankingVideoItem[] = [];
  const seen2 = new Set<string>();

  videos.forEach((videoUrl, index) => {
    if (seen2.has(videoUrl)) return;
    seen2.add(videoUrl);

    fallback.push({
      rank: index + 1,
      videoUrl,
      thumbUrl: thumbs[index] ?? null,
      pageUrl,
      sourceName: "twivideo"
    });
  });

  return fallback.slice(0, 50);
}
