/** @param {number} seconds */
export function formatPlaybackTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/**
 * @param {{ startSeconds: number, endSeconds: number }[]} segments
 * @param {number} currentTime
 * @returns {number}
 */
export function getActiveSegmentIndex(segments, currentTime) {
  if (!segments?.length || !Number.isFinite(currentTime)) return -1;
  if (currentTime < segments[0].startSeconds) return -1;
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (i < segments.length - 1) {
      if (currentTime >= s.startSeconds && currentTime < s.endSeconds) return i;
    } else if (currentTime >= s.startSeconds) {
      return i;
    }
  }
  return -1;
}
