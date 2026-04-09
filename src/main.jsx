import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import logo from './images/logo_crown.png';

// ─── React Query imports ───
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Optional (very useful during development):
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const favicon = document.querySelector("link[rel='icon']");
if (favicon) {
  favicon.href = logo;
}

// Create React Query client once (outside render)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Good defaults for large datasets / pagination
      staleTime: 1000 * 60 * 5,     // 5 minutes — data stays fresh
      gcTime: 1000 * 60 * 30,       // 30 minutes — keep in cache longer
      retry: 2,                     // retry failed requests twice
      refetchOnWindowFocus: false,  // don't refetch when tab is focused
    },
  },
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
      
      {/* Optional — shows query status/debug panel in bottom-right corner */}
      {/* Only enable in development — remove or comment in production */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </BrowserRouter>
);