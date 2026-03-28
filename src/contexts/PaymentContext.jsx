import { createContext, useState } from "react";

export const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [token] = useState(import.meta.env.VITE_GLIDE_BACKEND_SERVICE_API_TOKEN);
  return (
    <PaymentContext.Provider value={{ token }}>
      {children}
    </PaymentContext.Provider>
  );
};