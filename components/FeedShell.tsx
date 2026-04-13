"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RankingPeriod, RankingResponse } from "@/lib/types";
import PeriodTabs from "@/components/PeriodTabs";
import ScrollHint from "@/components/ScrollHint";
import VideoSlide from "@/components/VideoSlide";

export default function FeedShell({ initialData }: { initialData: RankingResponse }) {
  const [period, setPeriod] = useState<RankingPeriod>(initialData.period);
  const [data, setData] = useState<RankingResponse>(initialData);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const items = useMemo(() => data.items, [data.items]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const slides = Array.from(root.querySelectorAll<HTMLElement>("[data-slide-index]"));
    if (slides.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex = activeIndex;
        let bestRatio = 0;

        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.slideIndex);
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = index;
          }
        }

        setActiveIndex(bestIndex);
      },
      {
        root,
        threshold: [0.25, 0.5, 0.7, 0.9]
      }
    );

    slides.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items.length, activeIndex]);

  const changePeriod = async (next: RankingPeriod) => {
    if (next === period || loading) return;

    setLoading(true);
    setPeriod(next);
    setActiveIndex(0);

    try {
      const res = await fetch(`/api/rankings?period=${next}`);
      const json = (await res.json()) as RankingResponse | { error: string };

      if (!res.ok || "error" in json) {
        throw new Error("failed");
      }

      setData(json);

      requestAnimationFrame(() => {
        containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      });
    } catch (error) {
      console.error("[FeedShell] period switch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[var(--bg)]">
      <div className="fireworks">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <PeriodTabs active={period} onChange={changePeriod} disabled={loading} />
      <ScrollHint />

      {data.warning && (
        <div className="glass fixed left-1/2 top-20 z-40 w-[min(92vw,520px)] -translate-x-1/2 rounded-2xl px-4 py-3 text-sm text-[var(--gold-soft)]">
          {data.warning}
        </div>
      )}

      {data.error && (
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="glass max-w-md rounded-3xl p-6 text-center">
            <div className="text-lg font-bold">取得に失敗しました</div>
            <div className="mt-2 text-sm text-[var(--muted)]">{data.error}</div>
          </div>
        </div>
      )}

      {!data.error && (
        <div ref={containerRef} className="snap-feed">
          {items.map((item, index) => (
            <div key={`${item.rank}-${item.videoUrl}`} data-slide-index={index}>
              <VideoSlide
                item={item}
                active={index === activeIndex}
                muted={muted}
                onToggleMute={() => setMuted((v) => !v)}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
