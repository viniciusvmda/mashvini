import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useReducer,
} from "react";
import {
  type CartAction,
  type CartState,
  cartReducer,
  initialCartState,
} from "./cartReducer";

type CartContextValue = {
  state: CartState;
  dispatch: Dispatch<CartAction>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}

export { CartProvider, useCart };
