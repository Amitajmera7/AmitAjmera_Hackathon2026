/** Must match server/constants.js MAX_AUDIO_UPLOAD_BYTES */
export const MAX_AUDIO_UPLOAD_BYTES = 25 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [".wav", ".mp3"];

export function isAllowedAudioFileName(fileName) {
  const lower = (fileName || "").toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export const AUDIO_UPLOAD_TYPE_ERROR =
  "Please upload a .wav or .mp3 file.";

export function getAudioFileSizeError(fileSizeBytes) {
  if (fileSizeBytes <= MAX_AUDIO_UPLOAD_BYTES) return null;
  const mb = MAX_AUDIO_UPLOAD_BYTES / (1024 * 1024);
  return `This file is too large. Maximum upload size is ${mb} MB.`;
}
