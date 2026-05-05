import { Route, Routes } from "react-router-dom";
import { AppShell } from "./layouts/AppShell";
import { ComparePage } from "./pages/Compare";
import { DetectorPage } from "./pages/Detector";
import { HomePage } from "./pages/Home";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="detector" element={<DetectorPage />} />
        <Route path="compare" element={<ComparePage />} />
      </Route>
    </Routes>
  );
}
