import type { QueryFunctionContext } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { cancelOrder } from "../order/cancelOrder";
import { createOrder } from "../order/createOrder";
import { payOrder } from "../payment/payOrder";
import { ApiError, extractErrorMessage } from "./apiError";
import { env } from "./env";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildUrl(
  queryKey: readonly unknown[],
  pageParam: unknown,
): {
  url: string;
  path: string;
} {
  const segments = [...queryKey];
  const last = segments[segments.length - 1];
  const hasParams = isPlainObject(last);
  const params = hasParams ? last : undefined;
  const pathSegments = hasParams ? segments.slice(0, -1) : segments;

  const path = pathSegments.join("/");
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    searchParams.set(key, String(value));
  }

  if (pageParam !== undefined) {
    searchParams.set("page", String(pageParam));
  }

  const queryString = searchParams.toString();
  const url = `${env.apiUrl}/${path}${queryString ? `?${queryString}` : ""}`;

  return { url, path };
}

async function defaultQueryFn({ queryKey, pageParam }: QueryFunctionContext) {
  const { url, path } = buildUrl(queryKey, pageParam);
  const response = await fetch(url);

  if (!response.ok) {
    throw new ApiError(
      await extractErrorMessage(response, path),
      response.status,
    );
  }

  return response.json();
}

function createQueryClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: defaultQueryFn,
      },
    },
  });

  queryClient.setMutationDefaults(["orders", "create"], {
    mutationFn: createOrder,
  });
  queryClient.setMutationDefaults(["orders", "payment"], {
    mutationFn: payOrder,
  });
  queryClient.setMutationDefaults(["orders", "cancel"], {
    mutationFn: cancelOrder,
  });

  return queryClient;
}

export { createQueryClient };
