import { describe, expect, it } from "vitest";
import type { CatalogItem } from "@/catalog/catalogItem";
import { cartReducer, initialCartState } from "./cartReducer";

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

describe("cartReducer", () => {
  it("adds a new item with quantity 1", () => {
    const item = buildItem();

    const state = cartReducer(initialCartState, { type: "add", item });

    expect(state.lines).toEqual([{ item, quantity: 1 }]);
  });

  it("does not add an item that has no stock", () => {
    const item = buildItem({ stock: 0 });

    const state = cartReducer(initialCartState, { type: "add", item });

    expect(state.lines).toEqual([]);
  });

  it("increments the quantity when adding an item already in the cart", () => {
    const item = buildItem();
    const state = cartReducer(initialCartState, { type: "add", item });

    const nextState = cartReducer(state, { type: "add", item });

    expect(nextState.lines).toEqual([{ item, quantity: 2 }]);
  });

  it("clamps the quantity at the item's stock when adding repeatedly", () => {
    const item = buildItem({ stock: 1 });
    const state = cartReducer(initialCartState, { type: "add", item });

    const nextState = cartReducer(state, { type: "add", item });

    expect(nextState.lines).toEqual([{ item, quantity: 1 }]);
  });

  it("removes a line by item id", () => {
    const item = buildItem();
    const state = cartReducer(initialCartState, { type: "add", item });

    const nextState = cartReducer(state, { type: "remove", itemId: item.id });

    expect(nextState.lines).toEqual([]);
  });

  it("sets the quantity of an existing line", () => {
    const item = buildItem();
    const state = cartReducer(initialCartState, { type: "add", item });

    const nextState = cartReducer(state, {
      type: "setQuantity",
      itemId: item.id,
      quantity: 2,
    });

    expect(nextState.lines).toEqual([{ item, quantity: 2 }]);
  });

  it("clamps setQuantity at the item's stock", () => {
    const item = buildItem({ stock: 2 });
    const state = cartReducer(initialCartState, { type: "add", item });

    const nextState = cartReducer(state, {
      type: "setQuantity",
      itemId: item.id,
      quantity: 5,
    });

    expect(nextState.lines).toEqual([{ item, quantity: 2 }]);
  });

  it("removes the line when setQuantity reaches 0", () => {
    const item = buildItem();
    const state = cartReducer(initialCartState, { type: "add", item });

    const nextState = cartReducer(state, {
      type: "setQuantity",
      itemId: item.id,
      quantity: 0,
    });

    expect(nextState.lines).toEqual([]);
  });

  it("clears all lines", () => {
    const item = buildItem();
    const state = cartReducer(initialCartState, { type: "add", item });

    const nextState = cartReducer(state, { type: "clear" });

    expect(nextState.lines).toEqual([]);
  });

  it("replaces item snapshots on refresh while keeping quantities", () => {
    const item = buildItem();
    const state = cartReducer(initialCartState, { type: "add", item });
    const refreshedItem = { ...item, price: 11, stock: 3 };

    const nextState = cartReducer(state, {
      type: "refreshItems",
      items: [refreshedItem],
    });

    expect(nextState.lines).toEqual([{ item: refreshedItem, quantity: 1 }]);
  });

  it("clamps quantities that exceed the refreshed stock", () => {
    const item = buildItem({ stock: 5 });
    const addedState = cartReducer(initialCartState, { type: "add", item });
    const bumpedState = cartReducer(addedState, {
      type: "setQuantity",
      itemId: item.id,
      quantity: 4,
    });
    const refreshedItem = { ...item, stock: 1 };

    const nextState = cartReducer(bumpedState, {
      type: "refreshItems",
      items: [refreshedItem],
    });

    expect(nextState.lines).toEqual([{ item: refreshedItem, quantity: 1 }]);
  });

  it("clamps the quantity to 0 when the refreshed stock is 0, keeping the line", () => {
    const item = buildItem();
    const state = cartReducer(initialCartState, { type: "add", item });
    const soldOutItem = { ...item, stock: 0 };

    const nextState = cartReducer(state, {
      type: "refreshItems",
      items: [soldOutItem],
    });

    expect(nextState.lines).toEqual([{ item: soldOutItem, quantity: 0 }]);
  });

  it("leaves lines untouched when refreshed items don't include them", () => {
    const item = buildItem();
    const state = cartReducer(initialCartState, { type: "add", item });

    const nextState = cartReducer(state, {
      type: "refreshItems",
      items: [],
    });

    expect(nextState.lines).toEqual([{ item, quantity: 1 }]);
  });
});
