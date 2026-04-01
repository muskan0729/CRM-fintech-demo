import { useEffect, useRef, useState } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import { useGet } from "../hooks/useGet";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";
import { TableSkeleton } from "../components/TableSkeleton";
import  WalletModal  from "../components/WalletModal";


const LoadWallet = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  // const [walletData, setWalletData] = useState([]);
  const [modalType, setModalType] = useState("load");

const [walletModalOpen, setWalletModalOpen] = useState(false);
const [selectedMerchant, setSelectedMerchant] = useState(null);
const [modalMode, setModalMode] = useState("load");


  const toast = useToast();
  const [walletFormData, setWalletFormData] = useState({
    payout_wallet: "",
    remark: "",
  });


  const [rawData, setRawData] = useState([]);
const [walletData, setWalletData] = useState([]);

const [cursor, setCursor] = useState(null);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const [entriesPerPage, setEntriesPerPage] = useState(50);
const lastCursorRef = useRef(null);


  // const { data: tableData, refetch, loading } = useGet("/get-merchants");
  // console.log( "load Wallet data",tableData);   

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




  const { execute: loadWallet } = usePost("/payout-load-wallet");
  const { execute: reverseTopup } = usePost("/payout-take-back");

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


  const handleChange = (e) => {
    setWalletFormData({ ...walletFormData, [e.target.name]: e.target.value });
  };

  const handleSubmitLoadWallet = async (e) => {
    e.preventDefault();
    const payload = {
      user_id: selectedUser.id,
      payout_wallet: walletFormData.payout_wallet,
      remark: walletFormData.remark,
    };

    try {
      const res = await loadWallet(payload);
      if (res) {
        toast.success("Wallet loaded successfully!!");
        // refetch();
        setRawData([]);
        setWalletData([]);
        setCursor(null);
        setHasMore(true);
        lastCursorRef.current = null;
        fetchMerchants();

        setShowModal(false);
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong!!");
    }
  };

  const handleSubmitReverseTopup = async (e) => {
    e.preventDefault();
    const payload = {
      user_id: selectedUser.id,
      payout_wallet: walletFormData.payout_wallet,
      remark: walletFormData.remark,
    };

    try {
      const res = await reverseTopup(payload);
      if (res) {
        toast.success("Deducted balance from wallet successfully!!");
        // refetch();
        // setRawData([]);
        // setWalletData([]);
        // setCursor(null);
        // setHasMore(true);  
        // lastCursorRef.current = null;
        // fetchMerchants();
          setRawData((prev) =>
          prev.map((item) =>
            item.id === selectedUser.id
              ? { ...item, payout_wallet: res.data?.payout_wallet ?? item.payout_wallet }
              : item
          )
        );

        setShowModal(false);
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong!!");
    }
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
      // onClick={() => {
      //   setSelectedUser(row);
      //   setModalType("load");
      //   setShowModal(true);
      // }}
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
      style={{  background:"var(--bg-gradient)" }}>
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
                {modalType === "load"
                  ? `Wallet Topup for ${selectedUser?.name}`
                  : `Reverse Topup for ${selectedUser?.name}`}
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
              onSubmit={
                modalType === "load"
                  ? handleSubmitLoadWallet
                  : handleSubmitReverseTopup
              }
            >
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Amount
                </label>
                <input
                  name="payout_wallet"
                  type="number"
                  value={walletFormData.payout_wallet}
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
                  value={walletFormData.remark}
                  onChange={handleChange}
                  placeholder="Enter Remark"
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>

              <Button
                type="submit"
                onClick={
                  modalType === "load"
                    ? handleSubmitLoadWallet
                    : handleSubmitReverseTopup
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg shadow-md transition"
              >
                Submit
              </Button>

              
            </form>
          </div>
        </div>
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
