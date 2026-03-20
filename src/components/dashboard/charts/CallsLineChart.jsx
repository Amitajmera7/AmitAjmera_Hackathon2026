export function CallsLineChart({ series }) {
  if (!series?.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
        No timeline data
      </div>
    );
  }

  const maxY = Math.max(...series.map((p) => p.cumulative), 1);
  const w = 100;
  const h = 48;
  const pad = 4;
  const pts = series.map((p, i) => {
    const x = pad + (i / Math.max(series.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - (p.cumulative / maxY) * (h - pad * 2);
    return `${x},${y}`;
  });

  const d = `M ${pts.join(" L ")}`;
  const areaD = `${d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-40 w-full overflow-visible"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="rgb(99 102 241)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#lineFill)" className="transition-opacity" />
        <path
          d={d}
          fill="none"
          stroke="rgb(79 70 229)"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {series.map((p, i) => {
          const x = pad + (i / Math.max(series.length - 1, 1)) * (w - pad * 2);
          const y = h - pad - (p.cumulative / maxY) * (h - pad * 2);
          return (
            <circle key={i} cx={x} cy={y} r="1.8" fill="white" stroke="rgb(79 70 229)" strokeWidth="0.8" />
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap justify-between gap-1 border-t border-slate-100 pt-2 text-[10px] font-medium text-slate-500">
        {series.map((p, i) => (
          <span key={i} className="max-w-[4rem] truncate" title={p.label}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
