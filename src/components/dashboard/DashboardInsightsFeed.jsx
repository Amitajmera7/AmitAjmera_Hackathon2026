import { ControlCard } from "../ui/ControlCard";
import { sentimentClassFor } from "../design/sentimentTokens";

export function DashboardInsightsFeed({ calls }) {
  if (!calls.length) return null;

  const insights = [];
  for (const c of calls.slice(0, 5)) {
    const h = (c.analysis?.highlights || [])[0];
    const summary = c.analysis?.summary?.slice(0, 120);
    if (h)
      insights.push({
        id: `${c.id}-h`,
        callTitle: c.title,
        sentiment: c.analysis?.sentiment,
        text: h.length > 140 ? `${h.slice(0, 137)}…` : h,
        type: "highlight",
      });
    else if (summary)
      insights.push({
        id: `${c.id}-s`,
        callTitle: c.title,
        sentiment: c.analysis?.sentiment,
        text: summary + (c.analysis?.summary?.length > 120 ? "…" : ""),
        type: "summary",
      });
    if (insights.length >= 6) break;
  }

  if (!insights.length) {
    return (
      <ControlCard eyebrow="Signals" title="Recent insights" interactive className="h-fit">
        <p className="text-sm leading-relaxed text-slate-500">
          Highlights and summary clips from your newest analyses will appear here automatically.
        </p>
      </ControlCard>
    );
  }

  return (
    <ControlCard eyebrow="Signals" title="Recent insights" interactive className="h-fit">
      <ul className="space-y-4">
        {insights.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-slate-100/90 bg-slate-50/40 px-3 py-3 transition duration-200 hover:border-indigo-200/60 hover:bg-white hover:shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sentimentClassFor(item.sentiment)}`}
              >
                {item.sentiment}
              </span>
              <span className="truncate text-xs font-semibold text-slate-600">{item.callTitle}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.text}</p>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
              {item.type === "highlight" ? "AI highlight" : "Summary clip"}
            </p>
          </li>
        ))}
      </ul>
    </ControlCard>
  );
}
