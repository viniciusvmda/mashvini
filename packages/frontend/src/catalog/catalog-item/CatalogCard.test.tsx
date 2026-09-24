import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CatalogItem } from "../catalogItem";
import { CatalogCard } from "./CatalogCard";

function buildItem(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    id: 1,
    name: "Voss water",
    price: 9,
    stock: 12,
    image_url: "https://example.com/voss-water.png",
    ...overrides,
  };
}

describe("CatalogCard", () => {
  it("renders the name, formatted price, and image alt text for an in-stock item", () => {
    render(<CatalogCard item={buildItem()} />);

    expect(screen.getByText("Voss water")).toBeInTheDocument();
    expect(screen.getByText("$9.00")).toBeInTheDocument();
    expect(screen.getByAltText("Voss water")).toBeInTheDocument();
  });

  it("renders the stock badge and no price for an out-of-stock item", () => {
    render(<CatalogCard item={buildItem({ name: "Halls", stock: 0 })} />);

    expect(screen.getByText("Not available in stock")).toBeInTheDocument();
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });
});
