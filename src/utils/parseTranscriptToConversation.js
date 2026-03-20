/**
 * @typedef {{
 *   id: string,
 *   speakerLabel: string,
 *   role: 'agent' | 'customer',
 *   text: string,
 *   timestamp: string | null,
 *   startSeconds: number,
 *   endSeconds: number
 * }} ConversationSegment
 */

const SPEAKER_LINE =
  /^\s*\[(\d+:\d+)\]\s*([^:]+):\s*(.*)$/i;

/** @param {string} raw */
export function speakerRoleFromLabel(raw) {
  const s = raw.trim().toLowerCase();
  if (
    /^(agent|csm|support|rep|sales|host|assistant|advisor|alex)$/i.test(raw.trim())
  ) {
    return "agent";
  }
  if (
    /^(caller|customer|client|user|buyer|lead)$/i.test(raw.trim())
  ) {
    return "customer";
  }
  return "unknown";
}

/** @param {string} ts */
export function timestampToSeconds(ts) {
  if (!ts) return 0;
  const m = String(ts).match(/^(\d+):(\d{2})$/);
  if (!m) return 0;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

/**
 * @param {string | null | undefined} label e.g. "2:07"
 * @returns {number | null}
 */
export function parseDurationLabelToSeconds(label) {
  if (!label || typeof label !== "string") return null;
  const m = label.trim().match(/^(\d+):(\d{2})$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

/**
 * @param {string} transcript
 * @param {{ durationSeconds?: number | null }} options
 * @returns {ConversationSegment[]}
 */
export function parseTranscriptToConversation(transcript, options = {}) {
  const text = transcript ?? "";
  const lines = text.split(/\n/);
  let explicitSpeakerLineCount = 0;
  /** @type {{ speakerLabel: string, role: string, timestamp: string | null, text: string }[]} */
  const raw = [];
  let current = null;

  for (const line of lines) {
    const m = line.match(SPEAKER_LINE);
    if (m) {
      explicitSpeakerLineCount++;
      if (current) raw.push(current);
      const speakerLabel = m[2].trim();
      let role = speakerRoleFromLabel(speakerLabel);
      current = {
        speakerLabel,
        role,
        timestamp: m[1],
        text: (m[3] || "").trim(),
      };
    } else if (current && line.trim()) {
      current.text += (current.text ? "\n" : "") + line.trim();
    } else if (!current && line.trim()) {
      current = {
        speakerLabel: "Line",
        role: "unknown",
        timestamp: null,
        text: line.trim(),
      };
    }
  }
  if (current) raw.push(current);

  let segments = raw.flatMap((r, i) => {
    let role = r.role;
    if (role === "unknown") {
      role = i % 2 === 0 ? "agent" : "customer";
    }
    const chunks = splitIntoConversationChunks(cleanTranscriptText(r.text));
    return chunks.map((chunk, j) => ({
      id: `seg-${i}-${j}`,
      speakerLabel: r.speakerLabel,
      role,
      text: chunk,
      timestamp: r.timestamp,
      startSeconds: 0,
      endSeconds: 0,
    }));
  });

  if (segments.length === 0) {
    const chunks = text
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
    segments = chunks.flatMap((t, i) => {
      const split = splitIntoConversationChunks(cleanTranscriptText(t));
      return split.map((chunk, j) => ({
        id: `alt-${i}-${j}`,
        speakerLabel: i % 2 === 0 ? "Agent" : "Customer",
        role: i % 2 === 0 ? "agent" : "customer",
        text: chunk,
        timestamp: null,
        startSeconds: 0,
        endSeconds: 0,
      }));
    });
  }

  // If transcript had no explicit "Speaker:" lines, force readable dialogue flow.
  if (explicitSpeakerLineCount === 0 && segments.length > 0) {
    segments = segments.map((seg, i) => ({
      ...seg,
      role: i % 2 === 0 ? "agent" : "customer",
      speakerLabel: i % 2 === 0 ? "Agent" : "Customer",
    }));
  }

  const total =
    typeof options.durationSeconds === "number" &&
    Number.isFinite(options.durationSeconds) &&
    options.durationSeconds > 0
      ? options.durationSeconds
      : null;

  assignSegmentTiming(segments, total);
  return segments;
}

/**
 * @param {ConversationSegment[]} segments
 * @param {number | null} totalSeconds
 */
function assignSegmentTiming(segments, totalSeconds) {
  const n = segments.length;
  if (n === 0) return;

  const cues = segments.map((s) =>
    s.timestamp != null ? timestampToSeconds(s.timestamp) : null
  );
  const allTs = cues.every((c) => c != null);

  if (allTs) {
    const gap = [];
    for (let i = 0; i < n; i++) {
      if (i < n - 1) gap.push(Math.max(0.4, cues[i + 1] - cues[i]));
      else gap.push(6);
    }
    const sumGap = gap.reduce((a, b) => a + b, 0);
    const T = totalSeconds && totalSeconds > 0 ? totalSeconds : sumGap;
    let acc = 0;
    segments.forEach((s, i) => {
      s.startSeconds = acc;
      acc += (gap[i] / sumGap) * T;
      s.endSeconds = acc;
    });
    return;
  }

  const T = totalSeconds && totalSeconds > 0 ? totalSeconds : Math.max(90, n * 18);
  const weights = segments.map((s) => Math.max(8, s.text.length));
  const sumW = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  segments.forEach((s, i) => {
    s.startSeconds = acc;
    acc += (weights[i] / sumW) * T;
    s.endSeconds = acc;
  });
}

/**
 * Display label: transcript cue [mm:ss] or derived from segment start.
 * @param {ConversationSegment} segment
 */
export function segmentDisplayTimestamp(segment) {
  if (segment.timestamp) return segment.timestamp;
  const s = Math.floor(segment.startSeconds ?? 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

/** @param {string} text */
function cleanTranscriptText(text) {
  if (!text) return "";
  return text
    .replace(/\b(um+|uh+|er+|ah+)\b/gi, "")
    .replace(/\b(you know|i mean)\b/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();
}

/** @param {string} text */
function splitIntoConversationChunks(text) {
  const normalized = String(text || "").trim();
  if (!normalized) return [];

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return [];

  /** @type {string[]} */
  const out = [];
  const MAX_CHARS = 210;
  for (let i = 0; i < sentences.length; ) {
    const first = sentences[i];
    const second = sentences[i + 1];
    if (!second) {
      out.push(...splitLongSentence(first, MAX_CHARS));
      i += 1;
      continue;
    }
    const pair = `${first} ${second}`;
    if (pair.length <= MAX_CHARS) {
      out.push(pair);
      i += 2;
    } else {
      out.push(...splitLongSentence(first, MAX_CHARS));
      i += 1;
    }
  }
  return out.filter(Boolean);
}

/**
 * @param {string} text
 * @param {number} maxChars
 */
function splitLongSentence(text, maxChars) {
  const t = String(text || "").trim();
  if (!t) return [];
  if (t.length <= maxChars) return [t];

  const words = t.split(/\s+/);
  const chunks = [];
  let current = "";
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      current = w;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
