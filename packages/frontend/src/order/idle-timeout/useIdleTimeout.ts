import { useCallback, useEffect, useRef, useState } from "react";

const RESET_EVENTS = [
  "pointerdown",
  "pointermove",
  "keydown",
  "scroll",
] as const;

function useIdleTimeout(timeoutMs: number) {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const reset = useCallback(() => {
    setIsIdle(false);
    clearTimeout(timeoutIdRef.current);
    timeoutIdRef.current = setTimeout(() => setIsIdle(true), timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
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
  }, [reset]);

  return { isIdle, reset };
}

export { useIdleTimeout };
