import { Route, Routes } from "react-router";
import { HealthStatus } from "./health/HealthStatus";
import { IdleScreen } from "./order/idle/IdleScreen";
import { OrderScreen } from "./order/OrderScreen";
import { SuccessScreen } from "./order/success/SuccessScreen";
import { PaymentScreen } from "./payment/PaymentScreen";
import { Toaster } from "./ui/sonner";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<IdleScreen />} />
        <Route path="/catalog" element={<OrderScreen />} />
        <Route path="/payment" element={<PaymentScreen />} />
        <Route path="/success" element={<SuccessScreen />} />
        <Route path="/health" element={<HealthStatus />} />
      </Routes>
      <Toaster />
    </>
  );
}

export { App };
