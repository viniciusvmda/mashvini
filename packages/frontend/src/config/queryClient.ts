import { QueryClient } from "@tanstack/react-query";
import { env } from "./env";

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: async ({ queryKey }) => {
          const path = queryKey.join("/");
          const response = await fetch(`${env.apiUrl}/${path}`);

          if (!response.ok) {
            throw new Error(
              `Request to ${path} failed with status ${response.status}`,
            );
          }

          return response.json();
        },
      },
    },
  });
}

export { createQueryClient };
