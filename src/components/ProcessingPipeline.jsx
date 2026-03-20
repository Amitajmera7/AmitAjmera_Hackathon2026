const STEPS = [
  { id: "uploading", label: "Upload" },
  { id: "transcribing", label: "Transcribe" },
  { id: "analyzing", label: "Analyze" },
  { id: "complete", label: "Done" },
];

export function ProcessingPipeline({ activePhase }) {
  const idx = STEPS.findIndex((s) => s.id === activePhase);
  const current = idx >= 0 ? idx : 0;

  return (
    <div className="w-full max-w-lg px-2">
      <div className="relative flex justify-between">
        <div
          className="absolute left-[12%] right-[12%] top-4 h-0.5 bg-slate-700/90"
          aria-hidden
        />
        {STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <span
                className={`relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shadow-lg transition ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-indigo-400 text-white ring-2 ring-indigo-200 ring-offset-2 ring-offset-slate-900"
                      : "border border-slate-600 bg-slate-800 text-slate-500"
                }`}
              >
                {active && (
                  <span
                    className="absolute inset-0 animate-ping rounded-full bg-indigo-400/40"
                    aria-hidden
                  />
                )}
                {done ? "✓" : index + 1}
              </span>
              <span
                className={`text-center text-[10px] font-bold uppercase tracking-wide ${
                  active ? "text-indigo-200" : done ? "text-emerald-300/90" : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
