import type { CartState } from "./cartReducer";

function itemCount(state: CartState): number {
  return state.lines.reduce((sum, line) => sum + line.quantity, 0);
}

function total(state: CartState): number {
  return state.lines.reduce(
    (sum, line) => sum + line.quantity * line.item.price,
    0,
  );
}

export { itemCount, total };
