export function Card({ title, eyebrow, children, className = "" }) {
  return (
    <section
      className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.02] ${className}`}
    >
      {(title || eyebrow) && (
        <header className="border-b border-slate-100/90 px-5 py-4">
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="mt-0.5 text-base font-bold text-slate-900">{title}</h2>
          )}
        </header>
      )}
      <div className="flex-1 px-5 py-4">{children}</div>
    </section>
  );
}
