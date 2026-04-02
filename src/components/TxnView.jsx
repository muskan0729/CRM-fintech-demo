import React from "react";
import { useParams } from "react-router-dom";
import { useGet } from "../hooks/useGet";
import { useNavigate } from "react-router-dom";

const TxnView = () => {
  const { id } = useParams();

  const { data: id_data, loading } = useGet(
    id ? `/txn-records-List?id=${id}` : null
  );
const navigate = useNavigate();
  const txn = id_data?.data;

  const product = txn?.product?.toUpperCase();
  const isUPI = product === "UPI";
  const isPayout = product === "PAYOUT";

  const statusStyle = {
    SUCCESS: "bg-green-700 text-green-900",
    FAILED: "bg-red-100 text-red-600",
    PENDING: "bg-yellow-100 text-yellow-600",
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!txn) return <div className="p-6">No data found</div>;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">

      {/* 🔥 HEADER CARD */}
<div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 mb-6 flex justify-between items-start">

  {/* 💰 LEFT SIDE */}
  <div>
    <p className="text-sm text-gray-500">Transaction Amount</p>
    <h1 className="text-3xl font-semibold text-gray-800">
      ₹{txn.amount}
    </h1>
    <p className="text-xs text-gray-400 mt-1">
      ID: {txn.id}
    </p>
  </div>

  {/* 👉 RIGHT SIDE */}
  <div className="flex flex-col items-end gap-2">

    {/* Status */}
    <span
      className={`px-4 py-1 text-sm rounded-full font-medium shadow-sm ${
        statusStyle[txn.status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {txn.status || "N/A"}
    </span>

    {/* 🔙 Back Button BELOW status */}
    <button
      onClick={() => navigate(-1)}
      className="text-sm text-[var(--bg-color)] font-semibold hover:text-black transition uppercase mr-4 mt-1"
    >
      ← Back
    </button>

  </div>

</div>

      {/* 🔲 MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 🧾 COMMON DETAILS */}
        <Card title="Transaction Info">
          <Field label="Reference No" value={txn.refno || "N/A"} />
          <Field label="TxnId" value={txn.txnid || "N/A"} />
          <Field label="Product" value={txn.product || "N/A"} />
          <Field label="Merchant" value={txn.user?.name || "N/A"} />
          <Field
            label="Mobile"
            value={txn.mobile || txn.payer_mobile || "N/A"}
          />
          <Field label="Charges" value={txn.charge || "N/A"} />
          <Field label="GST" value={txn.gst || "N/A"} />
        </Card>

        {/* ⏱ TIMING */}
        {/* ⏱ TIMELINE */}
<Card
  title={
    isUPI
      ? "UPI Transaction Details"
      : isPayout
      ? "Payout Summary"
      : "Transaction Details"
  }
>
  {/* ✅ UPI → All timeline in one block */}
  {isUPI && (
    <div className="space-y-2">
      <Field label="Created At" value={txn.created_at || "N/A"} />
      <Field label="Updated At" value={txn.updated_at || "N/A"} />
      <Field label="Note" value={txn.note || "N/A"} />
                  <Field label="Payee VPA" value={txn.payee_vpa || "N/A"} />
            <Field
              label="Payin Rolling"
              value={txn.payin_rolling_amount || "N/A"}
            />
            <Field
              label="Payee TxnId"
              value={txn.mytxnid || "N/A"}
            />
    </div>
  )}

  {/* ✅ PAYOUT → keep detailed (as usual) */}
  {isPayout && (
    <>
      <Field label="Total Debited" value={txn.payout_amount || "N/A"} />
      <Field label="Opening Wallet" value={txn.payout_opening_balance || "N/A"} />
      <Field label="Closing Wallet" value={txn.payout_closing_balance || "N/A"} />

      <Field label="Created At" value={txn.created_at || "N/A"} />
      <Field label="Updated At" value={txn.updated_at || "N/A"} />
      <Field label="Note" value={txn.note || "N/A"} />
    </>
  )}

</Card>

        {/* 💰 UPI DETAILS */}
        {/* {isUPI && (
          <Card title="UPI Details">
            <Field label="Payee VPA" value={txn.payee_vpa || "N/A"} />
            <Field
              label="Payin Rolling"
              value={txn.payin_rolling_amount || "N/A"}
            />
            <Field
              label="Payee TxnId"
              value={txn.mytxnid || "N/A"}
            />
          </Card>
        )} */}

        {/* 🏦 PAYOUT DETAILS */}
        {isPayout && (
          <Card title="Payout Details">
             <Field
              label="Account holder Name"
              value={txn.payer_name || "N/A"}
            />           
            <Field
              label="Account Number"
              value={txn.payer_acc_no || "N/A"}
            />

            <Field label="IFSC" value={txn.payer_ifsc || "N/A"} />
            <Field
              label="Payment Mode"
              value={txn.payout_mode || "N/A"}
            />
            <Field label="Order ID" value={txn.mytxnid || "N/A"} />
          </Card>
        )}

      </div>
    </div>
  );
};

/* 🔲 Card Component (No border, soft shadow) */
const Card = ({ title, children }) => (
  <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-5 hover:shadow-lg transition">
    <h2 className="text-sm font-semibold text-[var(--bg-color)] mb-4">
      {title}
    </h2>
    <div className="space-y-3 text-sm">{children}</div>
  </div>
);

/* 📌 Field Row */
const Field = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <p className="text-[var(--primary-color)]">{label}</p>
    <p className="font-medium text-gray-800 text-right break-all">
      {value}
    </p>
  </div>
);

export default TxnView;