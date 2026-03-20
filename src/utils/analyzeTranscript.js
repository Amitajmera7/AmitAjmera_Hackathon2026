/**
 * Rule-based transcript analysis for demos. Pure functions — safe to swap for ML later.
 */

const NEGATIVE_WORDS = ["issue", "delay", "refund", "problem"];
const POSITIVE_WORDS = ["thanks", "thank", "great", "good", "happy"];
const OBJECTION_WORDS = ["concern", "risk", "blocker"];

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "are",
  "but",
  "not",
  "you",
  "all",
  "can",
  "her",
  "was",
  "one",
  "our",
  "out",
  "day",
  "get",
  "has",
  "him",
  "his",
  "how",
  "its",
  "may",
  "new",
  "now",
  "see",
  "way",
  "who",
  "why",
]);

const QUESTIONNAIRE_RULES = [
  { id: "budget", label: "Budget / pricing discussed", patterns: ["budget", "pricing", "cost", "pilot", "invoice", "credit"] },
  { id: "competitor", label: "Competitor mentioned", patterns: ["competitor", "alternative", "vendor", "short list"] },
  { id: "scope", label: "Scope / rollout discussed", patterns: ["scope", "rollout", "pilot", "regions", "phase"] },
  { id: "preferences", label: "Preferences / workflow", patterns: ["preferences", "workflow", "dashboard", "reporting"] },
  { id: "timeline", label: "Timeline / dates", patterns: ["timeline", "deadline", "week", "days", "q3", "thursday", "month"] },
  { id: "warranty", label: "Warranty / SLA / support", patterns: ["warranty", "sla", "support", "policy", "dpa"] },
];

function normalize(text) {
  return text.toLowerCase();
}

function containsAnyWord(text, words) {
  const n = normalize(text);
  return words.some((w) => n.includes(w));
}

function countWordHits(text, words) {
  let total = 0;
  for (const w of words) {
    const re = new RegExp(`\\b${w}\\b`, "gi");
    const m = text.match(re);
    if (m) total += m.length;
  }
  return total;
}

/** Negative cues win over positive when both appear (common in support calls). */
export function detectSentiment(transcript) {
  if (containsAnyWord(transcript, NEGATIVE_WORDS)) return "Negative";
  if (containsAnyWord(transcript, POSITIVE_WORDS)) return "Positive";
  return "Neutral";
}

function sentimentLabelFromEnum(sentiment) {
  if (sentiment === "Negative") return "Friction or risk language detected";
  if (sentiment === "Positive") return "Positive cues in participant language";
  return "Balanced or informational exchange";
}

export function extractKeywords(transcript) {
  const words = normalize(transcript).match(/\b[a-z]{3,}\b/g) || [];
  const counts = {};
  for (const w of words) {
    if (STOPWORDS.has(w)) continue;
    counts[w] = (counts[w] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w);
}

function stripSpeaker(line) {
  return line.replace(/^\s*\[\d+:\d+\]\s*[^:]+:\s*/i, "").trim();
}

export function computeTalkRatio(transcript) {
  const lines = transcript.split(/\n/).filter((l) => l.trim());
  let agentLike = 0;
  let customerLike = 0;
  for (const line of lines) {
    if (/^\s*\[\d+:\d+\]\s*(Agent|CSM)\s*:/i.test(line)) agentLike++;
    else if (/^\s*\[\d+:\d+\]\s*(Caller|Customer)\s*:/i.test(line)) customerLike++;
  }
  const total = agentLike + customerLike;
  if (total === 0) return "50% / 50%";
  const agentPct = Math.round((agentLike / total) * 100);
  return `${agentPct}% / ${100 - agentPct}%`;
}

/** @returns {{ agentPct: number, customerPct: number }} */
export function parseTalkRatioParts(talkRatioStr) {
  const m = String(talkRatioStr).match(/(\d+)\s*%\s*\/\s*(\d+)\s*%/);
  if (!m) return { agentPct: 50, customerPct: 50 };
  return { agentPct: Number(m[1]), customerPct: Number(m[2]) };
}

function buildSummary(transcript) {
  const lines = transcript
    .split(/\n/)
    .map(stripSpeaker)
    .filter((l) => l.length > 0);
  const snippet = lines.slice(0, 3).join(" ");
  if (!snippet) return "No transcript text to summarize.";
  const trimmed = snippet.length > 320 ? `${snippet.slice(0, 317)}…` : snippet;
  const kw = extractKeywords(transcript).slice(0, 5);
  const kwPhrase = kw.length ? ` Key terms: ${kw.join(", ")}.` : "";
  return trimmed + kwPhrase;
}

function pickHighlights(transcript, keywordHints) {
  const raw = transcript.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const cleaned = raw.map(stripSpeaker).filter((l) => l.length > 0);
  const hints = new Set(keywordHints.map(normalize));

  const scored = cleaned.map((text) => {
    let score = 0;
    const t = normalize(text);
    for (const h of hints) {
      if (t.includes(h)) score += 2;
    }
    score += Math.min(text.length / 100, 2);
    return { text, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const out = [];
  for (const { text } of scored) {
    if (text.length < 24) continue;
    if (out.includes(text)) continue;
    out.push(text);
    if (out.length >= 3) break;
  }

  for (const text of cleaned) {
    if (out.length >= 3) break;
    if (text.length < 24 || out.includes(text)) continue;
    out.push(text);
  }

  return out.slice(0, 3);
}

function buildFollowUps(transcript) {
  const n = normalize(transcript);
  const actions = [];

  if (n.includes("refund")) {
    actions.push({
      title: "Process refund",
      description: "Caller mentioned refunds — confirm policy steps and timeline.",
      priority: "High",
    });
  }
  if (n.includes("delay")) {
    actions.push({
      title: "Follow up on delivery",
      description: "Timeline risk flagged — align on dates and owners.",
      priority: "Medium",
    });
  }
  if (n.includes("integration")) {
    actions.push({
      title: "Schedule technical discussion",
      description: "Integration work mentioned — book the right engineers.",
      priority: "Medium",
    });
  }

  const seen = new Set();
  const deduped = actions.filter((a) => {
    if (seen.has(a.title)) return false;
    seen.add(a.title);
    return true;
  });

  if (deduped.length === 0) {
    deduped.push({
      title: "Review transcript and assign owner",
      description: "No specific playbook match — triage next steps manually.",
      priority: "Low",
    });
  }

  return deduped;
}

function buildAiRationale(sentiment, objections, followUpActions) {
  const top = followUpActions[0];
  const rule =
    sentiment === "Negative"
      ? "Negative sentiment triggered because the transcript contains words like issue, delay, refund, or problem (they take priority over positive cues)."
      : sentiment === "Positive"
        ? "Positive sentiment reflects words such as thanks, great, good, or happy, with no higher-priority negative hits."
        : "Neutral sentiment means neither strong negative nor positive keyword groups dominated the text.";

  const objectionLine =
    objections > 0
      ? `Objection score is the count of “concern”, “risk”, and “blocker” mentions (${objections}).`
      : top
        ? `Follow-ups are playbook-driven: “${top.title}” is suggested from keyword matches in the text.`
        : "Follow-ups use simple keyword playbooks or fall back to a manual review when nothing matches.";

  return `${rule} ${objectionLine}`;
}

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function jitter(base, seed, salt) {
  const v = (hashSeed(seed + salt) % 13) - 6;
  return Math.min(100, Math.max(35, base + v));
}

/**
 * @param {string} transcript
 * @param {'Positive' | 'Neutral' | 'Negative'} sentiment
 */
function derivePerformanceScores(transcript, sentiment) {
  const n = normalize(transcript);
  const base =
    sentiment === "Positive" ? 82 : sentiment === "Negative" ? 68 : 74;
  const clarityBoost = /\b(clarif|explain|understood|confirm)\b/i.test(n) ? 4 : 0;
  const politeBoost = /\b(thanks|sorry|please|appreciate)\b/i.test(n) ? 5 : 0;
  const knowledgeBoost = /\b(policy|integration|security|workflow|pilot)\b/i.test(n) ? 4 : 0;
  const problemBoost = /\b(issue|refund|credit|resolve|fix)\b/i.test(n) ? 3 : 0;
  const listenBoost = /\b(hear you|understand|let me)\b/i.test(n) ? 4 : 0;

  return {
    communicationClarity: jitter(base + clarityBoost, transcript, "clarity"),
    politeness: jitter(base + politeBoost, transcript, "polite"),
    businessKnowledge: jitter(base + knowledgeBoost, transcript, "biz"),
    problemHandling: jitter(base + problemBoost, transcript, "prob"),
    listeningAbility: jitter(base + listenBoost, transcript, "listen"),
  };
}

function averageScore(scores) {
  const vals = Object.values(scores);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function buildQuestionnaireCoverage(transcript) {
  const n = normalize(transcript);
  return QUESTIONNAIRE_RULES.map((q) => ({
    id: q.id,
    label: q.label,
    covered: q.patterns.some((p) => n.includes(p)),
  }));
}

function buildObservations(transcript, sentiment, highlights) {
  const positive = [];
  const negative = [];
  const n = normalize(transcript);

  if (sentiment === "Positive" || /\b(thanks|great|appreciate)\b/.test(n)) {
    positive.push("Participants used appreciative or constructive language.");
  }
  if (/\b(next step|follow up|schedule|send)\b/.test(n)) {
    positive.push("Clear forward-looking actions or deliverables were discussed.");
  }
  if (highlights.length) {
    positive.push(`Notable moment: “${highlights[0].slice(0, 120)}${highlights[0].length > 120 ? "…" : ""}”`);
  }

  if (sentiment === "Negative" || /\b(issue|problem|delay|refund)\b/.test(n)) {
    negative.push("Risk, service, or delivery friction appeared in the conversation.");
  }
  if (/\b(concern|worried|blocker)\b/.test(n)) {
    negative.push("Explicit concerns or blockers were raised.");
  }
  if (negative.length === 0 && sentiment !== "Negative") {
    negative.push("No major red flags detected by keyword heuristics — still review the full audio.");
  }
  if (positive.length === 0) {
    positive.push("Conversation stayed informational; reinforce wins in your CRM notes.");
  }

  return { positiveObservations: positive.slice(0, 4), negativeObservations: negative.slice(0, 4) };
}

export function estimateDurationSeconds(transcript) {
  const words = (transcript || "").trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  return Math.max(30, Math.round(words / 2.4));
}

/**
 * @param {string} transcript
 */
export function analyzeTranscript(transcript) {
  const text = transcript ?? "";
  const sentiment = detectSentiment(text);
  const keywords = extractKeywords(text);
  const objections = countWordHits(text, OBJECTION_WORDS);
  const followUpActions = buildFollowUps(text);
  const highlights = pickHighlights(text, keywords);
  const talkRatio = computeTalkRatio(text);
  const performanceScores = derivePerformanceScores(text, sentiment);
  const overallScore = averageScore(performanceScores);
  const questionnaireCoverage = buildQuestionnaireCoverage(text);
  const { positiveObservations, negativeObservations } = buildObservations(
    text,
    sentiment,
    highlights
  );

  return {
    summary: buildSummary(text),
    sentiment,
    sentimentLabel: sentimentLabelFromEnum(sentiment),
    talkRatio,
    objections,
    highlights,
    followUpActions,
    aiRationale: buildAiRationale(sentiment, objections, followUpActions),
    keywords,
    overallScore,
    averageScore: overallScore,
    performanceScores,
    questionnaireCoverage,
    positiveObservations,
    negativeObservations,
  };
}
