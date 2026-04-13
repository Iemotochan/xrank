"use client";

import type { RankingPeriod } from "@/lib/types";

const tabs: { key: RankingPeriod; label: string }[] = [
  { key: "24h", label: "24h" },
  { key: "1week", label: "1week" },
  { key: "1month", label: "1month" }
];

export default function PeriodTabs({
  active,
  onChange,
  disabled
}: {
  active: RankingPeriod;
  onChange: (value: RankingPeriod) => void;
  disabled?: boolean;
}) {
  return (
    <div className="glass fixed left-1/2 top-4 z-50 flex -translate-x-1/2 gap-2 rounded-full p-2">
      {tabs.map((tab) => {
        const isActive = tab.key === active;

        return (
          <button
            key={tab.key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(tab.key)}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              isActive
                ? "bg-[rgba(201,168,76,0.16)] text-[var(--gold-soft)] shadow-[0_10px_24px_rgba(201,168,76,0.12)]"
                : "text-[var(--muted)] hover:bg-white/5 hover:text-white"
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
