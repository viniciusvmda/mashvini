import { Route, Routes } from "react-router";
import { HealthStatus } from "./health/HealthStatus";

function App() {
  return (
    <Routes>
      <Route path="/health" element={<HealthStatus />} />
    </Routes>
  );
}

export { App };
