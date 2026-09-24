import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HealthStatus } from "./HealthStatus";

describe("HealthStatus", () => {
  it("renders Healthy when the API responds successfully", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          queryFn: () => Promise.resolve({ status: "ok" }),
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <HealthStatus />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Healthy")).toBeInTheDocument();
  });

  it("renders Unhealthy when the API request fails", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          queryFn: () => Promise.reject(new Error("Request failed")),
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <HealthStatus />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Unhealthy")).toBeInTheDocument();
  });
});
