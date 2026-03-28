import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Table from "../components/Table";
import TableFilters from "../components/TableFilters";
import { MONTH_NAMES, REPORT_STATUSES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";



const UpiStatement = () => {
const [merchantOptions, setMerchantOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [totalSuccessAmount, setTotalSuccessAmount] = useState(0);

const [exporting, setExporting] = useState(false);

  const [entriesPerPage, setEntriesPerPage] = useState(50);
// const [perPage] = useState(50);

const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalRecords, setTotalRecords] = useState(0);

  const [txnSearch, setTxnSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  //  const [role] = useState(atob(localStorage.getItem("role") || "") || "admin");

  const [showConfirm, setShowConfirm] = useState(false);
const [selectedRow, setSelectedRow] = useState(null);


  const role = atob(localStorage.getItem("role"));

  const [acceptedChargebacks, setAcceptedChargebacks] = useState(new Set());
const [filteredData, setFilteredData] = useState([]);

  const userId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("auth") ||
    localStorage.getItem("userid") ||
    "default_user";
// console.log(userId);



  const normalizeRows = useCallback((rows) => {
    return rows
        .filter((item) => item.product === "UPI")
    .map((item) => ({
      // .map((item) => ({
         product: item.product ?? "N/A",
        id: item.id,
        user_id: item.user_id,
        merchant_name: item.user?.name ?? "N/A",
        merchant_details_text: `${item.user?.name ?? "N/A"} (${item.user_id ?? "N/A"})`,
        payee_vpa: item.payee_vpa ?? "null",
        refno: item.refno ?? "null",
        mytxnid: item.mytxnid ?? "null",
        txnid: item.txnid ?? "null",
        amount: item.amount ?? "0",
        charge: item.charge ?? "0",
        gst: item.gst ?? "0",
        payin_rolling_amount: item.payin_rolling_amount ?? "0",
        status: item.status ?? "N/A",
        created_at: item.created_at,
         updated_at: item.updated_at,
        numericAmount: parseFloat(item.amount) || 0,
        apitxnid: item.apitxnid || "N/A",
        mid: item.option4 || "N/A",
         chargeback_status: item.chargeback_status || "N/A",
          option2: item.option2 || "N/A",
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      // .sort((c, d) => new Date(d.updated_at) - new Date(c.updated_at));
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
      product: "UPI",
      searchdata: txnSearch || undefined,
      user_id: selectedMerchant?.value || undefined,
    };

    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined)
    ).toString();

    const res = await fetch(
      `https://uatfintech.spay.live/api/reportrecords-List?${query}`,
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
  if (!value) return { date: "", time: "" };

  const d = new Date(value);

  if (isNaN(d)) {
    return { date: value, time: "" };
  }

  const date = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;

  const time = d
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();

  return { date, time };
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
  try {
     setExporting(true); 
    const token = localStorage.getItem("token");

    const params = {
      exportdata: 1, // ✅ IMPORTANT
      status: statusFilter !== "all" ? statusFilter : undefined,
from_date: formatDateForAPI(startDate),
to_date: formatDateForAPI(endDate, true),
      product: "UPI",
      searchdata: txnSearch || undefined,
      user_id: selectedMerchant?.value || undefined,
    };

    const query = new URLSearchParams(
      Object.entries(params).filter(([ , v]) => v !== undefined)
    ).toString();

    const res = await fetch(
      `https://uatfintech.spay.live/api/reportrecords-List?${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();
console.log("upi result" ,result);
    if (!res.ok || !result?.status) {
      throw new Error(result?.message);
    }

    const formatted = normalizeRows(result.data || []);

    if (!formatted.length) {
      alert("No data to export.");
      return;
    }

    const csvRows = formatted.map((row) => {
      // const { date, time } = formatExportDateTime(row.created_at);
const { date: createdDate, time: createdTime } =
  formatExportDateTime(row.created_at);

const { date: updatedDate, time: updatedTime } =
  formatExportDateTime(row.updated_at);
    
      return {
        "Order ID": row.id,
        "User ID": row.user_id,
        "Merchant Name": row.merchant_name,
        "Merchant Details": row.merchant_details_text,
        "Payee VPA": row.payee_vpa,
        "Ref No": row.refno,
        "Payee Txnid": row.mytxnid,
        "TxnId": row.txnid,
      ...(role === "admin" && {
      "Airpay_id": row.apitxnid,
    }),
        "Amount": row.amount,
        "Charges": row.charge,
        "GST": row.gst,
        "Payin Rolling Amount": row.payin_rolling_amount,
        "Status": row.status,
        "Reason": row.option2,
        "created Date": createdDate,
        "Created Time": createdTime,
        "updated Date":updatedDate,
        "updated Time":updatedTime,
      };
    });

    const headers = Object.keys(csvRows[0]);

    const csv = [
      headers.map(escapeCSV).join(","),
      ...csvRows.map((row) =>
        headers.map((header) => escapeCSV(row[header])).join(",")
      ),
    ].join("\n");

    downloadFile(csv, "upi_statement_filtered.csv", "text/csv");

  } catch (err) {
    console.error(err);
    alert("Export failed");
  }finally{
     setExporting(false); 
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
    initiated: "bg-[#0f3cb9ff] text-white",
    success: "bg-[#057034ff] text-white",
    complete: "bg-[#057034ff] text-white",
    failed: "bg-[#ff3366] text-white",
    reversed: "bg-[#ff3366] text-white",
    refunded: "bg-gray-400 text-white",
  };

const handleAccept = async (row) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/chargeback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: row.id,
        }),
      }
    );

    const data = await res.json();

    if (res.ok && data.status) {

      setAcceptedChargebacks((prev) => {
        const updated = new Set(prev);
        updated.add(row.id);
        return updated;
      });

      setFilteredData((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? { ...item, chargeback_status: "accepted" }
            : item
        )
      );

    } else {
      alert(data.message || "Chargeback update failed");
    }
  } catch (err) {
    console.error(err);
    alert("API error while updating chargeback");
  }
};

  const upiColumn = [
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
        <span>
           {formatDate(created)}
        </span>
        <span className="text-xs text-gray-500">
          {formatTime(created)}
        </span>

        {/* Updated */}
        {row.updated_at && (
          <>
            <span className="mt-1">
              Updated at:<br/>
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
      header: "Transaction Details",
      accessor: "txnid",
      Cell: ({ row }) => (
        <>
        <div className="flex flex-col text-left">
          <span>
            Payee VPA: <b>{row.payee_vpa}</b>
          </span>
          <span>
            Ref No: <b>{row.refno}</b>
          </span>
          <span>
            Payee Txnid: <b>{row.mytxnid}</b>
          </span>
          <span>
            TxnId: <b>{row.txnid}</b>
          </span>
{role === "admin" && (
  <>
          <span>
            Airpay id: <b>{row.apitxnid}</b>
          </span>    

          <span>
            MID: <b>{row.mid}</b>
          </span> 
          <span>
            product: <b>{row.product}</b>
          </span>  
          {/* <span>
            reason: <b>{row.option2}</b>
          </span> */}
        </> 
      
)}      
        </div>
        </>
      ),
    },
    {
      header: "Amount / Commission",
      accessor: "amount",
      Cell: ({ row }) => (
        <div className="flex flex-col text-left">
          <span>
            Amount: <b>{row.amount}</b>
          </span>
          <span>
            Charges: <b>{row.charge}</b>
          </span>
          <span>
            GST: <b>{row.gst}</b>
          </span>
          <span>
            Payin Rolling Amount: <b>{row.payin_rolling_amount}</b>
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
    ...(role === "admin"
    ? [
{
  header: "Chargeback",
  accessor: "chargeback",
  Cell: ({ row }) => {
// console.log("chargeback",row);
    const isAccepted =
      row.chargeback_status === "accepted" ||
      acceptedChargebacks.has(row.id);

    return isAccepted ? (
      <span className="px-3 py-1 bg-gray-400 text-white rounded-2xl text-sm">
        Accepted
      </span>
    ) : (
      <button
        className="px-3 py-1 bg-purple-500 text-white rounded-2xl"
        // onClick={() => handleAccept(row)}
           onClick={() => {
    setSelectedRow(row);
    setShowConfirm(true);
  }}
      >
        Accept
      </button>
    );
  },
}
      ]
    : [])
  ];

  const isFilterApplied =
  txnSearch ||
  statusFilter !== "all" ||
  startDate ||
  endDate ||
  selectedMerchant;

  return (
    <div className="p-4 space-y-4">
      <div
        className="rounded-lg flex justify-between items-center p-4 shadow-md"
        style={{
          background: "linear-gradient(250deg, #55abe9ff 0%, #00418c 100%)",
        }}
      >
        <div>
          <h4 className="font-bold text-white text-xl">UPI Statement</h4>
          <p className="text-white/90 text-sm mt-1 hidden">
            Loaded: {filteredData.length}{" "}
           
          </p>
        </div>

        {/* <button
          onClick={handleRefreshData}
          className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hidden"
        >
          Refresh
        </button> */}
      </div>

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

     {loading && filteredData.length === 0 ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-center py-6 text-red-500">{error}</div>
      ) : (
        <>
 <Table
  columns={upiColumn}
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

          {loadingMore && (
            <div className="text-center py-3 text-sm text-gray-500">
              Loading next records...
            </div>
          )}
        </>
      )}


      {showConfirm && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-80">
      <h2 className="text-lg font-semibold mb-4">
        Confirm Chargeback
      </h2>
      <p className="mb-6">
        Are you sure you want to accept this chargeback?
      </p>

      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 bg-gray-300 rounded-lg"
          onClick={() => setShowConfirm(false)}
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 bg-[#4193d4] text-white rounded-lg"
          onClick={() => {
            handleAccept(selectedRow);
            setShowConfirm(false);
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}
    </div>
    
  );
  
};


export default UpiStatement;