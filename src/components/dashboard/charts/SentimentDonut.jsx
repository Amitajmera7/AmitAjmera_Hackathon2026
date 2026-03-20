const COLORS = {
  Positive: "#34d399",
  Neutral: "#94a3b8",
  Negative: "#fb7185",
};

export function SentimentDonut({ sentimentSplit, total }) {
  const p = total ? (sentimentSplit.Positive / total) * 100 : 0;
  const n = total ? (sentimentSplit.Neutral / total) * 100 : 0;
  const neg = total ? (sentimentSplit.Negative / total) * 100 : 0;

  const pDeg = (p / 100) * 360;
  const nDeg = (n / 100) * 360;
  const negDeg = (neg / 100) * 360;

  const bg =
    total === 0
      ? "conic-gradient(from -90deg, #e2e8f8 0deg 360deg)"
      : `conic-gradient(from -90deg, ${COLORS.Positive} 0deg ${pDeg}deg, ${COLORS.Neutral} ${pDeg}deg ${pDeg + nDeg}deg, ${COLORS.Negative} ${pDeg + nDeg}deg ${pDeg + nDeg + negDeg}deg, ${COLORS.Negative} ${pDeg + nDeg + negDeg}deg 360deg)`;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
      <div
        className="relative h-44 w-44 shrink-0 rounded-full p-[10px] shadow-inner shadow-slate-900/10"
        style={{ background: bg }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white shadow-sm">
          <p className="text-2xl font-black tabular-nums text-slate-900">{total}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Calls</p>
        </div>
      </div>
      <ul className="flex flex-col gap-3 text-sm">
        {[
          { label: "Positive", count: sentimentSplit.Positive, color: COLORS.Positive },
          { label: "Neutral", count: sentimentSplit.Neutral, color: COLORS.Neutral },
          { label: "Negative", count: sentimentSplit.Negative, color: COLORS.Negative },
        ].map((row) => (
          <li key={row.label} className="flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
              style={{ backgroundColor: row.color }}
            />
            <span className="font-medium text-slate-700">{row.label}</span>
            <span className="ml-auto tabular-nums font-bold text-slate-900">
              {row.count}
              {total > 0 && (
                <span className="ml-1 text-xs font-semibold text-slate-500">
                  ({Math.round((row.count / total) * 100)}%)
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
