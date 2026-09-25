import { isPaymentSimulatorEnabled } from "@/config/env";
import type { SimulatedOutcome } from "@/payment/payOrder";
import { Button } from "@/ui/button";

type SimulatedMachinePanelProps = {
  onOutcome: (outcome: SimulatedOutcome) => void;
};

function SimulatedMachinePanel({ onOutcome }: SimulatedMachinePanelProps) {
  if (!isPaymentSimulatorEnabled()) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border-2 border-dashed border-destructive/50 p-4">
      <p className="text-sm font-semibold tracking-wide text-destructive">
        SIMULATOR
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 px-4 text-base"
          aria-label="Simulate an approved payment"
          onClick={() => onOutcome("approved")}
        >
          Approve
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 px-4 text-base"
          aria-label="Simulate a declined payment"
          onClick={() => onOutcome("declined")}
        >
          Decline
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 px-4 text-base"
          aria-label="Simulate a gateway error"
          onClick={() => onOutcome("gateway_error")}
        >
          Gateway error
        </Button>
      </div>
    </div>
  );
}

export { SimulatedMachinePanel };
