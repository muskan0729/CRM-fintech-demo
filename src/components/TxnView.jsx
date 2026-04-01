import React from "react";
import { useParams } from "react-router-dom";
import { useGet } from "../hooks/useGet";

const TxnView = () => {
  const { id } = useParams();
  const { data: id_data, loading } = useGet(
    id ? `/txn-records-List?id=${id}` : null
  );

  const txn = id_data?.data;

  if (loading) return <div className="p-6">Loading...</div>;
  if (!txn) return <div className="p-6">No data found</div>;

  return (
  <div className="p-6">

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

    {/* 🔹 LEFT SIDE */}
    <div className="bg-white shadow-md rounded-xl p-5 border space-y-6">

      {/* Order Details */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-700">
          Order Details
        </h2>

        <p><b>Order ID:</b> {txn.id}</p>
        <p><b>Created:</b> {txn.created_at}</p>

        {txn.updated_at && (
          <p className="text-sm text-blue-600">
            <b>Updated:</b> {txn.updated_at}
          </p>
        )}
      </div>

      {/* Merchant Details */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-700">
          Merchant Details
        </h2>

        <p className="font-medium">
          {txn.merchant_name || "N/A"}
        </p>

        <p className="text-sm text-gray-500">
          <b>User ID:</b> {txn.user_id || "N/A"}
        </p>
      </div>

    </div>

    {/* 🔹 RIGHT SIDE */}
    <div className="bg-white shadow-md rounded-xl p-5 border">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        Transaction Details
      </h2>

      <div className="grid grid-cols-2 gap-4 text-sm">

        <div>
          <p className="text-gray-500">Amount</p>
          <p className="font-medium">₹{txn.amount}</p>
        </div>

        <div>
          <p className="text-gray-500">Status</p>
          <p className="font-medium text-green-600">
            {txn.description || "N/A"}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Payee VPA</p>
          <p>{txn.payee_vpa || "N/A"}</p>
        </div>

        <div>
          <p className="text-gray-500">Ref No</p>
          <p>{txn.ref_no || "N/A"}</p>
        </div>

        <div>
          <p className="text-gray-500">Payee TxnId</p>
          <p>{txn.payee_txnid || "N/A"}</p>
        </div>

        <div>
          <p className="text-gray-500">TxnId</p>
          <p>{txn.txnid || "N/A"}</p>
        </div>

        <div>
          <p className="text-gray-500">Airpay ID</p>
          <p>{txn.airpay_credential || "N/A"}</p>
        </div>

        <div>
          <p className="text-gray-500">MID</p>
          <p>{txn.mid || "N/A"}</p>
        </div>

        <div>
          <p className="text-gray-500">Product</p>
          <p>{txn.product || "N/A"}</p>
        </div>

      </div>
    </div>

  </div>
</div>
  );
};

export default TxnView;