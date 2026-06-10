import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type RefObject,
  type ReactNode,
} from "react";

interface SoundContextValue {
  muted: boolean;
  mutedRef: RefObject<boolean>;
  toggleMuted: () => void;
  setMuted: (m: boolean) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

const STORAGE_KEY = "kd-muted";

export function SoundProvider({ children }: { children: ReactNode }) {
  // Always start muted on every page load — users opt in to sound by clicking
  // the wave. No persistence: a refresh resets to silent.
  const [muted, setMutedState] = useState(true);
  const mutedRef = useRef(true);

  // Clear any stale value from earlier persistence experiments.
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const setMuted = useCallback((m: boolean) => {
    mutedRef.current = m;
    setMutedState(m);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted(!mutedRef.current);
  }, [setMuted]);

  return (
    <SoundContext.Provider value={{ muted, mutedRef, toggleMuted, setMuted }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used inside SoundProvider");
  return ctx;
}
