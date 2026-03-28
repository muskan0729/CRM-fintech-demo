import { Routes, Route } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
