import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CATALOG_PAGE_SIZE, type CatalogPage } from "@/catalog/catalogItem";
import { ApiError } from "@/config/apiError";
import { useCart } from "@/order/cart/CartContext";
import type { Order, OrderLineInput } from "@/order/createOrder";

async function reconcileCartWithFreshStock(
  queryClient: ReturnType<typeof useQueryClient>,
  dispatch: ReturnType<typeof useCart>["dispatch"],
) {
  await queryClient.refetchQueries({ queryKey: ["items"] });

  const cachedItems = queryClient.getQueryData<InfiniteData<CatalogPage>>([
    "items",
    { size: CATALOG_PAGE_SIZE },
  ]);

  dispatch({
    type: "refreshItems",
    items: cachedItems?.pages.flatMap((page) => page.data) ?? [],
  });
}

function useFinalizeOrder() {
  const { state, dispatch } = useCart();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation<Order, Error, OrderLineInput[]>({
    mutationKey: ["orders"],
    onSuccess: () => {
      dispatch({ type: "clear" });
      navigate("/success");
    },
    onError: async (error) => {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(error.message);
        await reconcileCartWithFreshStock(queryClient, dispatch);
        return;
      }

      toast.error("Could not send your order, please try again");
    },
  });

  function finalize() {
    const lines: OrderLineInput[] = state.lines
      .filter((line) => line.quantity > 0)
      .map((line) => ({ item_id: line.item.id, quantity: line.quantity }));

    mutation.mutate(lines);
  }

  return { finalize, isPending: mutation.isPending };
}

export { useFinalizeOrder };
