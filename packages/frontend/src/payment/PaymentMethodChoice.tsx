import type { PaymentMethod } from "@/payment/payOrder";
import { Button } from "@/ui/button";

type PaymentMethodChoiceProps = {
  disabled: boolean;
  onChoose: (method: PaymentMethod) => void;
};

function PaymentMethodChoice({ disabled, onChoose }: PaymentMethodChoiceProps) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-foreground/10 p-4">
      <h2 className="font-heading text-xl font-semibold">Payment method</h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          className="h-12 flex-1 px-6 text-base"
          aria-label="Pay with card"
          disabled={disabled}
          onClick={() => onChoose("card")}
        >
          Card
        </Button>
        <Button
          type="button"
          className="h-12 flex-1 px-6 text-base"
          aria-label="Pay with mobile wallet"
          disabled={disabled}
          onClick={() => onChoose("wallet")}
        >
          Mobile wallet
        </Button>
      </div>
    </div>
  );
}

export { PaymentMethodChoice };
