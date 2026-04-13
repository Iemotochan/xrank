"use client";

import { useEffect, useRef } from "react";
import type { RankingVideoItem } from "@/lib/types";
import VolumeToggle from "@/components/VolumeToggle";

export default function VideoSlide({
  item,
  active,
  muted,
  onToggleMute
}: {
  item: RankingVideoItem;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    video.muted = muted;

    if (active) {
      video
        .play()
        .catch(() => {
          // muted autoplay best-effort
        });
    } else {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {}
    }
  }, [active, muted]);

  return (
    <section className="snap-slide flex items-center justify-center px-3 py-20 sm:px-6">
      <div className="chrome-glow" />

      <div className="mx-auto w-full max-w-md">
        <div className="video-frame aspect-[9/16] w-full">
          <video
            ref={ref}
            src={item.videoUrl}
            poster={item.thumbUrl ?? undefined}
            playsInline
            muted={muted}
            loop
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
            <div className="rank-pill px-4 py-2 text-sm font-extrabold">
              #{item.rank}
            </div>
            <VolumeToggle muted={muted} onToggle={onToggleMute} />
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 p-4">
            <div className="glass rounded-[24px] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gold-soft)]">
                {item.sourceName}
              </div>
              <div className="mt-2 text-lg font-bold tracking-[-0.03em] text-white">
                Ranked clip #{item.rank}
              </div>
              <div className="mt-2 text-sm leading-6 text-[var(--muted)]">
                画面中央の動画だけが呼吸する。外れたものは静かに眠る。
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={item.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="gold-btn rounded-full px-4 py-2 text-xs font-semibold"
                >
                  動画URLを開く
                </a>
                <a
                  href={item.pageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/8 bg-white/5 px-4 py-2 text-xs font-medium text-[var(--muted)]"
                >
                  元ランキング
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
