import type { MutationFunction, QueryFunction } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { CartProvider } from "@/order/cart/CartContext";
import { Toaster } from "@/ui/sonner";

type RenderWithClientOptions = {
  queryFn: QueryFunction;
  initialEntries?: string[];
  mutationKey?: readonly unknown[];
  mutationFn?: MutationFunction;
};

function renderWithClient(ui: ReactNode, opts: RenderWithClientOptions) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        queryFn: opts.queryFn,
      },
    },
  });

  if (opts.mutationFn) {
    queryClient.setMutationDefaults(opts.mutationKey ?? ["orders"], {
      mutationFn: opts.mutationFn,
    });
  }

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={opts.initialEntries}>
        <CartProvider>
          {ui}
          <Toaster />
        </CartProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

export { renderWithClient };
