import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { loadCallsFromStorage, saveCallsToStorage } from "../utils/callRecord";

const AnalyzedCallsContext = createContext(null);

export function AnalyzedCallsProvider({ children }) {
  const [calls, setCalls] = useState(() => loadCallsFromStorage());
  const audioUrlsRef = useRef(new Map());

  const persist = useCallback((next) => {
    setCalls(next);
    saveCallsToStorage(next);
  }, []);

  const addCall = useCallback(
    (record, audioUrl) => {
      if (audioUrl) {
        audioUrlsRef.current.set(record.id, audioUrl);
      }
      persist((prev) => [record, ...prev]);
      return record.id;
    },
    [persist]
  );

  const getCallById = useCallback(
    (id) => calls.find((c) => c.id === id) ?? null,
    [calls]
  );

  const getAudioUrlForCall = useCallback((id) => {
    return audioUrlsRef.current.get(id) ?? null;
  }, []);

  const value = useMemo(
    () => ({
      calls,
      addCall,
      getCallById,
      getAudioUrlForCall,
    }),
    [calls, addCall, getCallById, getAudioUrlForCall]
  );

  return (
    <AnalyzedCallsContext.Provider value={value}>
      {children}
    </AnalyzedCallsContext.Provider>
  );
}

export function useAnalyzedCalls() {
  const ctx = useContext(AnalyzedCallsContext);
  if (!ctx) throw new Error("useAnalyzedCalls must be used within AnalyzedCallsProvider");
  return ctx;
}
