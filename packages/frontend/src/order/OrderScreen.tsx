import { useState } from "react";
import { useLocation } from "react-router";
import { Catalog } from "@/catalog/Catalog";
import { CartPanel } from "@/order/cart/CartPanel";
import { IdleTimeoutDialog } from "@/order/idle-timeout/IdleTimeoutDialog";
import { Footer } from "@/order/layout/Footer";
import { Header } from "@/order/layout/Header";

function OrderScreen() {
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(
    Boolean((location.state as { openCart?: boolean } | null)?.openCart),
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        isCartOpen={isCartOpen}
        onToggleCart={() => setIsCartOpen((open) => !open)}
      />
      <div className="flex flex-1 gap-4 px-4 pt-20 pb-24">
        <Catalog />
      </div>
      <CartPanel open={isCartOpen} onOpenChange={setIsCartOpen} />
      <Footer isCartOpen={isCartOpen} onOpenCart={() => setIsCartOpen(true)} />
      <IdleTimeoutDialog />
    </div>
  );
}

export { OrderScreen };
