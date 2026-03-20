import { useEffect, useRef } from "react";
import { segmentDisplayTimestamp } from "../../utils/parseTranscriptToConversation";

/**
 * @param {{
 *   segments: Array<{ id: string, role: 'agent' | 'customer', text: string }>,
 *   activeIndex: number,
 *   onSegmentClick?: (index: number) => void,
 * }} props
 */
export function ConversationTranscript({ segments, activeIndex, onSegmentClick }) {
  const refs = useRef([]);

  useEffect(() => {
    if (activeIndex < 0 || !refs.current[activeIndex]) return;
    refs.current[activeIndex].scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  if (!segments.length) {
    return <p className="text-sm text-slate-500">No transcript available.</p>;
  }

  return (
    <div className="flex flex-col gap-3 pr-1">
      {segments.map((seg, i) => {
        const isAgent = seg.role === "agent";
        const isActive = i === activeIndex;
        const speakerLabel = isAgent ? "Agent" : "Customer";
        const ts = segmentDisplayTimestamp(seg);

        return (
          <div key={seg.id} className={`flex ${isAgent ? "justify-start" : "justify-end"}`}>
            <button
              type="button"
              ref={(el) => {
                refs.current[i] = el;
              }}
              onClick={() => onSegmentClick?.(i)}
              className={`w-full max-w-[min(100%,34rem)] rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                isAgent
                  ? "border-sky-200/70 bg-sky-50/90 hover:bg-sky-50"
                  : "border-emerald-200/70 bg-emerald-50/90 hover:bg-emerald-50"
              } ${isActive ? "ring-2 ring-indigo-300 shadow-md" : "shadow-sm"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wide ${
                    isAgent ? "text-sky-700" : "text-emerald-700"
                  }`}
                >
                  {speakerLabel}
                </span>
                <span className="text-[11px] font-medium tabular-nums text-slate-500">{ts}</span>
              </div>
              <p className="mt-2 text-[15px] leading-7 text-slate-800">{seg.text}</p>
              {isActive && (
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                  Playing now
                </p>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
