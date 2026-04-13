export type RankingPeriod = "24h" | "1week" | "1month";

export interface RankingVideoItem {
  rank: number;
  videoUrl: string;
  thumbUrl: string | null;
  pageUrl: string;
  sourceName: "twivideo" | "twihozon";
}

export interface RankingResponse {
  period: RankingPeriod;
  items: RankingVideoItem[];
  sourceName: "twivideo" | "twihozon" | "none";
  sourcePageUrl: string | null;
  fetchedAt: string;
  cacheTtlMs: number;
  fallbackUsed: boolean;
  warning?: string;
  error?: string;
}
