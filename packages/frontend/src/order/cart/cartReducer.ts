import type { CatalogItem } from "@/catalog/catalogItem";

type CartLine = {
  item: CatalogItem;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
};

type CartAction =
  | { type: "add"; item: CatalogItem }
  | { type: "remove"; itemId: number }
  | { type: "setQuantity"; itemId: number; quantity: number }
  | { type: "clear" }
  | { type: "refreshItems"; items: CatalogItem[] };

const initialCartState: CartState = { lines: [] };

function clampQuantity(quantity: number, stock: number): number {
  return Math.min(Math.max(quantity, 0), stock);
}

function addLine(state: CartState, item: CatalogItem): CartState {
  const existingLine = state.lines.find((line) => line.item.id === item.id);

  if (existingLine) {
    return {
      lines: state.lines.map((line) =>
        line.item.id === item.id
          ? { ...line, quantity: clampQuantity(line.quantity + 1, item.stock) }
          : line,
      ),
    };
  }

  if (item.stock <= 0) {
    return state;
  }

  return { lines: [...state.lines, { item, quantity: 1 }] };
}

function removeLine(state: CartState, itemId: number): CartState {
  return { lines: state.lines.filter((line) => line.item.id !== itemId) };
}

function setLineQuantity(
  state: CartState,
  itemId: number,
  quantity: number,
): CartState {
  if (quantity <= 0) {
    return removeLine(state, itemId);
  }

  return {
    lines: state.lines.map((line) =>
      line.item.id === itemId
        ? { ...line, quantity: clampQuantity(quantity, line.item.stock) }
        : line,
    ),
  };
}

function refreshLineItems(state: CartState, items: CatalogItem[]): CartState {
  return {
    lines: state.lines.map((line) => {
      const refreshedItem = items.find((item) => item.id === line.item.id);

      if (!refreshedItem) {
        return line;
      }

      return {
        item: refreshedItem,
        quantity: clampQuantity(line.quantity, refreshedItem.stock),
      };
    }),
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add":
      return addLine(state, action.item);
    case "remove":
      return removeLine(state, action.itemId);
    case "setQuantity":
      return setLineQuantity(state, action.itemId, action.quantity);
    case "clear":
      return initialCartState;
    case "refreshItems":
      return refreshLineItems(state, action.items);
    default:
      return state;
  }
}

export type { CartAction, CartLine, CartState };
export { cartReducer, initialCartState };
