import { useNavigate } from "react-router";
import { useCart } from "@/order/cart/CartContext";
import { Button } from "@/ui/button";

function IdleScreen() {
  const navigate = useNavigate();
  const { dispatch } = useCart();

  function handleStart() {
    dispatch({ type: "clear" });
    navigate("/catalog");
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 p-8 text-center">
      <p className="font-heading text-2xl font-semibold">MASHVINI</p>
      <Button
        type="button"
        size="lg"
        className="h-auto whitespace-normal px-10 py-6 text-2xl"
        onClick={handleStart}
      >
        Tap here to start your order
      </Button>
    </div>
  );
}

export { IdleScreen };
