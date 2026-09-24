import { Navigate, Route, Routes } from "react-router";
import { Catalog } from "./catalog/Catalog";
import { HealthStatus } from "./health/HealthStatus";
import { Toaster } from "./ui/sonner";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/catalog" replace />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/health" element={<HealthStatus />} />
      </Routes>
      <Toaster />
    </>
  );
}

export { App };
