import { useCallback, useEffect, useRef, useState } from "react";

function useCountdown(seconds: number, onZero: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const onZeroRef = useRef(onZero);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );
  onZeroRef.current = onZero;

  const startInterval = useCallback(() => {
    clearInterval(intervalIdRef.current);
    intervalIdRef.current = setInterval(() => {
      setRemaining((value) => Math.max(value - 1, 0));
    }, 1000);
  }, []);

  useEffect(() => {
    startInterval();
    return () => clearInterval(intervalIdRef.current);
  }, [startInterval]);

  useEffect(() => {
    if (remaining <= 0) {
      onZeroRef.current();
    }
  }, [remaining]);

  function reset() {
    setRemaining(seconds);
    startInterval();
  }

  return { remaining, reset };
}

export { useCountdown };
