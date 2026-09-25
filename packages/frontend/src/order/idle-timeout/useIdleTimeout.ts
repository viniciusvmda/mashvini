import { useCallback, useEffect, useRef, useState } from "react";

const RESET_EVENTS = [
  "pointerdown",
  "pointermove",
  "keydown",
  "scroll",
] as const;

function useIdleTimeout(timeoutMs: number, enabled: boolean = true) {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const reset = useCallback(() => {
    setIsIdle(false);
    clearTimeout(timeoutIdRef.current);
    if (enabled) {
      timeoutIdRef.current = setTimeout(() => setIsIdle(true), timeoutMs);
    }
  }, [timeoutMs, enabled]);

  useEffect(() => {
    if (!enabled) {
      setIsIdle(false);
      clearTimeout(timeoutIdRef.current);
      return;
    }

    reset();

    for (const eventName of RESET_EVENTS) {
      window.addEventListener(eventName, reset, { capture: true });
    }

    return () => {
      for (const eventName of RESET_EVENTS) {
        window.removeEventListener(eventName, reset, { capture: true });
      }
      clearTimeout(timeoutIdRef.current);
    };
  }, [reset, enabled]);

  return { isIdle, reset };
}

export { useIdleTimeout };
