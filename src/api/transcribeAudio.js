/**
 * POST multipart audio to backend; uses XHR so we can detect upload completion vs server work.
 *
 * Dev default: POST /api/transcribe (Vite proxies to localhost:8787).
 * Override: VITE_TRANSCRIBE_API_URL=http://localhost:8787
 */

function getTranscribeUrl() {
  const raw = import.meta.env.VITE_TRANSCRIBE_API_URL;
  const trimmed = raw != null ? String(raw).trim() : "";
  if (trimmed !== "") {
    const base = trimmed.replace(/\/$/, "");
    return `${base}/api/transcribe`;
  }
  if (import.meta.env.DEV) {
    return "/api/transcribe";
  }
  return "http://localhost:8787/api/transcribe";
}

function parseServerErrorBody(xhr) {
  const text = xhr.responseText?.trim();
  if (!text) return null;
  try {
    const body = JSON.parse(text);
    const main =
      typeof body.error === "string"
        ? body.error
        : typeof body.error?.message === "string"
          ? body.error.message
          : null;
    const details = typeof body.details === "string" ? body.details : null;
    const message = typeof body.message === "string" ? body.message : null;
    if (main && details) return `${main} (${details})`;
    return main || details || message;
  } catch {
    if (text.length < 400) return text;
    return null;
  }
}

function friendlyErrorForStatus(xhr) {
  const fromServer = parseServerErrorBody(xhr);
  if (fromServer) return fromServer;

  switch (xhr.status) {
    case 400:
      return "Invalid request. Use a .wav or .mp3 file.";
    case 413:
      return "File is too large for upload (server limit).";
    case 422:
      return "Transcription returned no usable text.";
    case 503:
      return "Transcription service is not configured or unavailable.";
    case 500:
      return "Transcription failed on the server. Try again later.";
    case 502:
      return "Transcription provider (OpenAI) rejected the request.";
    default:
      if (xhr.status >= 400) return `Request failed (${xhr.status}).`;
      return "Transcription request failed.";
  }
}

/**
 * @param {File} file
 * @param {{ onUploadFinished?: () => void, signal?: AbortSignal }} options
 * @returns {Promise<string>} transcript text
 */
export function transcribeAudioFile(file, options = {}) {
  const { onUploadFinished, signal } = options;
  const url = getTranscribeUrl();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let settled = false;

    const finish = (fn) => {
      if (settled) return;
      settled = true;
      if (signal) signal.removeEventListener("abort", onAbort);
      fn();
    };

    const onAbort = () => {
      xhr.abort();
    };
    if (signal) {
      if (signal.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }

    xhr.upload.addEventListener("loadend", () => {
      onUploadFinished?.();
    });

    xhr.addEventListener("loadend", () => {
      if (signal?.aborted) {
        finish(() => reject(new DOMException("Aborted", "AbortError")));
        return;
      }

      if (xhr.status === 0) {
        const bodyHint = parseServerErrorBody(xhr);
        finish(() =>
          reject(
            new Error(
              bodyHint ||
                "No response from transcription server. Start it with npm run server, use Vite dev (npm run dev) so /api is proxied, and avoid opening the app as a file:// URL."
            )
          )
        );
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText || "{}");
          if (typeof data.transcript === "string") {
            const text = data.transcript.trim();
            if (!text) {
              finish(() =>
                reject(
                  new Error(
                    "Transcription returned empty text. Try a clearer recording."
                  )
                )
              );
              return;
            }
            finish(() => resolve(text));
            return;
          }
          finish(() =>
            reject(new Error("Server response did not include a transcript."))
          );
        } catch {
          finish(() =>
            reject(new Error("Could not read the transcription response."))
          );
        }
        return;
      }

      finish(() => reject(new Error(friendlyErrorForStatus(xhr))));
    });

    xhr.addEventListener("error", () => {
      /* loadend always follows; avoid double reject */
    });

    xhr.addEventListener("abort", () => {
      /* loadend handles abort + status 0 */
    });

    xhr.open("POST", url);
    const body = new FormData();
    body.append("audio", file, file.name);
    xhr.send(body);
  });
}
