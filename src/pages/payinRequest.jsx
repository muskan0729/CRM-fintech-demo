import { useEffect, useRef, useState } from "react";

import Button from "../components/Button";
import { usePost } from "../hooks/usePost";
import useAutoFetch from "../hooks/useAutoFetch";

export const PayinRequest = () => {
  const [payerName, setPayerName] = useState("");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [payerMobile, setPayerMobile] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerOrderId, setPayerOrderId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [tokens, setTokens] = useState([]);
const [selectedToken, setSelectedToken] = useState("");

  const intervalRef = useRef(null);

  const { data } = useAutoFetch("/collection-record");
  // const { execute: executePayin, loading } = usePost("/Airpay/request");
  const { execute: executePayin, loading } = usePost("/payin/request");
  const { execute: executeCheckStatus } = usePost("/payin/status");
  // console.log("collection records", data);
  // const payin_wallet = collection_data?.data;
const { data: tokenData } = useAutoFetch("/get-tokens");
useEffect(() => {
  if (tokenData?.data) {
    setTokens(tokenData.data);
  }
}, [tokenData]);
  const payingAmount = data?.PayingAmount ?? "0.00";
  // Generate unique order ID on mount
  useEffect(() => {
    const uniqueOrderId = `DSB${Date.now()}${Math.floor(Math.random() * 1000)}`;
    setPayerOrderId(uniqueOrderId);
  }, []);

  // Poll payment status
  useEffect(() => {
    if (orderId) {
      intervalRef.current = setInterval(checkPaymentStatus, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [orderId]);

  // Auto-reset form after success/fail
  useEffect(() => {
    if (showSuccess || showFailed) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setShowFailed(false);
        setQrUrl("");
        setAmount("");
        setPayerName("");
        setPayerMobile("");
        setPayerEmail("");
        const uniqueOrderId = `DSB${Date.now()}${Math.floor(
          Math.random() * 1000
        )}`;
        setPayerOrderId(uniqueOrderId);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, showFailed]);

  
  const handlePayinSubmit = async () => {
    if (qrUrl || orderId) return;
    if (Number(amount) < 10) {
      setAmountError("Amount must be at least ₹10");
      return;
    }
    try {
      const payload = {
        token :selectedToken,
        name: payerName,
        phone: payerMobile,
        email: payerEmail,
        amount,
        orderid: payerOrderId,
      };
      const data = await executePayin(payload);
      if (data.status === "success") {
        setQrUrl(
          `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
            data.data.qrcode_string
          )}`
        );
        setOrderId(data.data.orderid);
        setShowSuccess(false);
        setShowFailed(false);
      } else {
        setShowFailed(true);
        setQrUrl("");
      }
    } catch {
      setShowFailed(true);
      setQrUrl("");
    }
  };

  const checkPaymentStatus = async () => {
    try {
      if (!orderId) return;
      const formData = new FormData();
      formData.append("orderid", orderId);
      const statusData = await executeCheckStatus(formData);
      if (statusData?.status === "SUCCESS") {
        clearInterval(intervalRef.current);
        setShowSuccess(true);
        setShowFailed(false);
        setQrUrl("");
      } else if (statusData?.status === "FAILED") {
        clearInterval(intervalRef.current);
        setShowFailed(true);
        setShowSuccess(false);
        setQrUrl("");
      }
    } catch (err) {
      console.error(err);
    }
  };
  const isFormValid =
    payerName.trim().length >= 3 &&
    Number(amount) >= 10 &&
    payerMobile.length === 10 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail);

  // resret qr
  const resetPayinState = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;

    setQrUrl("");
    setOrderId("");
    setShowSuccess(false);
    setShowFailed(false);

    // generate NEW order id
    const newOrderId = `DSB${Date.now()}${Math.floor(Math.random() * 1000)}`;
    setPayerOrderId(newOrderId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      {/* <h1>Payin wallet {payingAmount}</h1> */}

      <div
        className="rounded-lg p-4 shadow-md flex items-center"
        style={{
          background: "linear-gradient(250deg, #2a91d9 0%, #0555afff 100%)",
        }}
      >
        {/* Left Side */}
        <div className="flex-1">
          <h4 className="text-white font-bold text-xl">Load Wallet</h4>
        </div>

        {/* Right Side */}
        {/* <div className="flex-1 flex justify-end">
    <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg shadow-md">
      <h1 className="text-lg font-semibold mr-3">Payin Wallet :</h1>
      <span className="text-lg font-semibold text-indigo-600">
        {payingAmount}
      </span>
    </div>
  </div> */}
      </div>

      {/* Form */}
      {!qrUrl && !showSuccess && !showFailed && (
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4 border border-gray-200">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative w-full">
              <input
                type="text"
                value={payerName}
                onChange={(e) => {
                  const value = e.target.value;

                  // allow only letters & spaces
                  if (!/^[a-zA-Z\s]*$/.test(value)) return;

                  setPayerName(value);
                }}
                className="block w-full border-b-2 border-gray-300 py-2 px-0 text-gray-900 bg-transparent focus:outline-none focus:border-blue-600 peer"
                placeholder=" "
              />

              <label
                className={`absolute left-0 text-gray-500 text-sm transition-all duration-200
                ${payerName ? "-top-3 text-blue-600 text-xs" : "top-2"} 
                peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm`}
              >
                Payer Name
              </label>
            </div>

            <div className="relative w-full">
              <input
                type="text"
                required
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;

                  // allow only numbers
                  if (!/^\d*$/.test(value)) return;

                  setAmount(value);
                  setAmountError(
                    value && Number(value) < 10
                      ? "Amount must be at least ₹10"
                      : ""
                  );
                }}
                className="peer block w-full border-b-2 border-gray-300 py-2 px-0 text-gray-900 focus:border-blue-600 focus:outline-none placeholder-transparent"
                placeholder=" "
              />

              <label
                className="
                absolute left-0 text-gray-500 text-sm 
                transition-all duration-200
                peer-placeholder-shown:top-2
                peer-placeholder-shown:text-gray-400
                peer-focus:-top-3
                peer-focus:text-blue-600
                peer-valid:-top-3
                peer-valid:text-blue-600
              "
              >
                Amount
              </label>
              {amountError && (
                <p className="text-red-600 text-sm mt-1">{amountError}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Mobile Number */}
            <div className="relative w-full">
              <input
                type="text"
                inputMode="numeric"
                required
                value={payerMobile}
                onChange={(e) => {
                  const value = e.target.value;

                  // allow digits only
                  if (!/^\d*$/.test(value)) return;

                  // max 10 digits
                  if (value.length > 10) return;

                  setPayerMobile(value);
                }}
                className="peer block w-full border-b-2 border-gray-300 py-2 px-0
            text-gray-900 focus:border-blue-600 focus:outline-none 
            placeholder-transparent"
                placeholder=" "
              />

              <label
                className="
                absolute left-0 text-gray-500 text-sm transition-all duration-200

                peer-placeholder-shown:top-2
                peer-placeholder-shown:text-gray-400
                
                peer-focus:-top-3
                peer-focus:text-blue-600

                peer-valid:-top-3
                peer-valid:text-blue-600
              "
              >
                Mobile Number
              </label>
            </div>

            {/* Email */}
            <div className="relative w-full">
              <input
                type="email"
                required
                value={payerEmail}
                onChange={(e) => {
                  const value = e.target.value;

                  // prevent spaces
                  if (/\s/.test(value)) return;

                  setPayerEmail(value);
                }}
                className="peer block w-full border-b-2 border-gray-300 py-2 px-0
            text-gray-900 focus:border-blue-600 focus:outline-none 
            placeholder-transparent"
                placeholder=" "
              />

              <label
                className={`
                  absolute left-0 text-gray-500 text-sm transition-all duration-200
                  
                  ${payerEmail ? "-top-3 text-blue-600" : "top-2 text-gray-400"}
                  peer-focus:-top-3 peer-focus:text-blue-600
                `}
              >
                Email
              </label>
            </div>

            <div className="relative w-full">
  <select
    value={selectedToken}
    onChange={(e) => setSelectedToken(e.target.value)}
    className="block w-full text-sm text-gray-500 border-b-2 border-gray-300 py-2 px-0 bg-transparent focus:outline-none focus:border-blue-600"
  >
    <option value="">Select Token</option>

    {tokens.map((item) => (
      <option key={item.id} value={item.token}>
        {item.token}
      </option>
    ))}
  </select>

  <label className="absolute -top-3 text-blue-600 text-xs">
    Token
  </label>
</div>
          </div>

          <div className="flex justify-center mt-4">
            <Button
              onClick={handlePayinSubmit}
              disabled={!isFormValid || loading}
              className={`rounded-lg px-6 py-2 shadow-md text-white
                  ${
                    !isFormValid || loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      )}

      {/* QR Code */}
      {qrUrl && (
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border border-gray-200">
            <h3 className="text-gray-800 font-semibold text-lg mb-4">
              Scan to Pay
            </h3>
            <img src={qrUrl} alt="UPI QR Code" className="w-64 h-64 mb-4" />
            <Button
              onClick={resetPayinState}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Success / Fail */}
      {showSuccess && (
        <div className="flex justify-center">
          <div className="bg-green-100 w-72 h-72 rounded-full shadow-lg flex flex-col items-center justify-center border border-green-300">
            <h2 className="text-green-800 font-bold text-lg">
              Payment Successful!
            </h2>
          </div>
        </div>
      )}

      {showFailed && (
        <div className="flex justify-center">
          <div className="bg-red-100 w-72 h-72 rounded-full shadow-lg flex flex-col items-center justify-center border border-red-300">
            <h2 className="text-red-700 font-bold text-lg">Payment Failed!</h2>
            <p className="text-red-600 text-sm mt-1">Please try again</p>
          </div>
        </div>
      )}
    </div>
  );
};
