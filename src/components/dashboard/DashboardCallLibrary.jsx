import { Link } from "react-router-dom";
import { sentimentClassFor } from "../design/sentimentTokens";

function formatWhen(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function DashboardCallLibrary({ calls }) {
  if (!calls.length) return null;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.02]">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600">Archive</p>
          <h2 className="text-lg font-bold text-slate-900">Full call library</h2>
          <p className="mt-0.5 text-sm text-slate-500">Persisted locally · click any row for the report</p>
        </div>
      </div>
      <div className="overflow-x-auto px-2 pb-2">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <th className="px-3 py-3">Call</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Analyzed</th>
              <th className="px-3 py-3">Duration</th>
              <th className="px-3 py-3">Sentiment</th>
              <th className="px-3 py-3">Score</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((c) => {
              const s = c.analysis?.sentiment ?? "Neutral";
              const kw = (c.analysis?.keywords || [])[0] ?? "—";
              const actions = (c.analysis?.followUpActions || []).length;
              return (
                <tr
                  key={c.id}
                  className="border-b border-slate-100 transition-colors hover:bg-indigo-50/40"
                >
                  <td className="px-3 py-3 font-medium text-slate-900">
                    <Link
                      to={`/calls/${c.id}`}
                      className="font-semibold text-indigo-700 transition hover:text-indigo-900 hover:underline"
                    >
                      {c.title}
                    </Link>
                    <p className="mt-0.5 text-xs font-normal text-slate-500">Keyword: {kw}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {c.sourceType === "uploaded" ? "Uploaded" : "Sample"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{formatWhen(c.analyzedAt)}</td>
                  <td className="px-3 py-3 text-slate-600">{c.durationLabel}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${sentimentClassFor(s)}`}
                    >
                      {s}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-bold tabular-nums text-slate-900">
                    {c.analysis?.overallScore ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-slate-600">{actions}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
