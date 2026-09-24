import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithClient } from "@/test/renderWithClient";
import { HealthStatus } from "./HealthStatus";

describe("HealthStatus", () => {
  it("renders Healthy when the API responds successfully", async () => {
    renderWithClient(<HealthStatus />, {
      queryFn: () => Promise.resolve({ status: "ok" }),
    });

    expect(await screen.findByText("Healthy")).toBeInTheDocument();
  });

  it("renders Unhealthy when the API request fails", async () => {
    renderWithClient(<HealthStatus />, {
      queryFn: () => Promise.reject(new Error("Request failed")),
    });

    expect(await screen.findByText("Unhealthy")).toBeInTheDocument();
  });
});
