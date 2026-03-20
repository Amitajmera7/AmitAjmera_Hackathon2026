const SIGNAL_RULES = [
  { label: "Budget Discussed", re: /\b(budget|price|pricing|cost|\$\d+|invoice)\b/i },
  { label: "Timeline Mentioned", re: /\b(timeline|deadline|week|month|q[1-4]|thursday|friday|tomorrow)\b/i },
  { label: "Positive Sentiment", re: /\b(thanks|great|good|happy|sounds good)\b/i },
  { label: "Follow-up Required", re: /\b(follow up|send|schedule|book|next step|call back)\b/i },
  { label: "Product Inquiry", re: /\b(product|service|plan|package|cabinet|inquiry)\b/i },
  { label: "High Intent", re: /\b(ready|move forward|interested|start|commit|buy)\b/i },
];

/** @param {string} text */
function compact(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

/** @param {string} sentence */
function shortLine(sentence) {
  const clean = compact(sentence).replace(/^[^:]+:\s*/i, "");
  if (clean.length <= 95) return clean;
  return `${clean.slice(0, 92).trimEnd()}...`;
}

/**
 * @param {Array<{ role: 'agent' | 'customer', text: string }>} segments
 * @param {any} analysis
 */
export function buildConversationSummary(segments, analysis) {
  const customerNeed =
    segments.find((s) => s.role === "customer" && /\b(need|want|looking for|trying to)\b/i.test(s.text)) ||
    segments.find((s) => s.role === "customer");
  const nextStep =
    segments.find((s) => /\b(next step|follow up|send|schedule|book|pilot|checkpoint)\b/i.test(s.text)) ||
    segments[segments.length - 1];

  return {
    about: `Call purpose: ${shortLine(analysis?.summary || segments[0]?.text || "Discussion captured.")}`,
    wants: `Customer wants: ${shortLine(customerNeed?.text || "Customer requirement discussed.")}`,
    decided: `Outcome: ${shortLine(nextStep?.text || "Next action not explicitly captured.")}`,
  };
}

/**
 * @param {string} transcript
 * @param {any} analysis
 */
export function extractSmartTags(transcript, analysis) {
  const tags = SIGNAL_RULES.filter((r) => r.re.test(transcript)).map((r) => r.label);
  if ((analysis?.objections ?? 0) > 0 && !tags.includes("Follow-up Required")) {
    tags.push("Follow-up Required");
  }
  return tags.slice(0, 5);
}

/**
 * @param {Array<{ role: 'agent' | 'customer', text: string }>} segments
 * @param {any} analysis
 */
export function extractKeyMoments(segments, analysis) {
  const text = segments.map((s) => s.text).join(" ");
  const lines = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => compact(s))
    .filter(Boolean);

  const scored = lines.map((line) => {
    let score = 0;
    if (/\b(require|need|want|looking for)\b/i.test(line)) score += 2;
    if (/\b(budget|price|pricing|cost|\$\d+)\b/i.test(line)) score += 3;
    if (/\b(concern|risk|blocker|issue|problem|objection)\b/i.test(line)) score += 3;
    if (/\b(decide|decision|approved|agree|commit|move forward)\b/i.test(line)) score += 3;
    if (/\b(next step|follow up|send|schedule|book|consultation)\b/i.test(line)) score += 3;
    score += Math.min(line.length / 100, 1.5);
    return { line, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const out = [];
  const seen = new Set();
  for (const row of scored) {
    if (row.score < 2.5) continue;
    const summary = shortLine(row.line);
    if (seen.has(summary)) continue;
    seen.add(summary);
    out.push(summary);
    if (out.length >= 5) break;
  }

  if (out.length < 3) {
    for (const h of analysis?.highlights || []) {
      const summary = shortLine(h);
      if (!summary || seen.has(summary)) continue;
      seen.add(summary);
      out.push(summary);
      if (out.length >= 3) break;
    }
  }

  return out.slice(0, 5);
}
