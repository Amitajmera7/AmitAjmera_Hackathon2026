import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAnalyzedCalls } from "../context/AnalyzedCallsContext";
import { Header } from "../components/Header";
import { AppShell } from "../components/layout/AppShell";
import { ControlCard } from "../components/ui/ControlCard";
import { ConversationTranscript } from "../components/call-detail/ConversationTranscript";
import { IntelligentAudioPlayer } from "../components/call-detail/IntelligentAudioPlayer";
import { parseTalkRatioParts } from "../utils/analyzeTranscript";
import {
  parseDurationLabelToSeconds,
  parseTranscriptToConversation,
} from "../utils/parseTranscriptToConversation";
import {
  buildConversationSummary,
  extractKeyMoments,
  extractSmartTags,
} from "../utils/conversationInsights";
import { sentimentClassFor } from "../components/design/sentimentTokens";

const PERF_LABELS = {
  communicationClarity: "Communication",
  politeness: "Politeness",
  businessKnowledge: "Knowledge",
  problemHandling: "Problem handling",
  listeningAbility: "Listening",
};

function formatWhen(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "—";
  }
}

function ScoreBar({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
      <div className="flex justify-between text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span className="tabular-nums text-slate-900">{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function FormattedTranscript({ text }) {
  const lines = (text || "").split("\n");
  return (
    <div className="space-y-3 font-mono text-[13px] leading-relaxed tracking-wide text-slate-200">
      {lines.map((line, i) => {
        const parts = line.split(/(\[\d+:\d+\])/g);
        return (
          <p key={i} className="break-words">
            {parts.map((part, j) =>
              /^\[\d+:\d+\]$/.test(part) ? (
                <span
                  key={j}
                  className="mr-2 inline-block rounded bg-slate-800 px-1.5 py-0.5 text-[11px] font-semibold text-sky-300"
                >
                  {part}
                </span>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

const PRIORITY_STYLES = {
  High: "bg-rose-50 text-rose-800 ring-rose-200",
  Medium: "bg-amber-50 text-amber-900 ring-amber-200",
  Low: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function CallDetailPage() {
  const { callId } = useParams();
  const { getCallById, getAudioUrlForCall } = useAnalyzedCalls();
  const call = getCallById(callId);
  const audioUrl = callId ? getAudioUrlForCall(callId) : null;

  if (!call) {
    return (
      <AppShell>
        <Header />
        <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-control">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">404</p>
            <p className="mt-2 text-xl font-bold text-slate-900">Call record not found</p>
            <p className="mt-2 text-sm text-slate-600">
              This analysis may have been cleared from storage, or the link is stale.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800"
            >
              Return to control center
            </Link>
          </div>
        </main>
      </AppShell>
    );
  }

  const a = call.analysis;
  const sentiment = a?.sentiment ?? "Neutral";
  const talk = parseTalkRatioParts(a?.talkRatio ?? "50% / 50%");
  const scores = a?.performanceScores ?? {};

  const audioRef = useRef(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);
  const durationSeconds = useMemo(
    () => parseDurationLabelToSeconds(call.durationLabel),
    [call.durationLabel]
  );
  const conversationSegments = useMemo(
    () =>
      parseTranscriptToConversation(call.transcript, {
        durationSeconds: durationSeconds ?? undefined,
      }),
    [call.transcript, durationSeconds]
  );
  const smartTags = useMemo(
    () => extractSmartTags(call.transcript || "", a),
    [call.transcript, a]
  );
  const convoSummary = useMemo(
    () => buildConversationSummary(conversationSegments, a),
    [conversationSegments, a]
  );
  const keyMoments = useMemo(
    () => extractKeyMoments(conversationSegments, a),
    [conversationSegments, a]
  );

  const handleTranscriptSeek = (index) => {
    const el = audioRef.current;
    if (!el || !conversationSegments[index]) return;
    el.currentTime = conversationSegments[index].startSeconds;
    void el.play().catch(() => {});
  };

  return (
    <AppShell>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700 transition hover:text-indigo-900"
        >
          ← Control center
        </Link>

        <header className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/25 to-slate-50/50 p-6 shadow-control sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  {call.sourceType === "uploaded" ? "Uploaded" : "Sample"}
                </span>
                {call.filename && (
                  <span className="truncate text-xs font-medium text-slate-500" title={call.filename}>
                    {call.filename}
                  </span>
                )}
              </div>
              <h1 className="mt-4 text-balance text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {call.title}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Analyzed {formatWhen(call.analyzedAt)} · Runtime {call.durationLabel}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${sentimentClassFor(sentiment)}`}
                >
                  {sentiment}
                </span>
                <span className="text-sm font-medium text-slate-600">{a?.sentimentLabel}</span>
              </div>
              <div className="mt-6 max-w-xl">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Talk mix</p>
                <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-900/5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all"
                    style={{ width: `${talk.agentPct}%` }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all"
                    style={{ width: `${talk.customerPct}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs font-semibold text-slate-600">
                  <span>Agent {talk.agentPct}%</span>
                  <span>Customer {talk.customerPct}%</span>
                </div>
              </div>
            </div>
            <div className="flex w-full shrink-0 flex-col items-center justify-center rounded-2xl border border-indigo-200/60 bg-white/90 px-8 py-8 shadow-inner sm:w-52">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Score</p>
              <p className="mt-2 text-6xl font-black tabular-nums tracking-tight text-indigo-600">
                {a?.overallScore ?? "—"}
              </p>
              <p className="mt-1 text-xs text-slate-500">Composite 0–100</p>
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ControlCard eyebrow="Briefing" title="Executive summary" interactive>
            <p className="text-sm leading-relaxed text-slate-700">{a?.summary}</p>
            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-800">
                Why this read?
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-indigo-950/90">{a?.aiRationale}</p>
            </div>
          </ControlCard>
          <ControlCard eyebrow="Snapshot" title="Sentiment & score" interactive>
            <div className="flex flex-wrap gap-4">
              <div
                className={`rounded-2xl px-5 py-4 ${sentimentClassFor(sentiment)}`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">Tone</p>
                <p className="mt-1 text-2xl font-black">{sentiment}</p>
              </div>
              <div className="min-w-[8rem] flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Quality</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{a?.overallScore ?? "—"}</p>
                <p className="mt-1 text-xs text-slate-500">Heuristic model</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">{a?.sentimentLabel}</p>
          </ControlCard>
        </div>

        <div className="mt-6">
          <ControlCard eyebrow="Balance" title="Talk time analysis" interactive>
            <p className="text-xs text-slate-500">Estimated from labeled speaker lines in the transcript.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-white p-4 ring-1 ring-slate-900/[0.03]">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Agent</p>
                <p className="mt-1 text-3xl font-black tabular-nums text-indigo-600">{talk.agentPct}%</p>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${talk.agentPct}%` }}
                  />
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-4 ring-1 ring-slate-900/[0.03]">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Customer</p>
                <p className="mt-1 text-3xl font-black tabular-nums text-sky-600">{talk.customerPct}%</p>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${talk.customerPct}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-400">Raw: {a?.talkRatio}</p>
          </ControlCard>
        </div>

        <div className="mt-6">
          <ControlCard eyebrow="Performance" title="Agent scoring matrix" interactive>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(PERF_LABELS).map(([key, label]) => (
                <ScoreBar key={key} label={label} value={scores[key] ?? 0} />
              ))}
            </div>
          </ControlCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ControlCard eyebrow="Coverage" title="Business questionnaire" interactive>
            <ul className="space-y-2">
              {(a?.questionnaireCoverage || []).map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-slate-800">{row.label}</span>
                  <span className="flex items-center gap-1.5 text-sm font-bold">
                    {row.covered ? (
                      <>
                        <span className="text-emerald-500" aria-hidden>
                          ✓
                        </span>
                        <span className="text-emerald-700">Yes</span>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-400" aria-hidden>
                          —
                        </span>
                        <span className="text-slate-500">No</span>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </ControlCard>
          <ControlCard eyebrow="Lexicon" title="Keyword intelligence" interactive>
            <div className="flex flex-wrap gap-2">
              {(a?.keywords || []).map((w) => (
                <span
                  key={w}
                  className="rounded-lg border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white px-3 py-1.5 text-sm font-semibold text-indigo-900 shadow-sm transition hover:border-indigo-200 hover:shadow"
                >
                  {w}
                </span>
              ))}
            </div>
          </ControlCard>
        </div>

        <div className="mt-6">
          <ControlCard eyebrow="Intelligence" title="Conversation timeline" interactive padded={false}>
            <div className="border-b border-slate-100 bg-white px-5 py-4">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-800">
                  Conversation at a glance
                </p>
                <p className="mt-1 text-sm text-slate-700">{convoSummary.about}</p>
                <p className="mt-1 text-sm text-slate-700">{convoSummary.wants}</p>
                <p className="mt-1 text-sm text-slate-700">{convoSummary.decided}</p>
              </div>
              {smartTags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {smartTags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-indigo-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div
              className={`grid rounded-b-2xl bg-slate-950 shadow-inner ring-1 ring-slate-900 ${
                audioUrl ? "lg:grid-cols-2" : ""
              }`}
            >
              {audioUrl && (
                <div className="border-b border-slate-800 p-5 lg:border-b-0 lg:border-r lg:border-slate-800">
                  <p className="text-xs text-slate-400">
                    Session-only blob URL — refresh clears audio.
                  </p>
                  <div className="mt-4 rounded-2xl border border-slate-800/80 bg-white p-4 ring-1 ring-white/5">
                    <IntelligentAudioPlayer
                      audioRef={audioRef}
                      src={audioUrl}
                      segments={conversationSegments}
                      onActiveSegmentChange={setActiveSegmentIndex}
                    />
                  </div>
                </div>
              )}
              <div
                className={`max-h-[min(28rem,55vh)] overflow-auto px-5 py-5 ${
                  audioUrl ? "" : "rounded-b-2xl"
                }`}
              >
                {conversationSegments.length > 0 ? (
                  <ConversationTranscript
                    segments={conversationSegments}
                    activeIndex={activeSegmentIndex}
                    onSegmentClick={audioUrl ? handleTranscriptSeek : undefined}
                  />
                ) : (call.transcript || "").trim() ? (
                  <FormattedTranscript text={call.transcript} />
                ) : (
                  <p className="text-sm text-slate-500">No transcript available.</p>
                )}
              </div>
            </div>
          </ControlCard>
        </div>

        <div className="mt-6">
          <ControlCard eyebrow="Signals" title="Key moments" interactive>
            <ul className="space-y-3">
              {keyMoments.length > 0 ? (
                keyMoments.map((h, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                    {h}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500">No key moments extracted from this transcript.</li>
              )}
            </ul>
          </ControlCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-white p-6 shadow-sm ring-1 ring-emerald-900/5">
            <h3 className="text-sm font-black uppercase tracking-wide text-emerald-900">
              Positive observations
            </h3>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-emerald-950/90">
              {(a?.positiveObservations || []).map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-emerald-500">+</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/80 to-white p-6 shadow-sm ring-1 ring-rose-900/5">
            <h3 className="text-sm font-black uppercase tracking-wide text-rose-900">
              Risks & friction
            </h3>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-rose-950/90">
              {(a?.negativeObservations || []).map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-rose-500">!</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <ControlCard eyebrow="Next steps" title="Follow-up actions" interactive>
            <ul className="flex flex-col gap-3">
              {(a?.followUpActions || []).map((act, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-4 transition hover:border-indigo-100 hover:bg-white sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-900">{act.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{act.description}</p>
                  </div>
                  <span
                    className={`w-fit shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${PRIORITY_STYLES[act.priority] ?? PRIORITY_STYLES.Low}`}
                  >
                    {act.priority}
                  </span>
                </li>
              ))}
            </ul>
          </ControlCard>
        </div>
      </main>
    </AppShell>
  );
}
