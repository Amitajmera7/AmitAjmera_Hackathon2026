import { Card } from "./ui/Card";
import { ProcessingPipeline } from "./ProcessingPipeline";

const SOURCE_COPY = {
  idle: "No recording loaded",
  sample: "Sample call",
  upload: "Uploaded file",
};

export function TranscriptPanel({
  transcript,
  sourceKind,
  sourceDetail,
  processingLabel,
  processingPipelinePhase,
  tone = "default",
}) {
  const sourceTitle = SOURCE_COPY[sourceKind] ?? SOURCE_COPY.idle;
  const isProcessing = Boolean(processingPipelinePhase);
  const isError = tone === "error";

  return (
    <Card title="Transcript" eyebrow="Conversation">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-slate-100 pb-3">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {sourceTitle}
          </span>
          {sourceDetail ? (
            <span className="text-sm font-medium text-slate-900">{sourceDetail}</span>
          ) : sourceKind === "upload" && isError ? (
            <span className="text-sm text-slate-500">
              No file in flight — use the audio panel to pick a valid recording.
            </span>
          ) : sourceKind === "idle" ? (
            <span className="text-sm text-slate-500">
              Choose a .wav or .mp3 in the panel on the left to begin.
            </span>
          ) : null}
        </div>

        {isProcessing && (
          <div className="flex flex-col items-center gap-6 rounded-xl bg-slate-900/95 px-4 py-8">
            <ProcessingPipeline activePhase={processingPipelinePhase} />
            <p className="text-center text-sm font-medium tracking-wide text-sky-100">
              {processingLabel}
            </p>
            <p className="text-center text-xs text-slate-400">
              Audio is sent to your server only — not processed in the browser.
            </p>
          </div>
        )}

        {!isProcessing && isError && processingLabel && (
          <div className="flex min-h-[min(12rem,35vh)] flex-col items-center justify-center gap-3 rounded-xl border border-rose-200/60 bg-rose-950/40 px-6 py-10 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-rose-300">
              Transcription failed
            </p>
            <p className="max-w-md text-sm leading-relaxed text-rose-100">{processingLabel}</p>
            <p className="text-xs text-rose-200/70">
              Insights below stay empty until a transcript is available.
            </p>
          </div>
        )}

        {!isProcessing && !isError && (
          <pre className="max-h-[min(28rem,55vh)] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-900/95 p-4 font-mono text-xs leading-relaxed text-slate-100">
            {transcript || (
              <span className="text-slate-500 italic">
                {sourceKind === "idle"
                  ? "Transcript will appear here after upload."
                  : "No transcript to display."}
              </span>
            )}
          </pre>
        )}
      </div>
    </Card>
  );
}
