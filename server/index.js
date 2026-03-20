import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import express from "express";
import multer from "multer";
import { MAX_AUDIO_UPLOAD_BYTES } from "./constants.js";
import {
  readOpenAiKey,
  transcribeAudioBuffer,
} from "./services/openaiTranscription.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envServer = path.join(__dirname, ".env");
const envRoot = path.join(__dirname, "..", ".env");
dotenv.config({ path: envServer });
// If server/.env has OPENAI_API_KEY= with no value, dotenv sets ""; a second load without override would not fix it.
if (!readOpenAiKey()) {
  dotenv.config({ path: envRoot, override: true });
}

const app = express();
const PORT = Number(process.env.PORT) || 8787;

const ALLOWED_EXT = new Set([".wav", ".mp3"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AUDIO_UPLOAD_BYTES },
});

function openAiDetailForClient(detail) {
  if (!detail || typeof detail !== "string") return undefined;
  try {
    const j = JSON.parse(detail);
    const msg = j?.error?.message;
    if (typeof msg === "string" && msg.trim()) {
      return msg.trim().slice(0, 500);
    }
  } catch {
    /* plain text */
  }
  return detail.trim().slice(0, 500);
}

function handleAudioUpload(req, res, next) {
  upload.single("audio")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          error: `File is too large. Maximum size is ${MAX_AUDIO_UPLOAD_BYTES / (1024 * 1024)} MB.`,
        });
      }
      return res.status(400).json({
        error: "Upload could not be processed. Use a single .wav or .mp3 file.",
      });
    }
    return next(err);
  });
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || true,
  })
);

app.get("/", (_req, res) => {
  res.type("html").send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Transcribe API</title></head><body style="font-family:system-ui,sans-serif;max-width:40rem;margin:2rem;line-height:1.5">
    <h1>Call Analysis — transcribe API</h1>
    <p>This port serves the <strong>API only</strong>, not the React dashboard.</p>
    <ul>
      <li><a href="/api/health">GET /api/health</a> — health check</li>
      <li><code>POST /api/transcribe</code> — multipart field <code>audio</code> (.wav / .mp3)</li>
    </ul>
    <p>Open the app with <strong>npm run dev</strong> (usually <a href="http://localhost:5173">http://localhost:5173</a>) to upload files from the UI.</p>
  </body></html>`);
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    openaiKeyConfigured: Boolean(readOpenAiKey()),
    envFiles: {
      serverDotEnvExists: fs.existsSync(envServer),
      rootDotEnvExists: fs.existsSync(envRoot),
    },
  });
});

app.post("/api/transcribe", handleAudioUpload, async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        error: "No audio file received. Use the form field name “audio” and a .wav or .mp3 file.",
      });
    }

    const ext = path.extname(req.file.originalname || "").toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return res.status(400).json({
        error: "Only .wav and .mp3 files are supported.",
      });
    }

    const transcript = await transcribeAudioBuffer({
      buffer: req.file.buffer,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
    });

    if (!transcript) {
      return res.status(422).json({
        error: "Transcription returned empty text. Try another recording or check audio quality.",
      });
    }

    res.json({ transcript });
  } catch (err) {
    if (err.code === "MISSING_API_KEY") {
      return res.status(503).json({
        error:
          "Transcription is not configured. Add OPENAI_API_KEY to server/.env (or the project root .env), restart npm run server, then check GET /api/health — openaiKeyConfigured should be true.",
      });
    }

    const details = openAiDetailForClient(err.detail);

    if (err.code === "OPENAI_ERROR") {
      console.error("[transcribe] OpenAI error", err.message, err.detail?.slice(0, 200));
      return res.status(502).json({
        error: "OpenAI transcription request failed.",
        details: details || `HTTP error from provider (see server logs).`,
      });
    }

    if (err.code === "OPENAI_PARSE") {
      console.error("[transcribe] OpenAI response parse error", err.message);
      return res.status(502).json({
        error: "Invalid response from OpenAI transcription API.",
        details: err.message,
      });
    }

    console.error("[transcribe]", err.message, err.detail || "");
    res.status(500).json({
      error:
        "Transcription failed. The audio may be unreadable, or the provider may be unavailable.",
      ...(details ? { details } : {}),
      ...(!details && err.message ? { details: err.message.slice(0, 400) } : {}),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Transcribe API listening on http://localhost:${PORT}`);
  if (!readOpenAiKey()) {
    console.warn(
      "[env] OPENAI_API_KEY missing or empty after loading .env files. Check:"
    );
    console.warn(`  ${envServer} (exists: ${fs.existsSync(envServer)})`);
    console.warn(`  ${envRoot} (exists: ${fs.existsSync(envRoot)})`);
    console.warn(
      '  Line must look like: OPENAI_API_KEY=sk-...  (no spaces around =)'
    );
  }
});
