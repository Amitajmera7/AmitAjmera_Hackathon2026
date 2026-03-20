import { useCallback, useMemo } from "react";
import { useAnalyzedCalls } from "../context/AnalyzedCallsContext";
import { useTranscriptionPipeline } from "../hooks/useTranscriptionPipeline";
import { Header } from "../components/Header";
import { AppShell } from "../components/layout/AppShell";
import { AudioSourcePanel } from "../components/AudioSourcePanel";
import { DashboardHero } from "../components/dashboard/DashboardHero";
import { DashboardSummaryStrip } from "../components/dashboard/DashboardSummaryStrip";
import { DashboardCharts } from "../components/dashboard/DashboardCharts";
import { DashboardInsightsFeed } from "../components/dashboard/DashboardInsightsFeed";
import { DashboardRecentAnalyses } from "../components/dashboard/DashboardRecentAnalyses";
import { buildCallRecordFromTranscript } from "../utils/callRecord";
import { getAudioFileDurationSeconds } from "../utils/audioMetadata";
import { computeAggregateMetrics } from "../utils/aggregateMetrics";

export function MainDashboardPage() {
  const { calls, addCall } = useAnalyzedCalls();

  const onUploadSuccess = useCallback(
    async ({ transcript, file }) => {
      const mediaSeconds = await getAudioFileDurationSeconds(file);
      const record = buildCallRecordFromTranscript({
        transcript,
        title: file.name,
        filename: file.name,
        sourceType: "uploaded",
        durationSecondsFromMedia: mediaSeconds,
      });
      const url = URL.createObjectURL(file);
      addCall(record, url);
    },
    [addCall]
  );

  const {
    uploadFileName,
    uploadPhase,
    uploadError,
    queuedBehind,
    resetUpload,
    enqueueFiles,
  } = useTranscriptionPipeline({ onSuccess: onUploadSuccess });

  const metrics = useMemo(() => computeAggregateMetrics(calls), [calls]);
  const hasCalls = calls.length > 0;
  const demoMode = !hasCalls;

  return (
    <AppShell>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <DashboardHero hasCalls={hasCalls} callCount={calls.length} />

          <div id="upload-zone">
            <AudioSourcePanel
              uploadedFileName={uploadFileName}
              uploadPhase={uploadPhase}
              uploadError={uploadError}
              queuedBehind={queuedBehind}
              onFilesChosen={enqueueFiles}
              onClearUpload={resetUpload}
            />
          </div>

          <DashboardSummaryStrip metrics={metrics} demoMode={demoMode} />

          {hasCalls && <DashboardCharts metrics={metrics} calls={calls} />}

          <div
            className={
              hasCalls ? "grid gap-6 xl:grid-cols-3 xl:items-start" : "flex flex-col gap-6"
            }
          >
            <div className={hasCalls ? "flex flex-col gap-6 xl:col-span-2" : "flex flex-col gap-6"}>
              <DashboardRecentAnalyses calls={calls} />
            </div>
            {hasCalls && (
              <div className="flex flex-col gap-6 xl:sticky xl:top-24">
                <DashboardInsightsFeed calls={calls} />
              </div>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
