import React, { useEffect, useState } from "react";
import { usePost } from "../hooks/usePost";
import { useGet } from "../hooks/useGet";
import { useToast } from "../contexts/ToastContext";

const ApiSetting = () => {
  const Toast = useToast();
  const [PayinWebHook, setPayinWebHook] = useState("");
  const [PayoutWebhook, setPayoutWebHook] = useState("");


  const [isSaving, setIsSaving] = useState(false);
  // Fetch existing webhook data
  const { data: WebhookUrl, loading: WebHookLoading } = useGet("/show-merchant");

  useEffect(() => {
    if (WebhookUrl) {
      setPayinWebHook(WebhookUrl?.data?.payin_callback || "");
      setPayoutWebHook(WebhookUrl?.data?.payout_callback || "");
    }
  }, [WebhookUrl]);

  // Update webhook API
  const { execute: updateWebhook } = usePost("/update-merchant");

const handleSaveWebhook = async () => {
  setIsSaving(true);
  try {
    const res = await updateWebhook({
      payin_callback: PayinWebHook,
      payout_callback: PayoutWebhook,
    });

    if (res?.message === "Merchant updated successfully") {
      Toast.success("Webhook updated successfully!");
    }
  } catch (err) {
    console.log(err);
    Toast.error("Failed to update webhook!");
  } finally {
    setIsSaving(false);
  }
};

  return (
    <div className="p-6 md:p-8  mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--bg-color)] mb-10">
            Webhook Configuration
          </h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-8">            
            {/* Payin Webhook */}
            <div className="bg-gradient-to-br from-white to-blue-50/30 p-8 rounded-2xl shadow-lg border border-blue-100">
              <label className="block text-xl font-semibold text-[var(--bg-color)] mb-4">
                Payment Received Webhook URL
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-5 py-4 bg-white">
                <span className="text-[var(--bg-color)] mr-4 text-2xl">🔗</span>
                <input
                  type="text"
                  placeholder="https://yourdomain.com/payin-webhook"
                  className="w-full outline-none text-lg text-gray-800"
                  value={PayinWebHook}
                  onChange={(e) => setPayinWebHook(e.target.value)}
                />
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Real-time POST notifications for payins will be sent here.
              </p>
            </div>

            {/* Payout Webhook */}
            <div className="bg-gradient-to-br from-white to-blue-50/30 p-8 rounded-2xl shadow-lg border border-blue-100">
              <label className="block text-xl font-semibold text-[var(--bg-color)] mb-4">
                Payout Processed Webhook URL
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-5 py-4 bg-white">
                <span className="text-[var(--bg-color)] mr-4 text-2xl">🔗</span>
                <input
                  type="text"
                  placeholder="https://yourdomain.com/payout-webhook"
                  className="w-full outline-none text-lg text-gray-800"
                  value={PayoutWebhook}
                  onChange={(e) => setPayoutWebHook(e.target.value)}
                />
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Payout status updates will be sent here.
              </p>
            </div>
          </div>

   <button
  onClick={handleSaveWebhook}
  disabled={isSaving}
  className={`mt-12 w-full py-5 px-8 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300
    ${
      isSaving
        ? "bg-blue-400 cursor-not-allowed"
        : "text-white hover:from-blue-700 hover:to-indigo-700"
    }`}
  style={{ background: "var(--bg-submit)" }}
>
  {isSaving ? "Saving..." : "Save Webhook"}
</button>
        </div>
      </div>
    </div>
  );
};

export default ApiSetting;