function IconCalls() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}
function IconScore() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}
function IconSentiment() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
function IconClock() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
function IconActions() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  );
}

function MetricCard({ icon, label, value, sub, accent = "indigo", muted = false }) {
  const ring = {
    indigo: "group-hover:ring-indigo-200/60",
    violet: "group-hover:ring-violet-200/60",
    emerald: "group-hover:ring-emerald-200/60",
    amber: "group-hover:ring-amber-200/60",
    rose: "group-hover:ring-rose-200/60",
  };
  const iconBg = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.03] transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${ring[accent]} ${
        muted
          ? "border-dashed border-slate-200 from-slate-50/80 to-slate-100/40 opacity-80"
          : "border-slate-200/80 from-white to-slate-50/50"
      }`}
    >
      <div
        className={`mb-3 inline-flex rounded-xl p-2 ${muted ? "bg-slate-200/50 text-slate-400" : iconBg[accent]}`}
      >
        {icon}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p
        className={`mt-2 text-3xl font-black tabular-nums tracking-tight ${
          muted ? "text-slate-400" : "text-slate-900"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className={`mt-2 text-xs leading-snug ${muted ? "text-slate-400" : "text-slate-500"}`}>{sub}</p>
      )}
    </div>
  );
}

export function DashboardSummaryStrip({ metrics, demoMode }) {
  const { totalCalls, sentimentSplit, averageScore, actionItemsTotal } = metrics;

  const fmtDur =
    metrics.avgDurationMinutes != null
      ? `${metrics.avgDurationMinutes < 10 ? metrics.avgDurationMinutes.toFixed(1) : Math.round(metrics.avgDurationMinutes)} min`
      : "—";

  const sentimentValue = demoMode
    ? "—"
    : `${sentimentSplit.Positive}↑ ${sentimentSplit.Neutral}○ ${sentimentSplit.Negative}↓`;

  const sentimentSub = demoMode
    ? "Populates after your first analysis"
    : `Positive ${sentimentSplit.Positive} · Neutral ${sentimentSplit.Neutral} · Negative ${sentimentSplit.Negative}`;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <MetricCard
        icon={<IconCalls />}
        label="Total processed"
        value={demoMode ? "0" : String(totalCalls)}
        sub={demoMode ? "Upload audio to begin" : "Saved in this workspace"}
        accent="indigo"
        muted={demoMode}
      />
      <MetricCard
        icon={<IconScore />}
        label="Avg call score"
        value={demoMode ? "—" : averageScore != null ? `${averageScore}` : "—"}
        sub="0–100 model confidence"
        accent="emerald"
        muted={demoMode}
      />
      <MetricCard
        icon={<IconSentiment />}
        label="Sentiment split"
        value={sentimentValue}
        sub={sentimentSub}
        accent="violet"
        muted={demoMode}
      />
      <MetricCard
        icon={<IconClock />}
        label="Avg duration"
        value={demoMode ? "—" : fmtDur}
        sub="Estimated from transcript"
        accent="amber"
        muted={demoMode}
      />
      <MetricCard
        icon={<IconActions />}
        label="Action items"
        value={demoMode ? "0" : String(actionItemsTotal)}
        sub="Follow-ups detected"
        accent="rose"
        muted={demoMode}
      />
    </div>
  );
}
