// src/components/WalletModal.jsx
import { useEffect, useState } from "react";
import Button from "./Button";           // adjust path if needed
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";

export default function WalletModal({
  isOpen,
  onClose,
  merchant,               // full merchant object {id, name, ...}
  defaultMode = "load",   // "load" | "reverse"
  onSuccess,              // optional: refetch after success
}) {
  const toast = useToast();
  const [mode, setMode] = useState(defaultMode);
  useEffect(() => {
  setMode(defaultMode);
}, [defaultMode]);
  const [form, setForm] = useState({ payout_wallet: "", remark: "" });

  const { execute: loadWallet } = usePost("/payout-load-wallet");
  const { execute: reverseTopup } = usePost("/payout-take-back");

  if (!isOpen || !merchant?.id) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(form.payout_wallet);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    const payload = {
      user_id: merchant.id,
      payout_wallet: amount,
      remark: form.remark.trim() || "Fund transfer",
    };

    try {
      const api = mode === "load" ? loadWallet : reverseTopup;
      const res = await api(payload);
      if (res) {
        toast.success(
          mode === "load"
            ? "Wallet loaded successfully"
            : "Funds returned / deducted successfully"
        );
        onClose();
        setForm({ payout_wallet: "", remark: "" });
        onSuccess?.();
      }
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">
              {mode === "load" ? "Load Wallet" : "Reverse / Return Funds"}
            </h3>
            <p className="text-sm opacity-90 mt-1">
              {merchant.name || "Merchant"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:text-red-200"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Amount
            </label>
            <input
              type="number"
              name="payout_wallet"
              value={form.payout_wallet}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              placeholder="Enter amount"
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Remark
            </label>
            <textarea
              name="remark"
              value={form.remark}
              onChange={handleChange}
              rows={3}
              placeholder="Optional remark..."
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-red-400 hover:bg-red-300 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 text-white font-medium rounded-lg transition ${
                mode === "load" ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-400 hover:bg-blue-700"
              }`}
            >
              {mode === "load" ? "Load Wallet" : "Return Funds"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}