import { useEffect, useRef } from "react";
import type { SimulatedOutcome } from "@/payment/payOrder";

const MACHINE_WAIT_MS = 5000;

function usePaymentMachine(onResolve: (outcome?: SimulatedOutcome) => void) {
  const onResolveRef = useRef(onResolve);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  onResolveRef.current = onResolve;

  useEffect(() => {
    timeoutIdRef.current = setTimeout(() => {
      onResolveRef.current(undefined);
    }, MACHINE_WAIT_MS);

    return () => clearTimeout(timeoutIdRef.current);
  }, []);

  function resolveNow(outcome?: SimulatedOutcome) {
    clearTimeout(timeoutIdRef.current);
    onResolveRef.current(outcome);
  }

  return { resolveNow };
}

export { usePaymentMachine };
