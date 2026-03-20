import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AnalyzedCallsProvider } from "./context/AnalyzedCallsContext";
import { MainDashboardPage } from "./pages/MainDashboardPage";
import { CallDetailPage } from "./pages/CallDetailPage";

export function App() {
  return (
    <BrowserRouter>
      <AnalyzedCallsProvider>
        <Routes>
          <Route path="/" element={<MainDashboardPage />} />
          <Route path="/calls/:callId" element={<CallDetailPage />} />
        </Routes>
      </AnalyzedCallsProvider>
    </BrowserRouter>
  );
}
