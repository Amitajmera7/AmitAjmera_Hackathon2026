import { useCallback, useEffect, useRef, useState } from "react";
import { transcribeAudioFile } from "../api/transcribeAudio";
import {
  AUDIO_UPLOAD_TYPE_ERROR,
  getAudioFileSizeError,
  isAllowedAudioFileName,
} from "../utils/validateAudioUpload";

export function useTranscriptionPipeline({ onSuccess }) {
  const [uploadFileName, setUploadFileName] = useState(null);
  const [uploadPhase, setUploadPhase] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [queuedBehind, setQueuedBehind] = useState(0);

  const genRef = useRef(0);
  const abortRef = useRef(null);
  const queueRef = useRef([]);
  const queuedKeysRef = useRef(new Set());
  const activeKeyRef = useRef(null);
  const transcriptCacheRef = useRef(new Map());
  const drainRunningRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const bumpGeneration = useCallback(() => {
    genRef.current += 1;
    return genRef.current;
  }, []);

  const resetUpload = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    queueRef.current = [];
    queuedKeysRef.current.clear();
    activeKeyRef.current = null;
    setQueuedBehind(0);
    bumpGeneration();
    setUploadFileName(null);
    setUploadPhase(null);
    setUploadError(null);
  }, [bumpGeneration]);

  const runPipelineForFile = useCallback(
    async (file) => {
      const fileKey = fileCacheKey(file);
      activeKeyRef.current = fileKey;

      if (!isAllowedAudioFileName(file.name)) {
        setUploadError(AUDIO_UPLOAD_TYPE_ERROR);
        setUploadPhase("error");
        setUploadFileName(null);
        return;
      }

      const sizeError = getAudioFileSizeError(file.size);
      if (sizeError) {
        setUploadError(sizeError);
        setUploadPhase("error");
        setUploadFileName(null);
        return;
      }

      const cachedTranscript = transcriptCacheRef.current.get(fileKey);
      if (cachedTranscript) {
        setUploadError(null);
        setUploadFileName(file.name);
        setUploadPhase("analyzing");
        onSuccessRef.current?.({ transcript: cachedTranscript, file });
        setUploadPhase("completed");
        activeKeyRef.current = null;
        return;
      }

      abortRef.current?.abort();
      bumpGeneration();
      const generation = genRef.current;

      const controller = new AbortController();
      abortRef.current = controller;

      setUploadError(null);
      setUploadFileName(file.name);
      setUploadPhase("uploading");

      try {
        const transcript = await transcribeAudioFile(file, {
          signal: controller.signal,
          onUploadFinished: () => {
            if (genRef.current !== generation) return;
            setUploadPhase("transcribing");
          },
        });

        if (genRef.current !== generation) return;

        setUploadPhase("analyzing");
        await new Promise((r) => setTimeout(r, 60));
        if (genRef.current !== generation) return;

        if (!transcript?.trim()) {
          throw new Error(
            "Transcription returned empty text. Try another file or check the recording."
          );
        }

        setUploadPhase("complete");
        await new Promise((r) => setTimeout(r, 40));
        if (genRef.current !== generation) return;

        transcriptCacheRef.current.set(fileKey, transcript);
        setUploadPhase("completed");
        onSuccessRef.current?.({ transcript, file });

        await new Promise((r) => setTimeout(r, 180));
        if (genRef.current !== generation) return;
        setUploadPhase(null);
        setUploadFileName(null);
      } catch (e) {
        if (e.name === "AbortError") return;
        setUploadPhase("error");
        setUploadError(
          e.message || "Something went wrong during transcription."
        );
      } finally {
        activeKeyRef.current = null;
      }
    },
    [bumpGeneration]
  );

  const drain = useCallback(async () => {
    if (drainRunningRef.current) return;
    drainRunningRef.current = true;
    try {
      while (queueRef.current.length > 0) {
        const item = queueRef.current.shift();
        const file = item?.file;
        const key = item?.key;
        if (!file) continue;
        if (key) queuedKeysRef.current.delete(key);
        setQueuedBehind(queueRef.current.length);
        await runPipelineForFile(file);
        setQueuedBehind(queueRef.current.length);
      }
    } finally {
      drainRunningRef.current = false;
    }
  }, [runPipelineForFile]);

  const enqueueFiles = useCallback(
    (files) => {
      const list = Array.from(files || []).filter(Boolean);
      if (!list.length) return;

      const valid = [];
      for (const file of list) {
        if (!isAllowedAudioFileName(file.name)) {
          setUploadError(AUDIO_UPLOAD_TYPE_ERROR);
          setUploadPhase("error");
          continue;
        }
        const sizeError = getAudioFileSizeError(file.size);
        if (sizeError) {
          setUploadError(sizeError);
          setUploadPhase("error");
          continue;
        }
        const key = fileCacheKey(file);
        if (queuedKeysRef.current.has(key) || activeKeyRef.current === key) {
          continue;
        }
        valid.push({ file, key });
      }
      if (!valid.length) return;

      setUploadError(null);
      const firstName = valid[0].file.name;
      setUploadFileName((prev) => prev ?? firstName);
      setUploadPhase((prev) => prev ?? "queued");
      for (const entry of valid) {
        queuedKeysRef.current.add(entry.key);
      }
      queueRef.current.push(...valid);
      setQueuedBehind(queueRef.current.length);
      void drain();
    },
    [drain]
  );

  const handleFileChosen = useCallback(
    (file) => {
      enqueueFiles([file]);
    },
    [enqueueFiles]
  );

  return {
    uploadFileName,
    uploadPhase,
    uploadError,
    queuedBehind,
    resetUpload,
    handleFileChosen,
    enqueueFiles,
  };
}

function fileCacheKey(file) {
  return `${file.name}::${file.size}::${file.lastModified}`;
}
