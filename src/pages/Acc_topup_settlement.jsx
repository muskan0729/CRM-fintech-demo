import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Table from "../components/Table";
import TableFilters from "../components/TableFilters";
import { REPORT_STATUSES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";
import { setSafeItem, getSafeItem, removeSafeItem } from "../utils/localSecure";



const Acc_topup_settlement = () => {
  
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  const [loading, setLoading] = useState(true);
 
  const [error, setError] = useState(null);

    const [entriesPerPage, setEntriesPerPage] = useState(50);

const [filteredData, setFilteredData] = useState([]);
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalRecords, setTotalRecords] = useState(0);
const [totalSuccessAmount, setTotalSuccessAmount] = useState(0);

const [merchantOptions, setMerchantOptions] = useState([]);

const [exporting, setExporting] = useState(false);


  const [txnSearch, setTxnSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedMerchant, setSelectedMerchant] = useState(null);


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
        txnid: item.txnid ?? "N/A",
        product_type: item.product ?? "N/A",
        amount: item.amount ?? "0",
        numericAmount: parseFloat(item.amount) || 0,
        payout_opening_balance: item.payout_opening_balance ?? "0.0",
        payout_closing_balance: item.payout_closing_balance ?? "0.0",
        status: item.status ?? "N/A",
        created_at: item.created_at,
        updated_at: item.updated_at,

      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, []);


  
  useEffect(() => {
  setPage(1);
}, [entriesPerPage, txnSearch, statusFilter, startDate, endDate, selectedMerchant]);


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
  fetchMerchants();
}, []);

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
        ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
            .toISOString()
            .split("T")[0]
        : undefined,

      // ✅ IMPORTANT: MULTIPLE PRODUCTS
      "product[]": ["topup_payout", "take_back_from_wallet"],

      searchdata: txnSearch || undefined,
      user_id: selectedMerchant?.value || undefined,
    };

    // 👇 FIX for array params
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (!value) return;

      if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, v));
      } else {
        query.append(key, value);
      }
    });

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/reportrecords-List?${query.toString()}`,
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

    // ✅ success amount from backend
    setTotalSuccessAmount(result.success_amount || 0);

    const formatted = normalizeRows(result.data || []);
    setFilteredData(formatted);

    // ✅ pagination
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
        page: currentPage,
        per_page: entriesPerPage, // ✅ use same pagination size
        status: statusFilter !== "all" ? statusFilter : undefined,

          from_date: formatDateForAPI(startDate),
to_date: formatDateForAPI(endDate, true),
    
"product[]": ["topup_payout", "take_back_from_wallet"],        searchdata: txnSearch || undefined,
        user_id: selectedMerchant?.value || undefined,
      };

const query = new URLSearchParams();

Object.entries(params).forEach(([key, value]) => {
  if (!value) return;

  if (Array.isArray(value)) {
    value.forEach((v) => query.append(key, v));
  } else {
    query.append(key, value);
  }
});

      const res = await fetch(
        // `${import.meta.env.VITE_API_URL}/reportrecords-List?${query}`,
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
        "Transaction ID": row.txnid,
        "Product Type": row.product_type,
        "Amount": row.amount,
        "Status": row.status,
        "Date": date,
        "Time": time,
        "Opening Bal": row.payout_opening_balance,
        "Closing Bal": row.payout_closing_balance,
    };
  });

  const headers = Object.keys(csvRows[0]);

  const csv = [
    headers.map(escapeCSV).join(","),
    ...csvRows.map((row) =>
      headers.map((header) => escapeCSV(row[header])).join(",")
    ),
  ].join("\n");

  
  downloadFile(csv, "topup_settlement.csv", "text/csv");
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
    refunded: "bg-gray-400 text-white",
  };

  const topupPayoutColumn = [
    {
      header: "SQ NO",
      accessor: "id",
      Cell: ({ row }) => <span>{row.id}</span>,
    },
    {
      header: "Merchant Namr",
      accessor: "merchant_details_text",
      Cell: ({ row }) => (
        <div className="flex flex-col text-left">
          <span>
            <b>{row.merchant_name}</b>
          </span>
          {/* <span>User ID: {row.user_id ?? "N/A"}</span> */}
        </div>
      ),
    },
    {
      header: "Transaction Id",
      accessor: "txnid",
       Cell: ({ row }) => (
        <div className="break-all max-w-[150px]">
          {row.txnid || "—"}
        </div>
       ),
    },
    {
      header: "payment Type",
      accessor: "product_type",
    },
    {
      header: "Amount",
      accessor: "amount",
    },
    {
      header: "Status",
      accessor: "status",
      Cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${
            statusClasses[String(row.status || "").toLowerCase()] ?? "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "created_at",
      Cell: ({ row }) => {
        const d = new Date(row.created_at);
        return (
          <div className="flex flex-col w-28">
            <span className="text-sm font-medium">
              {isNaN(d)
                ? "N/A"
                : d.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })}
            </span>
            <span className="text-sm text-gray-500">
              {isNaN(d)
                ? "N/A"
                : d.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
            </span>
          </div>
        );
      },
    },
    {
      header: "Opening Bal",
      accessor: "payout_opening_balance",
    },
    {
      header: "Closing Bal",
      accessor: "payout_closing_balance",
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
  <h4 className="font-bold text-white text-xl uppercase">
    Recharge History
  </h4>

  {/* RIGHT SIDE */}
  <button
    onClick={() => setShowFilterSidebar(true)}
    className="bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
  >
     🔍Select Filter
  </button>
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
        showExport={true} // optional inside sidebar
                onExportCSV={exportCSV}
          exporting={exporting}
        showStatusFilter={true}
        showDateFilter={true}
        showSelectUserFilter={true}
        totalSuccessAmount={totalSuccessAmount}
      />

      {/* Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => {
            fetchFilteredData();   // trigger API
            setShowFilterSidebar(false); // close sidebar
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Apply
        </button>

        <button
          onClick={handleClearAll}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Clear
        </button>
      </div>
    </div>
  </div>
)}

      {loading  ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-center py-6 text-red-500">Error: {error}</div>
      ) : (
        <>
          <Table
            columns={topupPayoutColumn}
            data={filteredData}
            showPagination={true}
            showDeleteColumn={false}
            isServerPaginated={true}
            entriesPerPage={entriesPerPage}
            setEntriesPerPage={setEntriesPerPage}
          />

        </>
      )}
    </div>
  );
};

export default Acc_topup_settlement;