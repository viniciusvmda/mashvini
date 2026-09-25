import { describe, expect, it } from "vitest";
import type { CatalogItem } from "@/catalog/catalogItem";
import type { CartState } from "./cartReducer";
import { itemCount, total } from "./cartSelectors";

function buildItem(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    id: 1,
    name: "Voss water",
    price: 9,
    stock: 3,
    image_url: "https://example.com/voss-water.png",
    ...overrides,
  };
}

describe("cartSelectors", () => {
  it("sums the quantity of every line for itemCount", () => {
    const state: CartState = {
      lines: [
        { item: buildItem({ id: 1 }), quantity: 2 },
        { item: buildItem({ id: 2 }), quantity: 3 },
      ],
    };

    expect(itemCount(state)).toBe(5);
  });

  it("returns 0 for itemCount with an empty cart", () => {
    expect(itemCount({ lines: [] })).toBe(0);
  });

  it("sums the price times quantity of every line for total", () => {
    const state: CartState = {
      lines: [
        { item: buildItem({ id: 1, price: 9 }), quantity: 2 },
        { item: buildItem({ id: 2, price: 5 }), quantity: 1 },
      ],
    };

    expect(total(state)).toBe(23);
  });

  it("returns 0 for total with an empty cart", () => {
    expect(total({ lines: [] })).toBe(0);
  });
});
