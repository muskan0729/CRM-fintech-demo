import { useEffect, useRef, useState } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import { useGet } from "../hooks/useGet";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";
import { TableSkeleton } from "../components/TableSkeleton";
import  WalletModal  from "../components/WalletModal";


const LoadWallet = () => {
  const [modalType, setModalType] = useState("load");

const [walletModalOpen, setWalletModalOpen] = useState(false);
const [selectedMerchant, setSelectedMerchant] = useState(null);
const [modalMode, setModalMode] = useState("load");

const [showPayinModal, setShowPayinModal] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);

const [payinFormData, setPayinFormData] = useState({
  payin_wallet: "",
  remark: "",
});

const toast = useToast();
const { execute: payinSettlement } = usePost("/payin-settlement");

  const [rawData, setRawData] = useState([]);
const [walletData, setWalletData] = useState([]);

const [cursor, setCursor] = useState(null);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const [entriesPerPage, setEntriesPerPage] = useState(50);
const lastCursorRef = useRef(null);

const fetchMerchants = async (force = false) => {
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
  fetchMerchants();
}, []);



useEffect(() => {
  setRawData([]);
  setWalletData([]);
  setCursor(null);
  setHasMore(true);
  lastCursorRef.current = null;
  // fetchMerchants();
  setTimeout(() => {
    fetchMerchants(true);
  }, 0);
}, [entriesPerPage]);


  // const initialDataOfWallet = tableData?.data;

  useEffect(() => {
  if (!rawData.length) return;

  const formatted = rawData.map((item, index) => ({
    sqno: index + 1,
    id: item.id,
    name: item.name,
    payout_wallet: item.payout_wallet,
    payin_wallet: item.payin_wallet,
  }));

  setWalletData(formatted);
}, [rawData]);

const handleLoadMore = () => {
  if (!hasMore || loading) return;
  fetchMerchants();
};


  const membercolumn = [
    { header: "User Id", accessor: "id" },
    { header: "Merchant", accessor: "name"},
    { header: "Payout Wallet", accessor: "payout_wallet" },
      { header: "Payin Wallet", accessor: "payin_wallet" },
    { header: "Action", accessor: "action" },
  ];

  const tableDataWithActions = walletData?.map((row) => ({
    ...row,
   name:(
   <div style={{ width: "150px"}}>
    {row.name}
   </div>
   ),
 
   action: (
  <div className="flex flex-col items-start gap-2">
    <Button
            onClick={() => {
        setSelectedMerchant(row);
        setModalMode("load");
        setWalletModalOpen(true);
      }}
      className=" hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-md transition-all"
    style={{ background:"var(--bg-button)"}}
    >
      Top-up Wallet
    </Button>
        <Button
      onClick={() => {
        setSelectedUser(row);
        setShowPayinModal(true);
      }}
      className="text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-md transition-all"
      style={{ background: "var(--bg-button)" }}
    >
      Payment Settlement
    </Button>
    {/* <Button

            onClick={() => {
        setSelectedMerchant(row);
        setModalMode("reverse");
        setWalletModalOpen(true);
      }}
      className=" hover:bg-blue-500 text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-md transition-all"
  style={{ background:"var(--bg-button)"}}
  >
      Reverse Top-up
    </Button> */}
  </div>
),}));


// payin settlement
const handlePayinChange = (e) => {
  setPayinFormData({
    ...payinFormData,
    [e.target.name]: e.target.value,
  });
};

const handlePayinSubmit = async (e) => {
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

      // refresh table
      setRawData([]);
      setWalletData([]);
      setCursor(null);
      setHasMore(true);
      lastCursorRef.current = null;

      fetchMerchants(true);
      setShowPayinModal(false);
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
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className=" rounded-lg flex justify-between items-center p-4 shadow-md"
      style={{  background:"var(--bg-gradient)" }}>
        <h4 className="font-bold text-white text-xl">Wallet Settlement</h4>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <Table
          columns={membercolumn}
          data={tableDataWithActions}
          showStatusFilter={false}
          showDateFilter={false}
          showDeleteColumn={false}
          className="shadow-lg rounded-lg overflow-hidden"
           showExport={false}

          isServerPaginated
          hasMore={hasMore}
          isLoadingMore={loading}
          onLoadNext={handleLoadMore}
          entriesPerPage={entriesPerPage}
          setEntriesPerPage={setEntriesPerPage}
          
        />
      )}

<WalletModal
  isOpen={walletModalOpen}
  onClose={() => setWalletModalOpen(false)}
  merchant={selectedMerchant}
  defaultMode={modalMode}
  onSuccess={() => {
    // optional refresh logic
    setRawData([]);
    setWalletData([]);
    setCursor(null);
    setHasMore(true);
    lastCursorRef.current = null;
    fetchMerchants(true);
  }}
/>


{showPayinModal && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
    onClick={() => setShowPayinModal(false)}
  >
    <div
      className="bg-white  rounded-lg shadow-lg max-w-md w-full mx-2"
      onClick={(e) => e.stopPropagation()}
    >
      
      {/* Header */}
      <div className=" text-white px-5 py-3 rounded-t-lg flex justify-between"
      style={{background:"var(--bg-color)"}}>
        <h3 className="font-semibold">
          Payin Settlement for {selectedUser?.name}
        </h3>
        <button onClick={() => setShowPayinModal(false)}>✕</button>
      </div>

      {/* Body */}
      <form onSubmit={handlePayinSubmit} className="p-5 space-y-4">
        <input
          type="number"
          name="payin_wallet"
          placeholder="Enter Amount"
          value={payinFormData.payin_wallet}
          onChange={handlePayinChange}
          className="w-full border p-2 rounded-lg"
        />

        <textarea
          name="remark"
          placeholder="Enter Remark"
          value={payinFormData.remark}
          onChange={handlePayinChange}
          className="w-full border p-2 rounded-lg"
        />

        <Button
          type="submit"
          className="w-full text-[var(--bg-color)] font-bold py-2 rounded-lg"
          style={{ background: "var(--bg-submit)" }}
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

export default LoadWallet;
