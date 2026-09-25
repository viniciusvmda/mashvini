import { useCallback, useRef } from "react";
import { useCountdown } from "@/order/useCountdown";
import type { SimulatedOutcome } from "@/payment/payOrder";

const MACHINE_WAIT_SECONDS = 5;

function usePaymentMachine(onResolve: (outcome?: SimulatedOutcome) => void) {
  const onResolveRef = useRef(onResolve);
  const hasResolvedRef = useRef(false);
  onResolveRef.current = onResolve;

  const handleTimeout = useCallback(() => {
    if (hasResolvedRef.current) {
      return;
    }

    hasResolvedRef.current = true;
    onResolveRef.current(undefined);
  }, []);

  const { remaining } = useCountdown(MACHINE_WAIT_SECONDS, handleTimeout);

  function resolveNow(outcome?: SimulatedOutcome) {
    if (hasResolvedRef.current) {
      return;
    }

    hasResolvedRef.current = true;
    onResolveRef.current(outcome);
  }

  return { resolveNow, remaining };
}

export { usePaymentMachine };
