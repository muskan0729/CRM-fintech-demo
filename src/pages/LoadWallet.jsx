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
  }));

  setWalletData(formatted);
}, [rawData]);

const handleLoadMore = () => {
  if (!hasMore || loading) return;
  fetchMerchants();
};


  const membercolumn = [
    { header: "User Id", accessor: "id" },
    { header: "Merchant", accessor: "name" },
    { header: "Payout Wallet", accessor: "payout_wallet" },
    { header: "Action", accessor: "action" },
  ];

  const tableDataWithActions = walletData?.map((row) => ({
    ...row,
   action: (
  <div className="flex items-center justify-start gap-2">
    <Button
            onClick={() => {
        setSelectedMerchant(row);
        setModalMode("load");
        setWalletModalOpen(true);
      }}
      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-md transition-all"
    >
      Load Wallet
    </Button>
    <Button
      // onClick={() => {
      //   setSelectedUser(row);
      //   setModalType("reverse");
      //   setShowModal(true);
      // }}
            onClick={() => {
        setSelectedMerchant(row);
        setModalMode("reverse");
        setWalletModalOpen(true);
      }}
      className="bg-blue-400 hover:bg-blue-500 text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-md transition-all"
    >
      Reverse Top-up
    </Button>
  </div>
),}));

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className=" rounded-lg flex justify-between items-center p-4 shadow-md"
      style={{ background: 'linear-gradient(250deg, #55abe9ff 0%, #00418c 100%)' }}>
        <h4 className="font-bold text-white text-xl">Load Wallet</h4>
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
    </div>

  );
  
};

export default LoadWallet;
