/**
 * Read decoded duration (seconds) from a local audio File via browser metadata.
 * Falls back if the runtime cannot expose duration.
 */
export function getAudioFileDurationSeconds(file) {
  if (!(file instanceof Blob)) return Promise.resolve(null);

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement("audio");
    el.preload = "metadata";

    const done = (seconds) => {
      URL.revokeObjectURL(url);
      el.removeAttribute("src");
      el.load();
      resolve(
        typeof seconds === "number" && Number.isFinite(seconds) && seconds > 0
          ? seconds
          : null
      );
    };

    el.addEventListener("loadedmetadata", () => {
      done(el.duration);
    });
    el.addEventListener("error", () => done(null));

    el.src = url;
  });
}
