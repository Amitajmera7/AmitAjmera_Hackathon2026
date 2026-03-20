/** @param {object[]} calls */
export function computeAggregateMetrics(calls) {
  if (!calls.length) {
    return {
      totalCalls: 0,
      sentimentSplit: { Positive: 0, Neutral: 0, Negative: 0 },
      averageScore: null,
      avgDurationMinutes: null,
      topKeywords: [],
      keywordCounts: [],
      timelineSeries: [],
      actionItemsTotal: 0,
    };
  }

  const sentimentSplit = { Positive: 0, Neutral: 0, Negative: 0 };
  let scoreSum = 0;
  let durSum = 0;
  let durCount = 0;
  const kwCounts = {};
  let actionItemsTotal = 0;

  for (const c of calls) {
    const s = c.analysis?.sentiment;
    if (s && sentimentSplit[s] !== undefined) sentimentSplit[s] += 1;
    const os = c.analysis?.overallScore;
    if (typeof os === "number") scoreSum += os;
    if (typeof c.durationMinutes === "number") {
      durSum += c.durationMinutes;
      durCount += 1;
    }
    const kws = c.analysis?.keywords || [];
    for (const w of kws.slice(0, 8)) {
      kwCounts[w] = (kwCounts[w] || 0) + 1;
    }
    actionItemsTotal += (c.analysis?.followUpActions || []).length;
  }

  const sortedKw = Object.entries(kwCounts).sort((a, b) => b[1] - a[1]);
  const topKeywords = sortedKw.slice(0, 8).map(([word]) => word);
  const keywordCounts = sortedKw.slice(0, 8).map(([word, count]) => ({ word, count }));

  const sortedChrono = [...calls].sort(
    (a, b) => new Date(a.analyzedAt) - new Date(b.analyzedAt)
  );
  let timelineSeries = sortedChrono.map((c, i) => ({
    label: new Date(c.analyzedAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    cumulative: i + 1,
  }));
  if (timelineSeries.length === 1) {
    timelineSeries = [
      { label: "Start", cumulative: 0 },
      { ...timelineSeries[0], cumulative: 1 },
    ];
  }

  return {
    totalCalls: calls.length,
    sentimentSplit,
    averageScore: Math.round(scoreSum / calls.length),
    avgDurationMinutes: durCount ? durSum / durCount : null,
    topKeywords,
    keywordCounts,
    timelineSeries,
    actionItemsTotal,
  };
}
