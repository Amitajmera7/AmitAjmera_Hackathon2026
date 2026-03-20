export function DashboardHero({ hasCalls, callCount = 0 }) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border px-5 py-8 shadow-sm sm:px-8 sm:py-9 ${
        hasCalls
          ? "border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-indigo-50/25"
          : "border-slate-200/80 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-md shadow-indigo-900/10"
      }`}
    >
      {!hasCalls && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.14), transparent 45%)",
          }}
        />
      )}
      <div className="relative max-w-4xl">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${hasCalls ? "text-slate-500" : "text-indigo-200/95"}`}
        >
          Conversation Intelligence
        </p>
        <h2
          className={`mt-2 text-balance text-[1.9rem] font-semibold tracking-tight sm:text-[2.35rem] ${
            hasCalls ? "text-slate-900" : "text-white"
          }`}
        >
          {hasCalls
            ? "Conversation intelligence workspace"
            : "Transform conversations into intelligence"}
        </h2>
        <p
          className={`mt-3 max-w-3xl text-[15px] leading-7 sm:text-base ${
            hasCalls ? "text-slate-600" : "text-indigo-100/95"
          }`}
        >
          {hasCalls ? (
            <>
              Track recent calls, surface key insights quickly, and drill into each conversation with
              transcript intelligence and follow-up actions.
            </>
          ) : (
            <>
              Upload recordings to transcribe, analyze sentiment, and generate actionable follow-ups in
              one flow.
            </>
          )}
        </p>
        {hasCalls && (
          <ul className="mt-6 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
            {[`${callCount} analyzed calls`, "Insight feed enabled", "Detailed call reports"].map((t) => (
              <li
                key={t}
                className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/75 px-3 py-2"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
