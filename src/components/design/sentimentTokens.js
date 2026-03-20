/** Shared sentiment badge styles (Tailwind classes) */
export const sentimentBadge = {
  Positive:
    "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80 shadow-emerald-900/5",
  Neutral: "bg-slate-100 text-slate-800 ring-1 ring-slate-200/90 shadow-slate-900/5",
  Negative: "bg-rose-50 text-rose-800 ring-1 ring-rose-200/80 shadow-rose-900/5",
};

export function sentimentClassFor(s) {
  return sentimentBadge[s] ?? sentimentBadge.Neutral;
}
