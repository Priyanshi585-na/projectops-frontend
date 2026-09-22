import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Overview from "./pages/Overview.jsx";
import Tasks from "./pages/Tasks.jsx";
import Budget from "./pages/Budget.jsx";
import RiskCenter from "./pages/RiskCenter.jsx";

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-8 py-6 max-w-5xl">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/risk" element={<RiskCenter />} />
        </Routes>
      </main>
    </div>
  );
}
