import { Minus, Plus } from "lucide-react";
import { Button } from "@/ui/button";

type QuantityStepperProps = {
  itemName: string;
  quantity: number;
  max: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

function QuantityStepper({
  itemName,
  quantity,
  max,
  onIncrement,
  onDecrement,
}: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`Decrease quantity of ${itemName}`}
        onClick={onDecrement}
      >
        <Minus />
      </Button>
      <span className="w-6 text-center text-base font-medium">{quantity}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`Increase quantity of ${itemName}`}
        onClick={onIncrement}
        disabled={quantity >= max}
      >
        <Plus />
      </Button>
    </div>
  );
}

export { QuantityStepper };
