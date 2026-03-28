import { useState, useEffect } from "react";
import Button from "./Button";
import { useToast } from "../contexts/ToastContext";
import { usePost } from "../hooks/usePost";

const PayinSettlementModal = ({
  isOpen,
  onClose,
  merchant,
  onSuccess,
}) => {
  const toast = useToast();
  const { execute: payinSettlement } = usePost("/payin-settlement");

  const [formData, setFormData] = useState({
    payin_wallet: "",
    remark: "",
  });

  // reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        payin_wallet: "",
        remark: "",
      });
    }
  }, [isOpen]);

  // ✅ important guard
  if (!isOpen || !merchant) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      user_id: merchant.id,
      payin_wallet: formData.payin_wallet,
      remark: formData.remark,
    };

    try {
      const res = await payinSettlement(payload);

      if (res) {
        toast.success("Settlement done successfully!");

        onSuccess?.();
        onClose();
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Something went wrong!";

      toast.error(errorMessage);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-white border rounded-lg shadow-lg max-w-md w-full mx-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-t-lg px-5 py-3">
          <h3 className="text-lg font-semibold">
            Payin Settlement for {merchant.name}
          </h3>

          <Button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-500 hover:text-white"
          >
            ✕
          </Button>
        </div>

        {/* Body */}
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium">
              Amount
            </label>
            <input
              type="number"
              name="payin_wallet"
              value={formData.payin_wallet}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Remark
            </label>
            <textarea
              rows="3"
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PayinSettlementModal;