/**
 * Transcription service — OpenAI Audio API only (no secrets in repo; key from env).
 * Replace this module to plug in another STT provider.
 */

const OPENAI_TRANSCRIPTION_URL = "https://api.openai.com/v1/audio/transcriptions";

function toFormFilePart(buffer, filename, mimeType) {
  const name = filename || "audio.wav";
  const type = mimeType || "application/octet-stream";
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (typeof File !== "undefined") {
    return new File([bytes], name, { type });
  }
  return new Blob([bytes], { type });
}

export function readOpenAiKey() {
  const raw = process.env.OPENAI_API_KEY ?? "";
  return raw.trim().replace(/^["']+|["']+$/g, "");
}

export async function transcribeAudioBuffer({ buffer, filename, mimeType }) {
  const apiKey = readOpenAiKey();
  if (!apiKey) {
    const err = new Error("OPENAI_API_KEY is not configured");
    err.code = "MISSING_API_KEY";
    throw err;
  }

  const safeFilename = (filename || "audio.wav").split(/[/\\]/).pop() || "audio.wav";
  const part = toFormFilePart(buffer, safeFilename, mimeType);
  const form = new FormData();
  // Third argument sets multipart filename; required for OpenAI when part is a Blob (Node < 20 / no global File).
  form.append("file", part, safeFilename);
  form.append("model", process.env.OPENAI_TRANSCRIPTION_MODEL || "whisper-1");

  const response = await fetch(OPENAI_TRANSCRIPTION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  const raw = await response.text();
  if (!response.ok) {
    const err = new Error(`OpenAI transcription failed (${response.status})`);
    err.code = "OPENAI_ERROR";
    err.detail = raw.slice(0, 2000);
    throw err;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    const err = new Error("Invalid JSON from OpenAI");
    err.code = "OPENAI_PARSE";
    throw err;
  }

  const text = typeof data.text === "string" ? data.text : "";
  return text.trim();
}
