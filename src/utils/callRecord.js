import {
  analyzeTranscript,
  estimateDurationSeconds,
} from "./analyzeTranscript";

const STORAGE_KEY = "call-analysis-dashboard-v1";

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `call-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function parseDurationLabelToMinutes(label) {
  if (!label || typeof label !== "string") return null;
  const m = label.trim().match(/^(\d+):(\d{2})$/);
  if (!m) return null;
  return parseInt(m[1], 10) + parseInt(m[2], 10) / 60;
}

function formatDurationLabel(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * @param {object} params
 * @param {string} params.transcript
 * @param {string} params.title
 * @param {'sample' | 'uploaded'} params.sourceType
 * @param {string} [params.sampleCallId]
 * @param {string} [params.filename]
 * @param {string} [params.durationLabel]
 * @param {number | null} [params.durationMinutesOverride]
 * @param {number | null} [params.durationSecondsFromMedia] actual audio length (uploads)
 */
export function buildCallRecordFromTranscript(params) {
  const {
    transcript,
    title,
    sourceType,
    sampleCallId,
    filename,
    durationLabel,
    durationMinutesOverride,
    durationSecondsFromMedia,
  } = params;

  const analysis = analyzeTranscript(transcript);
  const estSeconds = estimateDurationSeconds(transcript);

  let durationMinutes;
  let durationDisplay;

  const mediaSec =
    typeof durationSecondsFromMedia === "number" &&
    Number.isFinite(durationSecondsFromMedia) &&
    durationSecondsFromMedia > 0
      ? durationSecondsFromMedia
      : null;

  if (mediaSec != null) {
    durationMinutes = mediaSec / 60;
    durationDisplay = formatDurationLabel(Math.round(mediaSec));
  } else if (
    durationMinutesOverride != null &&
    !Number.isNaN(durationMinutesOverride)
  ) {
    durationMinutes = durationMinutesOverride;
    durationDisplay =
      durationLabel && durationLabel.includes(":")
        ? durationLabel
        : formatDurationLabel(Math.round(durationMinutes * 60));
  } else if (durationLabel && durationLabel.includes(":")) {
    durationMinutes = parseDurationLabelToMinutes(durationLabel);
    durationDisplay = durationLabel;
  } else {
    durationMinutes = estSeconds / 60;
    durationDisplay = formatDurationLabel(estSeconds);
  }

  const now = new Date().toISOString();
  return {
    id: newId(),
    title: title || filename || "Untitled call",
    filename: filename ?? null,
    sourceType,
    sampleCallId: sampleCallId ?? null,
    uploadedAt: now,
    analyzedAt: now,
    durationLabel: durationDisplay,
    durationMinutes: Math.round(durationMinutes * 100) / 100,
    transcript,
    analysis,
  };
}

function migrateRecord(record) {
  if (!record?.transcript || !record?.analysis) return record;
  const a = record.analysis;
  const needs =
    a.overallScore == null ||
    !Array.isArray(a.questionnaireCoverage) ||
    !Array.isArray(a.positiveObservations);
  if (!needs) return record;
  return { ...record, analysis: analyzeTranscript(record.transcript) };
}

export function loadCallsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateRecord);
  } catch {
    return [];
  }
}

export function saveCallsToStorage(calls) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calls));
  } catch {
    /* ignore quota */
  }
}

export { STORAGE_KEY };
