import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CatalogSkeleton } from "./CatalogSkeleton";

describe("CatalogSkeleton", () => {
  it("renders with the loading status role and label", () => {
    render(<CatalogSkeleton />);

    expect(
      screen.getByRole("status", { name: "Loading catalog" }),
    ).toBeInTheDocument();
  });
});
