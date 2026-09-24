import type { QueryFunctionContext } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
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

async function extractErrorMessage(
  response: Response,
  path: string,
): Promise<string> {
  const fallbackMessage = `Request to ${path} failed with status ${response.status}`;

  try {
    const body = await response.json();
    return body?.detail ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function defaultQueryFn({ queryKey, pageParam }: QueryFunctionContext) {
  const { url, path } = buildUrl(queryKey, pageParam);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, path));
  }

  return response.json();
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: defaultQueryFn,
      },
    },
  });
}

export { createQueryClient };
