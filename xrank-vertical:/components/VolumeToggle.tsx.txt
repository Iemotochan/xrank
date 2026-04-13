"use client";

export default function VolumeToggle({
  muted,
  onToggle
}: {
  muted: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="glass rounded-full px-4 py-2 text-sm font-semibold text-[var(--gold-soft)]"
      aria-label={muted ? "音声をオン" : "音声をオフ"}
    >
      {muted ? "🔇 Mute" : "🔊 Sound"}
    </button>
  );
}
