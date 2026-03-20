export function KeywordBarChart({ keywordCounts }) {
  if (!keywordCounts?.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">Keyword frequency appears after analyses.</p>
    );
  }

  const max = Math.max(...keywordCounts.map((k) => k.count), 1);

  return (
    <div className="flex flex-col gap-3">
      {keywordCounts.slice(0, 6).map((row) => (
        <div key={row.word}>
          <div className="mb-1 flex justify-between text-xs font-medium">
            <span className="capitalize text-slate-700">{row.word}</span>
            <span className="tabular-nums text-slate-500">{row.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-500"
              style={{ width: `${Math.max(8, (row.count / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
