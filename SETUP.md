# Call Analysis Dashboard — setup

## Required: OpenAI API key

Put your key in **`server/.env`** (never commit this file):

```env
OPENAI_API_KEY=sk-...
```

Copy `server/.env.example` to **`server/.env`** (same folder as `server/index.js`).  
If you already use a **project root** `.env` next to `package.json`, that is loaded too when `server/.env` has no key.

**No quotes** around the key value unless your shell requires them (if you use quotes, use straight `"` not smart quotes).

After starting the server, open **`http://localhost:8787/api/health`** — you should see `"openaiKeyConfigured": true`. If it is `false`, the key is still not visible to Node (wrong file, typo in variable name, or server not restarted).

---

## Other environment variables

### Backend (`server/`)

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | **Yes** | Your OpenAI API secret for audio transcription. |
| `OPENAI_TRANSCRIPTION_MODEL` | No | Defaults to `whisper-1`. |
| `PORT` | No | API port; default **8787**. |
| `CORS_ORIGIN` | No | Comma-separated allowed origins (e.g. `http://localhost:5173`). Default allows all. |

### Frontend (optional)

| Variable | Description |
|----------|-------------|
| `VITE_TRANSCRIBE_API_URL` | Base URL of the transcribe API (no trailing slash), e.g. `http://localhost:8787`. **Leave unset in Vite dev** so the app uses same-origin `/api/...` and the dev server **proxies** to port 8787 (avoids CORS on `POST /api/transcribe`). |

Create a `.env` in the project root only if the API runs on another host/port and you are not using the Vite proxy.

---

## Run locally

1. **Install dependencies**

   ```bash
   npm install
   cd server && npm install && cd ..
   ```

2. **Configure** `server/.env` with **`OPENAI_API_KEY`**.

3. **Start API + Vite** (two terminals or one):

   ```bash
   npm run server
   npm run dev
   ```

   Or:

   ```bash
   npm run dev:full
   ```

4. Open the Vite URL (usually `http://localhost:5173`), upload a `.wav` or `.mp3` under **25 MB**, and confirm transcript + insights update after transcription completes.

**Flow:** browser → `POST /api/transcribe` (multipart `audio`) → OpenAI on the server → JSON `{ transcript }` → `analyzeTranscript()` on the client → dashboard.
