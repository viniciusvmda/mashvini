import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { MashviniLogo } from "@/brand/MashviniLogo";
import { ApiError } from "@/config/apiError";
import { CancelOrderDialog } from "@/order/CancelOrderDialog";
import { useCart } from "@/order/cart/CartContext";
import type { Order } from "@/order/createOrder";
import { IdleTimeoutDialog } from "@/order/idle-timeout/IdleTimeoutDialog";
import { useCancelPendingOrder } from "@/order/useCancelPendingOrder";
import { OrderSummary } from "@/payment/OrderSummary";
import { PaymentMethodChoice } from "@/payment/PaymentMethodChoice";
import type {
  Payment,
  PaymentMethod,
  PayOrderInput,
  SimulatedOutcome,
} from "@/payment/payOrder";
import { SimulatedMachinePanel } from "@/payment/SimulatedMachinePanel";
import { usePaymentMachine } from "@/payment/usePaymentMachine";
import { Button } from "@/ui/button";

type PaymentPhase = "choosing" | "atMachine" | "processing" | "networkError";

type MachineStepProps = {
  onResolve: (outcome?: SimulatedOutcome) => void;
};

function MachineStep({ onResolve }: MachineStepProps) {
  const { resolveNow, remaining } = usePaymentMachine(onResolve);

  return (
    <div className="flex flex-col gap-4 rounded-md border border-foreground/10 p-4">
      <p className="text-lg font-medium">
        Finish the payment on the payment machine
      </p>
      <SimulatedMachinePanel
        onOutcome={resolveNow}
        remainingSeconds={remaining}
      />
    </div>
  );
}

function statusMessageFor(phase: PaymentPhase): string {
  switch (phase) {
    case "choosing":
      return "Select the payment method";
    case "atMachine":
      return "Finish the payment on the payment machine";
    case "networkError":
      return "We couldn't reach the payment provider, tap Try again";
    case "processing":
      return "Processing payment…";
  }
}

function PaymentScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const order = (location.state as { order?: Order } | null)?.order;

  const [phase, setPhase] = useState<PaymentPhase>("choosing");
  const [method, setMethod] = useState<PaymentMethod | undefined>(undefined);
  const lastVariablesRef = useRef<PayOrderInput | undefined>(undefined);
  const hasResolvedMachineRef = useRef(false);

  const cancelPendingOrder = useCancelPendingOrder();

  const backToCartMutation = useMutation<Order, Error, Order["id"]>({
    mutationKey: ["orders", "cancel"],
    onSettled: () => {
      navigate("/catalog", { state: { openCart: true } });
    },
  });

  const paymentMutation = useMutation<Payment, Error, PayOrderInput>({
    mutationKey: ["orders", "payment"],
    onSuccess: () => {
      if (!order) {
        return;
      }

      dispatch({ type: "clear" });
      navigate("/success", { state: { orderId: order.id } });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status === 402) {
          toast.error("Payment declined, please choose a payment method again");
          setMethod(undefined);
          setPhase("choosing");
          return;
        }

        if (error.status === 502) {
          toast.error(
            "We couldn't reach the payment provider, please try again",
          );
          setMethod(undefined);
          setPhase("choosing");
          return;
        }

        if (error.status === 409) {
          toast.error("Your order expired, please finalize it again");
          navigate("/catalog");
          return;
        }
      }

      toast.error("Could not reach the server, check your connection", {
        action: {
          label: "Try again",
          onClick: () => {
            const variables = lastVariablesRef.current;
            if (variables) {
              setPhase("processing");
              paymentMutation.mutate(variables);
            }
          },
        },
      });
      setPhase("networkError");
    },
  });

  useEffect(() => {
    if (!order) {
      navigate("/catalog", { replace: true });
    }
  }, [order, navigate]);

  if (!order) {
    return null;
  }

  const currentOrder = order;

  function handleChooseMethod(chosenMethod: PaymentMethod) {
    if (phase !== "choosing") {
      return;
    }

    hasResolvedMachineRef.current = false;
    setMethod(chosenMethod);
    setPhase("atMachine");
  }

  function handleMachineResolve(outcome?: SimulatedOutcome) {
    if (
      phase !== "atMachine" ||
      !method ||
      !order ||
      hasResolvedMachineRef.current
    ) {
      return;
    }

    hasResolvedMachineRef.current = true;
    const variables: PayOrderInput = {
      orderId: currentOrder.id,
      method,
      simulatedOutcome: outcome,
      idempotencyKey: crypto.randomUUID(),
    };
    lastVariablesRef.current = variables;
    setPhase("processing");
    paymentMutation.mutate(variables);
  }

  function handleBackToCart() {
    backToCartMutation.mutate(currentOrder.id);
  }

  const isCancelInFlight =
    cancelPendingOrder.isPending || backToCartMutation.isPending;
  const disableBackAndCancel = phase === "processing" || isCancelInFlight;

  return (
    <div className="flex min-h-dvh flex-col" aria-busy={phase === "processing"}>
      <header className="fixed inset-x-0 top-0 z-40 flex items-center bg-header px-4 py-3 text-header-foreground ring-1 ring-foreground/10">
        <MashviniLogo layout="horizontal" className="h-10 w-auto" />
      </header>
      <div className="flex flex-1 flex-col gap-6 px-4 pt-20 pb-24">
        <p aria-live="polite" className="text-base font-medium">
          {statusMessageFor(phase)}
        </p>
        <div className="grid grid-cols-1 gap-6 landscape:grid-cols-2">
          <OrderSummary order={currentOrder} />
          {phase === "choosing" && (
            <PaymentMethodChoice
              disabled={false}
              onChoose={handleChooseMethod}
            />
          )}
          {phase === "atMachine" && (
            <MachineStep onResolve={handleMachineResolve} />
          )}
          {(phase === "processing" || phase === "networkError") && (
            <div className="flex flex-col gap-4 rounded-md border border-foreground/10 p-4">
              <p className="text-lg font-medium">
                {phase === "processing"
                  ? "Processing payment…"
                  : "Payment could not be completed"}
              </p>
            </div>
          )}
        </div>
      </div>
      <footer className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-end gap-3 bg-background px-4 py-3 ring-1 ring-foreground/10">
        <Button
          type="button"
          variant="outline"
          className="h-12 px-6 text-base"
          disabled={disableBackAndCancel}
          onClick={handleBackToCart}
        >
          Back to cart
        </Button>
        <CancelOrderDialog
          disabled={disableBackAndCancel}
          onConfirm={() => cancelPendingOrder.cancel(currentOrder.id)}
        />
      </footer>
      <IdleTimeoutDialog
        enabled={phase === "choosing"}
        onTimeout={() => cancelPendingOrder.cancel(currentOrder.id)}
      />
    </div>
  );
}

export { PaymentScreen };
