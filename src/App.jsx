import { Routes, Route } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "sonner";


function App() {
  return (
    <ToastProvider>
        <Toaster richColors position="top-right" />
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
