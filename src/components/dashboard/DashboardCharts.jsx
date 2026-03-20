import { ControlCard } from "../ui/ControlCard";
import { SentimentDonut } from "./charts/SentimentDonut";
import { CallsLineChart } from "./charts/CallsLineChart";
import { KeywordBarChart } from "./charts/KeywordBarChart";

export function DashboardCharts({ metrics, calls }) {
  if (!calls.length) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <ControlCard eyebrow="Distribution" title="Sentiment mix" interactive>
        <SentimentDonut sentimentSplit={metrics.sentimentSplit} total={metrics.totalCalls} />
      </ControlCard>
      <ControlCard eyebrow="Velocity" title="Calls over time" interactive>
        <p className="mb-3 text-xs text-slate-500">
          Cumulative analyzed calls by completion order (chronological).
        </p>
        <CallsLineChart series={metrics.timelineSeries} />
      </ControlCard>
      <ControlCard eyebrow="Lexicon" title="Top keywords" interactive>
        <p className="mb-3 text-xs text-slate-500">Weighted by frequency across your library.</p>
        <KeywordBarChart keywordCounts={metrics.keywordCounts} />
      </ControlCard>
    </div>
  );
}
