import { useEffect, useRef, useState } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import { useToast } from "../contexts/ToastContext";
import { useGet } from "../hooks/useGet";
import { usePost } from "../hooks/usePost";
import { TableSkeleton } from "../components/TableSkeleton";

const PayinSettlement = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const toast = useToast();
  // const [payinSettlementData, setPayinSettlementData] = useState([]);
  const [payinFormData, setPayinFormData] = useState({
    payin_wallet: "",
    remark: "",
  });

const [rawData, setRawData] = useState([]);
const [payinSettlementData, setPayinSettlementData] = useState([]);

const [cursor, setCursor] = useState(null);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const [entriesPerPage, setEntriesPerPage] = useState(50);
const lastCursorRef = useRef(null);

const fetchMerchantsPayin = async (force = false) => {
  if (!force) {
    if (loading || !hasMore) return;
    if (cursor !== null && lastCursorRef.current === cursor) return;
  }

  lastCursorRef.current = cursor;
  setLoading(true);

  try {
    const token = localStorage.getItem("token");

  const query = new URLSearchParams({ 
    per_page: entriesPerPage,
    ...(cursor && !force ? { cursor } : {}),
  }).toString();

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/get-merchants?${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const json = await res.json();

    if (json?.status) {
      setRawData((prev) => {
        const ids = new Set(prev.map((i) => i.id));
        const unique = json.data.filter((i) => !ids.has(i.id));
        return [...prev, ...unique];
      });

      setCursor(json.next_cursor);
      setHasMore(Boolean(json.next_cursor));
    } else {
      throw new Error("Invalid response");
    }
  } catch (err) {
    console.error(err);
    setError("Failed to load merchants");
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  fetchMerchantsPayin();
}, []);



useEffect(() => {
  setRawData([]);
  setCursor(null);
  setHasMore(true);
  lastCursorRef.current = null;
  // fetchMerchants();
  setTimeout(() => {
    fetchMerchantsPayin(true);
  }, 0);
}, [entriesPerPage]);
  // const { data: tableData, refetch, loading } = useGet("/get-merchants");
  const { execute: payinSettlement } = usePost("/payin-settlement");

  // const initialDataOfPayinWallet = tableData?.data;

useEffect(() => {
  if (!rawData.length) return;

  const formatted = rawData.map((item, index) => ({
    sqno: index + 1,
    id: item.id,
    name: item.name,
    payin_wallet: item.payin_wallet,
  }));

  setPayinSettlementData(formatted);
}, [rawData]);

const handleLoadMore = () => {
  if (!hasMore || loading) return;
  fetchMerchantsPayin();
};



  const membercolumn = [
    { header: "User Id", accessor: "id" },
    { header: "Merchant", accessor: "name" },
    { header: "Payin Wallet", accessor: "payin_wallet" },
    { header: "Action", accessor: "action" },
  ];

  const tableDataWithActions = payinSettlementData?.map((row) => ({
    ...row,
    action: (
      <Button
        onClick={() => {
          setSelectedUser(row);
          setShowModal(true);
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-md transition-all"
      >
        Payin Settlement
      </Button>
    ),
  }));

  const handleChange = (e) => {
    setPayinFormData({ ...payinFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      user_id: selectedUser.id,
      payin_wallet: payinFormData.payin_wallet,
      remark: payinFormData.remark,
    };

    try {
      const res = await payinSettlement(payload);
      if (res) {
        toast.success("Settlement done successfully!!");

        setRawData([]);
setCursor(null);
setHasMore(true);
lastCursorRef.current = null;

fetchMerchantsPayin(true);
        setShowModal(false);
      }
    } catch (err) {
      console.log(err);
      // toast.error("Something went wrong!");
            const errorMessage =
        err?.response?.data?.message ||  // Axios-style
        err?.data?.message ||            // Custom hook style
        err?.message ||                  // JS error
        "Something went wrong!";

      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="rounded-lg flex justify-between items-center p-4 shadow-md"
      style={{ background: 'linear-gradient(250deg, #55abe9ff 0%, #00418c 100%)' }}>
        <h4 className="font-bold text-white text-xl">Payin Settlement</h4>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : ( 
        <Table
          columns={membercolumn}
          data={tableDataWithActions}
          showDeleteColumn={false}
          showDateFilter={false}
          showStatusFilter={false}
           showExport={false}
            isServerPaginated
          hasMore={hasMore}
          isLoadingMore={loading}
          onLoadNext={handleLoadMore}
          entriesPerPage={entriesPerPage}
          setEntriesPerPage={setEntriesPerPage}
          
        />
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white border rounded-lg shadow-lg max-w-md w-full mx-2 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-t-lg px-5 py-3">
              <h3 className="text-lg font-semibold">
                Payin Settlement for {selectedUser?.name}
              </h3>
              <Button
                onClick={() => setShowModal(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-red-500 font-bold text-lg shadow-md hover:bg-red-500 hover:text-white transition"
              >
                <i className="fa-solid fa-xmark fa-lg"></i>
              </Button>
            </div>

            {/* Modal Body */}
            <form
              className="p-6 space-y-4"
              onSubmit={handleSubmit}
            >
              <div>
                <label className="block mb-1 text-sm font-medium">Amount</label>
                <input
                  type="number"
                  name="payin_wallet"
                  value={payinFormData.payin_wallet}
                  onChange={handleChange}
                  placeholder="Enter Amount"
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Remark</label>
                <textarea
                  rows="3"
                  name="remark"
                  value={payinFormData.remark}
                  onChange={handleChange}
                  placeholder="Enter Remark"
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <Button
                type="submit"
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg shadow-md transition"
              >
                Submit
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayinSettlement;
