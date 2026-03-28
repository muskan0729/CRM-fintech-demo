import { api } from "./api";
const BASE_URL = import.meta.env.VITE_GLIDE_BACKEND_SERVICE_BASE_URL;

export const paymentService = {
  // Fetch payment details for review
  fetchReviewPayment: async (pgSessionId, token) => {
    return api(
      `${BASE_URL}/review-glide-widget-payments`,
      "POST",
      { session_id: pgSessionId },
      token
    );
  },

  // Called on successful payment
  fetchPaymentSuccess: async ({ sessionId, txHash }) => {
    return api(
      `${BASE_URL}/payment-success`,
      "POST",
      { session_id: sessionId, tx_hash: txHash }
    );
  },

  // Called if payment failed / error
  fetchPaymentError: async ({ sessionId, error }) => {
    return api(
      `${BASE_URL}/payment-error`,
      "POST",
      { session_id: sessionId, error: error?.message || error }
    );
  },

  // Called if user cancels payment
  fetchPaymentCancel: async ({ sessionId }) => {
    return api(
      `${BASE_URL}/payment-cancel`,
      "POST",
      { session_id: sessionId }
    );
  },
}