// src/components/VerifyModal.jsx
import React from "react";
import Button from "./Button";
import { useGet } from "../hooks/useGet";


export const VerifyModal = ({
  showVerifyModal,
  handleVerifyModal,
  action,
  heading = "Verify Merchant Onboarding",
  body = "Are you sure you want to verify and onboard this merchant? This action will complete the process.",
}) => {

  const {data:verifyMerchant} = useState('show-merchant')
  return (
    <>
      {showVerifyModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
          onClick={() => handleVerifyModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">{heading}</h3>
              <Button
                onClick={() => handleVerifyModal(false)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </Button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700 text-base">{body}</p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
              <Button
                type="button"
                onClick={() => handleVerifyModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  action();
                  handleVerifyModal(false);
                }}
                className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition"
              >
                Yes, Verify & Onboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};