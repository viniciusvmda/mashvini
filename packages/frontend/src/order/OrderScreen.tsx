import { useState } from "react";
import { Catalog } from "@/catalog/Catalog";
import { useCart } from "@/order/cart/CartContext";
import { CartPanel } from "@/order/cart/CartPanel";
import { itemCount } from "@/order/cart/cartSelectors";
import { IdleTimeoutDialog } from "@/order/idle-timeout/IdleTimeoutDialog";
import { Footer } from "@/order/layout/Footer";
import { Header } from "@/order/layout/Header";

function OrderScreen() {
  const { state } = useCart();
  const [isCartPanelOpen, setIsCartPanelOpen] = useState(false);
  const showCartPanel = itemCount(state) > 0 || isCartPanelOpen;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header onToggleCart={() => setIsCartPanelOpen((open) => !open)} />
      <div className="flex flex-1 gap-4 px-4 pt-20 pb-24">
        <Catalog />
        {showCartPanel && <CartPanel />}
      </div>
      <Footer />
      <IdleTimeoutDialog />
    </div>
  );
}

export { OrderScreen };
