import { Card } from "./ui/Card";
import { ProcessingPipeline } from "./ProcessingPipeline";

const PHASE_LABEL = {
  queued: "Queued…",
  uploading: "Uploading…",
  transcribing: "Transcribing…",
  analyzing: "Analyzing…",
  complete: "Wrapping up…",
  completed: "Completed",
  error: "Error",
};

export function AudioSourcePanel({
  uploadedFileName,
  uploadPhase,
  uploadError,
  queuedBehind = 0,
  onFilesChosen,
  onClearUpload,
}) {
  const pipelineBusy =
    uploadPhase === "uploading" ||
    uploadPhase === "transcribing" ||
    uploadPhase === "analyzing" ||
    uploadPhase === "complete";
  const hasUpload = Boolean(uploadedFileName);
  const showPhaseLine = Boolean(uploadPhase && PHASE_LABEL[uploadPhase]);
  const queueHint = queuedBehind > 0 ? `${queuedBehind} in queue after current file` : null;

  return (
    <Card title="Ingest audio" eyebrow="Pipeline" className="overflow-hidden shadow-md shadow-slate-900/[0.06] ring-1 ring-slate-900/[0.03]">
      <div className="rounded-xl border border-dashed border-indigo-200/50 bg-gradient-to-br from-slate-50/90 to-indigo-50/20 p-4 sm:p-5">
        <p className="text-xs font-semibold text-slate-700">Batch upload</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Files process sequentially through your API. Add to
          the queue anytime.
        </p>
        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 active:scale-[0.99]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span>Choose files</span>
          <input
            type="file"
            multiple
            accept=".wav,.mp3,audio/wav,audio/mpeg"
            className="sr-only"
            onChange={(e) => {
              const files = e.target.files;
              if (files?.length) onFilesChosen(files);
              e.target.value = "";
            }}
          />
        </label>

        {pipelineBusy && (
          <div className="mt-6 rounded-2xl bg-slate-900 px-4 py-6 text-center shadow-inner">
            {uploadedFileName && (
              <p className="mb-4 truncate text-xs font-medium text-slate-400" title={uploadedFileName}>
                {uploadedFileName}
              </p>
            )}
            <ProcessingPipeline activePhase={uploadPhase} />
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-sky-100">
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent"
                aria-hidden
              />
              <span>{PHASE_LABEL[uploadPhase]}</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Secure server round-trip — audio never hits the model in-browser.</p>
          </div>
        )}

        {queueHint && !pipelineBusy && (
          <p className="mt-3 text-center text-xs font-semibold text-amber-800">{queueHint}</p>
        )}
        {uploadError && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-800 ring-1 ring-rose-100">
            {uploadError}
          </p>
        )}
        {hasUpload && !pipelineBusy && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs ring-1 ring-slate-200">
              <span className="truncate text-slate-700" title={uploadedFileName}>
                {uploadedFileName}
              </span>
              <button
                type="button"
                onClick={onClearUpload}
                className="shrink-0 font-semibold text-indigo-700 hover:underline"
              >
                Cancel queue
              </button>
            </div>
            {showPhaseLine && (
              <p
                className={`text-xs font-semibold ${
                  uploadPhase === "error"
                    ? "text-rose-700"
                    : uploadPhase === "completed"
                      ? "text-emerald-700"
                      : "text-indigo-700"
                }`}
              >
                {PHASE_LABEL[uploadPhase]}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
