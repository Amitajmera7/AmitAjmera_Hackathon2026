import { Card } from "./ui/Card";

const SENTIMENT_BADGE = {
  Positive: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80",
  Negative: "bg-rose-100 text-rose-900 ring-1 ring-rose-200/80",
  Neutral: "bg-slate-100 text-slate-800 ring-1 ring-slate-200",
};

function buildStatRows(insights) {
  const { talkRatio, objections } = insights;
  return [
    {
      label: "Talk ratio",
      value: talkRatio,
      hint: "Agent / caller (by line)",
    },
    {
      label: "Objections",
      value: String(objections),
      hint: "Keyword hits (concern, risk, blocker)",
    },
  ];
}

export function InsightsPanel({ insights, placeholder, placeholderTone = "muted" }) {
  if (placeholder) {
    const box =
      placeholderTone === "processing"
        ? "border-sky-100 bg-sky-50/50 text-sky-900/80"
        : "border-slate-200 bg-slate-50/80 text-slate-600";
    return (
      <Card title="AI insights" eyebrow="Signals">
        <p
          className={`rounded-xl border border-dashed px-4 py-10 text-center text-sm leading-relaxed ${box}`}
        >
          {placeholder}
        </p>
      </Card>
    );
  }

  const { summary, highlights, sentiment, sentimentLabel, aiRationale } = insights;
  const rationaleText =
    aiRationale?.trim() ||
    "Derived from keyword signals, talk balance, and simple playbooks on this transcript.";
  const statRows = buildStatRows(insights);
  const badgeClass = SENTIMENT_BADGE[sentiment] ?? SENTIMENT_BADGE.Neutral;

  return (
    <Card title="AI insights" eyebrow="Signals">
      <div className="mb-5 rounded-xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white px-5 py-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Executive summary
        </p>
        <p className="mt-2 text-base font-medium leading-relaxed text-slate-900">{summary}</p>
      </div>

      <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
          Why this result?
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-sky-950/90">{rationaleText}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-900/5 sm:col-span-1">
          <p className="text-xs font-medium text-slate-500">Sentiment</p>
          <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-bold ${badgeClass}`}>
            {sentiment}
          </p>
          <p className="mt-2 text-xs text-slate-600">{sentimentLabel}</p>
        </div>
        {statRows.map((row) => (
          <div
            key={row.label}
            className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
          >
            <p className="text-xs font-medium text-slate-500">{row.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{row.value}</p>
            {row.hint && <p className="mt-0.5 text-xs text-slate-500">{row.hint}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Highlights</p>
        <ul className="mt-3 space-y-2">
          {highlights.map((item, index) => (
            <li
              key={`${index}-${item.slice(0, 32)}`}
              className="flex gap-2 text-sm text-slate-700"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
