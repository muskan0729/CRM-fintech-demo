import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Table from "../components/Table";
import TableFilters from "../components/TableFilters";
import { MONTH_NAMES, REPORT_STATUSES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";
import { setSafeItem, getSafeItem, removeSafeItem } from "../utils/localSecure";

const BATCH_SIZE = 5000;
const FETCH_DELAY = 150;
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 min

const PayoutStatement = () => {
  const [merchantOptions, setMerchantOptions] = useState([]);


  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [totalSuccessAmount, setTotalSuccessAmount] = useState(0);

  const [entriesPerPage, setEntriesPerPage] = useState(50);
// const [perPage] = useState(50);

const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalRecords, setTotalRecords] = useState(0);

const [exporting, setExporting] = useState(false);


  const [txnSearch, setTxnSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
const [filteredData, setFilteredData] = useState([]);



  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  const userId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("auth") ||
    localStorage.getItem("userid") ||
    "default_user";

  
  const normalizeRows = useCallback((rows) => {
    return rows
      .map((item) => ({
        id: item.id,
        user_id: item.user_id,
        merchant_name: item.user?.name ?? "N/A",
        merchant_details_text: `${item.user?.name ?? "N/A"} (${item.user_id ?? "N/A"})`,

        holder: item.payer_name ?? "N/A",
        account: item.payer_acc_no ?? "N/A",
        ifsc: item.payer_ifsc ?? "N/A",
        upi_id: item.payer_upi ?? "N/A",
        mobile: item.payer_mobile ?? "N/A",

        payment_mode: item.payout_mode ?? "null",
        refno: item.refno ?? "null",
        mytxnid: item.mytxnid ?? "null",
        txnid: item.txnid ?? "null",

        opening_wallet_amount: item.payout_opening_balance ?? 0,
        pay_amount: item.amount ?? 0,
        charges: item.charge ?? 0,
        gst: item.gst ?? 0,
        total_debited_amount: (
          Number(item.amount ?? 0) + Number(item.profit ?? 0)
        ).toFixed(2),
        closing_wallet_amount: item.payout_closing_balance ?? 0,
        note: `Debit ${(
          Number(item.amount ?? 0) + Number(item.profit ?? 0)
        ).toFixed(2)} to Payout Wallet`,

        status: item.status ?? "N/A",
        created_at: item.created_at,
         updated_at: item.updated_at,   

        numericAmount: parseFloat(item.amount) || 0,
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, []);

useEffect(() => {
  fetchMerchants();
}, []);

const fetchMerchants = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/get-merchants`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();

    if (!res.ok || !result?.status) {
      throw new Error(result?.message);
    }

    // ✅ Convert to dropdown format
    const options = (result.data || []).map((m) => ({
      label: m.name,   // or m.business_name depending on API
      value: m.id,
    }));

    setMerchantOptions(options);

  } catch (err) {
    console.error("Merchant fetch error:", err);
    setMerchantOptions([]);
  }
};
useEffect(() => {
  fetchFilteredData();
}, [page, entriesPerPage, txnSearch, statusFilter, startDate, endDate, selectedMerchant]);


const fetchFilteredData = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");

    const params = {
      page,
      per_page: entriesPerPage,
      status: statusFilter !== "all" ? statusFilter : undefined,
 from_date: startDate
  ? new Date(new Date(startDate).setHours(0, 0, 0, 0))
      .toISOString()
      .split("T")[0]
  : undefined,

  to_date: endDate
  ? new Date(
      new Date(endDate).setHours(23, 59, 59, 999)
    ).toISOString().split("T")[0]
  : undefined,
      product: "payout",
      searchdata: txnSearch || undefined,
      user_id: selectedMerchant?.value || undefined,
    };

    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined)
    ).toString();

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/reportrecords-List?${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();
console.log("FILTER API RESPONSE:", result);

    if (!res.ok || !result?.status) {
      throw new Error(result?.message);
    }

    // ✅ IMPORTANT
    setTotalSuccessAmount(result.success_amount || 0);

    const formatted = normalizeRows(result.data || []);
    setFilteredData(formatted);

    // ✅ SET PAGINATION FROM API
    setTotalPages(result.pagination?.last_page || 1);
    setTotalRecords(result.pagination?.total || 0);

  } catch (err) {
    console.error(err);
    setFilteredData([]);
  } finally {
    setLoading(false);
  }
};

const fetchAllDataForExport = async () => {
  try {
    const token = localStorage.getItem("token");

    let currentPage = 1;
    let lastPage = 1;
    let allData = [];

    do {
      const params = {
         exportdata: 1, 
        page: currentPage,
        per_page: entriesPerPage, // ✅ use same pagination size
        status: statusFilter !== "all" ? statusFilter : undefined,
  from_date: formatDateForAPI(startDate),
to_date: formatDateForAPI(endDate, true),
        product: "payout",
        searchdata: txnSearch || undefined,
        user_id: selectedMerchant?.value || undefined,
      };

      const query = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== undefined)
      ).toString();

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/reportrecords-List?${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();

      if (!res.ok || !result?.status) {
        throw new Error(result?.message);
      }

      const formatted = normalizeRows(result.data || []);

      allData = [...allData, ...formatted];

      // ✅ update loop control
      lastPage = result.pagination?.last_page || 1;
      currentPage++;

    } while (currentPage <= lastPage);

    return allData;

  } catch (err) {
    console.error(err);
    return [];
  }
};

  const escapeCSV = (field) => {
    const string = String(field ?? "");
    if (
      string.includes('"') ||
      string.includes(",") ||
      string.includes("\n") ||
      string.includes("\r")
    ) {
      return `"${string.replace(/"/g, '""')}"`;
    }
    return string;
  };

  const downloadFile = (content, filename, mimeType) => {
    const encodedUri = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatExportDateTime = (value) => {
    if (!value) {
      return { date: "", time: "" };
    }

    const d = new Date(value);

    if (isNaN(d.getTime())) {
      const raw = String(value).trim();
      const parts = raw.split(" ");
      return {
        date: parts[0] || "",
        time: parts[1] || "",
      };
    }

    return {
      date: d.toLocaleDateString("en-GB"),
      time: d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    };
  };


  const formatDateForAPI = (date, isEnd = false) => {
  if (!date) return undefined;

  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();

  if (isEnd) {
    d.setHours(23, 59);
  } else {
    d.setHours(0, 0);
  }

  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${day} ${month} ${year}, ${time}`;
}; 


  const exportCSV = async () => {
    try{
      setExporting(true);
           const allData = await fetchAllDataForExport();

  if (!allData.length) {
    alert("No data to export.");
    return;

    }


  const csvRows = allData.map((row) => {
    const { date, time } = formatExportDateTime(row.created_at);

        return {
        "Order ID": row.id,
        "User ID": row.user_id,
        "Merchant Name": row.merchant_name,
        "Merchant Details": row.merchant_details_text,
        Holder: row.holder,
        Account: row.account,
        IFSC: row.ifsc,
        "UPI Id": row.upi_id,
        Mobile: row.mobile,
        "Payment Mode": row.payment_mode,
        "Ref No": row.refno,
        "Order Ref ID": row.mytxnid,
        TxnId: row.txnid,
        "Opening Wallet Amount": row.opening_wallet_amount,
        "Pay Amount": row.pay_amount,
        "Charges": row.charges,
         "GST": row.gst,
        "Total Debited Amount": row.total_debited_amount,
        "Closing Wallet Amount": row.closing_wallet_amount,
        Note: row.note,
        Status: row.status,
        Date: date,
        Time: time,
    };
  });

  const headers = Object.keys(csvRows[0]);

  const csv = [
    headers.map(escapeCSV).join(","),
    ...csvRows.map((row) =>
      headers.map((header) => escapeCSV(row[header])).join(",")
    ),
  ].join("\n");

  downloadFile(csv, "Payout_statement_filtered.csv", "text/csv");
}catch(err){
   console.error(err);
    alert("Export failed");
}finally {
    setExporting(false); // ✅ stop loader
  }
};


  const handleClearAll = () => {
    setTxnSearch("");
    setStatusFilter("all");
    setStartDate(null);
    setEndDate(null);
    setSelectedMerchant(null);
  };


  const statusClasses = {
    pending: "bg-[#dfaf03ff] text-white",
    initiated: "bg-blue-400 text-white",
    success: "bg-[#057034ff] text-white",
    completed: "bg-[#057034ff] text-white",
    failed: "bg-[#ff3366] text-white",
    reversed: "bg-[#ff3366] text-white",
    refunded: "bg-[#ff3366] text-white",
  };

  const payoutColumn = [
{
  header: "Order Id",
  accessor: "id",
  Cell: ({ row }) => {
    const created = new Date(row.created_at);
    const updated = new Date(row.updated_at);

    const formatDate = (d) =>
      isNaN(d)
        ? "N/A"
        : `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;

    const formatTime = (d) =>
      isNaN(d)
        ? "N/A"
        : d
            .toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
            .toUpperCase();

    return (
      <div className="flex flex-col text-left w-20">
        {/* Order ID */}
        <span>
          <b>{row.id}</b>
        </span>

        {/* Created */}
        <span>{formatDate(created)}</span>
        <span className="text-xs text-gray-500">
          {formatTime(created)}
        </span>

        {/* Updated */}
        {row.updated_at && (
          <>
            <span className="mt-1">
              Updated at:<br />
              {formatDate(updated)}
            </span>
            <span className="text-xs text-blue-500">
              {formatTime(updated)}
            </span>
          </>
        )}
      </div>
    );
  },
},
    {
      header: "Merchant Details",
      accessor: "merchant_details_text",
      Cell: ({ row }) => (
        <div className="flex flex-col text-left">
          <span>
            <b>{row.merchant_name}</b>
          </span>
          <span>User ID: {row.user_id ?? "N/A"}</span>
        </div>
      ),
    },
    {
      header: "Bank Details",
      accessor: "holder",
      Cell: ({ row }) => (
        <div className="flex flex-col text-left">
          <span>
            Holder: <b>{row.holder}</b>
          </span>
          <span>
            Account: <b>{row.account}</b>
          </span>
          <span>
            IFSC: <b>{row.ifsc}</b>
          </span>
          <span>
            UPI Id: <b>{row.upi_id}</b>
          </span>
          <span>
            Mobile: <b>{row.mobile}</b>
          </span>
        </div>
      ),
    },
    {
      header: "Reference Details",
      accessor: "payment_mode",
      Cell: ({ row }) => (
        <div className="flex flex-col text-left">
          <span>
            Payment Mode: <b>{row.payment_mode}</b>
          </span>
          <span>
            Ref No: <b>{row.refno}</b>
          </span>
          <span>
            Order ID: <b>{row.mytxnid}</b>
          </span>
          <span>
            Txnid: <br />
            <b>{row.txnid}</b>
          </span>
        </div>
      ),
    },
    {
      header: "Amount / Commission",
      accessor: "pay_amount",
      Cell: ({ row }) => (
        <div className="flex flex-col text-left">
          <span>
            Opening Wallet Amount: <b>{row.opening_wallet_amount}</b>
          </span>
          <span>
            Pay Amount: <b>{row.pay_amount}</b>
          </span>
          <span>
            Charges: <b>{row.charges}</b>
          </span>
                    <span>
            GST: <b>{row.gst}</b>
          </span>
          <span>
            Total Debited Amount: <b>{row.total_debited_amount}</b>
          </span>
          <span>
            Closing Wallet Amount: <b>{row.closing_wallet_amount}</b>
          </span>
          <span>
            Note: <b>{row.note}</b>
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      Cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${
            statusClasses[String(row.status || "").toLowerCase()] ?? "bg-gray-600 text-white"
          }`}
        >
          {row?.status
            ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
            : "N/A"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4">
<div
  className="rounded-lg flex justify-between items-center p-4 shadow-md"
  style={{
    background: "var(--bg-gradient)",
  }}
>
  {/* LEFT SIDE */}
  <h4 className="font-bold text-white text-xl">
    Payout Statement
  </h4>

  {/* RIGHT SIDE */}
  <button
    onClick={() => setShowFilterSidebar(true)}
    className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
  >
     🔍Select Filter
  </button>

        {/* <button
          onClick={handleRefreshData}
          className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hidden"
        >
          Refresh
        </button> */}
      </div>

   {showFilterSidebar && (
  <div className="fixed inset-0 z-50 flex">
    
    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black/75 bg-opacity-50"
      onClick={() => setShowFilterSidebar(false)}
    ></div>

    {/* Sidebar */}
    <div className="relative ml-auto w-[350px] bg-white h-full shadow-lg p-4 overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Filters</h2>

            <TableFilters
       merchantOptions={merchantOptions}
        rawData={filteredData}
        txnSearch={txnSearch}
        setTxnSearch={setTxnSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        selectedMerchant={selectedMerchant}
        setSelectedMerchant={setSelectedMerchant}
        statusList={REPORT_STATUSES}
        showExport={true}
        showStatusFilter={true}
        showDateFilter={true}
        showSelectUserFilter={true}
        // onExportCSV={exportCSV}
  onExportCSV={exportCSV}
  exporting={exporting}

        onClearAll={handleClearAll}
        totalSuccessAmount={totalSuccessAmount}
      />
      </div></div>
  
  )}


      {loading && filteredData.length === 0 ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-center py-6 text-red-500">{error}</div>
      ) : (
        <>
          <Table
            columns={payoutColumn}
            data={filteredData}
            showPagination={true}
            showDeleteColumn={false}
            isServerPaginated={true}
            entriesPerPage={entriesPerPage}
             setEntriesPerPage={setEntriesPerPage}
  totalPages={totalPages}
  currentPage={page}   // ✅ ADD THIS
  onPageChange={(newPage) => setPage(newPage)}
          />


        </>
      )}
    </div>
  );
};

export default PayoutStatement;