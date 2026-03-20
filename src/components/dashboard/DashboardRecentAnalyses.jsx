import { Link } from "react-router-dom";
import { sentimentClassFor } from "../design/sentimentTokens";

function formatWhen(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function DashboardRecentAnalyses({ calls }) {
  const recent = calls.slice(0, 8);

  if (!calls.length) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.02]">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600">
          Recent analyses
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">No sessions yet</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
          After you run the pipeline above, finished calls appear here with score and sentiment —
          same width as metrics and library for a single column grid.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.02]">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600">Your Result</p>
          <h2 className="text-lg font-bold text-slate-900">Recent analyses</h2>
          <p className="mt-0.5 text-sm text-slate-500">Newest first</p>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
          {calls.length} total
        </span>
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {recent.map((c) => {
          const s = c.analysis?.sentiment ?? "Neutral";
          return (
            <li key={c.id}>
              <Link
                to={`/calls/${c.id}`}
                className="group flex h-full flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate font-semibold text-slate-900 group-hover:text-indigo-700">
                    {c.title}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sentimentClassFor(s)}`}
                  >
                    {s}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>{formatWhen(c.analyzedAt)}</span>
                  <span className="font-bold tabular-nums text-slate-800">
                    {c.durationLabel} · {c.analysis?.overallScore ?? "—"} pts
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {calls.length > 8 && (
        <p className="mt-4 text-center text-xs text-slate-500">Showing 8 most recent.</p>
      )}
    </section>
  );
}
