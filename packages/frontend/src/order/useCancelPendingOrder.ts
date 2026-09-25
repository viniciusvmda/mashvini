import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useCart } from "@/order/cart/CartContext";
import type { Order } from "@/order/createOrder";

function useCancelPendingOrder() {
  const { dispatch } = useCart();
  const navigate = useNavigate();

  const mutation = useMutation<Order, Error, Order["id"]>({
    mutationKey: ["orders", "cancel"],
    onSettled: () => {
      dispatch({ type: "clear" });
      navigate("/");
    },
  });

  function cancel(orderId: Order["id"]) {
    mutation.mutate(orderId);
  }

  return { cancel, isPending: mutation.isPending };
}

export { useCancelPendingOrder };
