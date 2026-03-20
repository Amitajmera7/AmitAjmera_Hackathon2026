import { useCallback, useEffect, useRef, useState } from "react";
import { formatPlaybackTime, getActiveSegmentIndex } from "../../utils/conversationPlayback";

/**
 * @param {{
 *   audioRef: React.MutableRefObject<HTMLAudioElement | null>,
 *   src: string,
 *   segments: { id: string, role: 'agent' | 'customer', startSeconds: number, endSeconds: number }[],
 *   onActiveSegmentChange?: (index: number) => void,
 * }} props
 */
export function IntelligentAudioPlayer({ audioRef, src, segments, onActiveSegmentChange }) {
  const barRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);

  const tick = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    const t = el.currentTime;
    setCurrentTime(t);
    const idx = getActiveSegmentIndex(segments, t);
    onActiveSegmentChange?.(idx);
  }, [audioRef, segments, onActiveSegmentChange]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onLoaded = () => {
      setDuration(Number.isFinite(el.duration) ? el.duration : 0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("durationchange", onLoaded);
    el.addEventListener("timeupdate", tick);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onPause);
    onLoaded();
    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("durationchange", onLoaded);
      el.removeEventListener("timeupdate", tick);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onPause);
    };
  }, [audioRef, src, tick]);

  useEffect(() => {
    tick();
  }, [segments, tick]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  const seekFromClientX = (clientX) => {
    const el = audioRef.current;
    const bar = barRef.current;
    if (!el || !bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const spanEnd = segments.length ? segments[segments.length - 1].endSeconds : 0;
    const total = Math.max(duration || 0, spanEnd, 1);
    el.currentTime = ratio * total;
    tick();
  };

  const onBarClick = (e) => {
    seekFromClientX(e.clientX);
  };

  const onBarKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const el = audioRef.current;
    const spanEnd = segments.length ? segments[segments.length - 1].endSeconds : 0;
    const total = Math.max(duration || 0, spanEnd, 1);
    if (!el || total <= 0) return;
    const delta = e.key === "ArrowLeft" ? -5 : 5;
    el.currentTime = Math.min(total, Math.max(0, el.currentTime + delta));
    tick();
  };

  const spanEnd = segments.length ? segments[segments.length - 1].endSeconds : 0;
  const timelineTotal = Math.max(duration || 0, spanEnd, 1);
  const pct = Math.min(100, (currentTime / timelineTotal) * 100);
  const activeIdx = getActiveSegmentIndex(segments, currentTime);

  return (
    <div className="space-y-3">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 pl-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2 text-xs font-semibold tabular-nums text-slate-600">
            <span>{formatPlaybackTime(currentTime)}</span>
            <span className="text-slate-400">
              {formatPlaybackTime(duration > 0 ? duration : timelineTotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div
          ref={barRef}
          role="slider"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={Math.round(timelineTotal)}
          aria-valuenow={Math.round(currentTime)}
          aria-label="Seek audio"
          onClick={onBarClick}
          onKeyDown={onBarKeyDown}
          className="relative h-2.5 cursor-pointer select-none overflow-hidden rounded-full bg-slate-200/90 ring-1 ring-slate-900/5"
        >
          <div className="absolute inset-0 flex">
            {segments.map((seg, i) => {
              const w = ((seg.endSeconds - seg.startSeconds) / timelineTotal) * 100;
              const isActive = i === activeIdx;
              return (
                <div
                  key={seg.id}
                  role="presentation"
                  className={`h-full transition-[filter,box-shadow] duration-200 ${
                    seg.role === "agent"
                      ? "bg-blue-500/90"
                      : "bg-emerald-500/90"
                  } ${isActive ? "brightness-110 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]" : ""}`}
                  style={{ width: `${w}%` }}
                />
              );
            })}
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 bg-slate-900/15"
            style={{ width: `${100 - pct}%` }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 w-0.5 rounded-full bg-white shadow"
            style={{ left: `calc(${pct}% - 1px)` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-blue-500/90" /> Agent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-emerald-500/90" /> Customer
          </span>
        </div>
      </div>
    </div>
  );
}
