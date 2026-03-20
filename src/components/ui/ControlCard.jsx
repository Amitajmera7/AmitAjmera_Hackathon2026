export function ControlCard({
  eyebrow,
  title,
  children,
  className = "",
  padded = true,
  interactive = false,
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.02] transition duration-200 ${
        interactive ? "hover:border-indigo-200/80 hover:shadow-md hover:shadow-indigo-500/5" : ""
      } ${className}`}
    >
      {(eyebrow || title) && (
        <header className="border-b border-slate-100/90 px-5 py-4">
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className={`font-bold text-slate-900 ${eyebrow ? "mt-1 text-base" : "text-lg"}`}>
              {title}
            </h2>
          )}
        </header>
      )}
      <div className={padded ? "px-5 py-4" : ""}>{children}</div>
    </section>
  );
}
