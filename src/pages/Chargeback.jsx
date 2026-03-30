  import React from 'react'
  import { useState, useEffect, useMemo, useRef, useCallback } from "react";
  import Table from "../components/Table";
  import TableFilters from "../components/TableFilters";
  import { REPORT_STATUSES } from "../constants/Constants";
  import { TableSkeleton } from "../components/TableSkeleton";
  import { setSafeItem, getSafeItem, removeSafeItem } from "../utils/localSecure";
  import { usePost } from '../hooks/usePost';
  


  const Chargeback = () => {
  const [allPayinSettlementData, setAllPayinSettlementData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [allLoaded, setAllLoaded] = useState(false);
    const [error, setError] = useState(null);

    const [exporting, setExporting] = useState(false);


    const [entriesPerPage, setEntriesPerPage] = useState(50);

    const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalSuccessAmount, setTotalSuccessAmount] = useState(0);

  const [merchantOptions, setMerchantOptions] = useState([]);

    const [txnSearch, setTxnSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedMerchant, setSelectedMerchant] = useState(null);

    const { execute: executReverse } = usePost("/reverse/chargeback");
      const role = atob(localStorage.getItem("role"));
  

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
          gst: item.gst ?? "0",
          option2:item.option2 ?? "0",
            charge: item.charge ?? "0",
          numericAmount: parseFloat(item.amount) || 0,
          payout_closing_balance: item.payout_closing_balance ?? "0.0",
          payout_opening_balance: item.payout_opening_balance ?? "0.0",
          status: item.chargeback_status ?? "N/A",
          option3: item.option3 ?? "N/A",
          created_at: item.created_at,
          updated_at: item.updated_at,
          chargeback_id: item.glide_uiwidget_sessionid ?? "N/A",
          mytxnid: item.mytxnid ?? "N/A",
          apitxnid: item.apitxnid ?? "N/A",
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
    fetchMerchants();
  }, []);

    useEffect(() => {
    setPage(1);
  }, [entriesPerPage, txnSearch, statusFilter, startDate, endDate, selectedMerchant]);

  // FETCH DATA
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

          from_date: formatDateForAPI(startDate),
to_date: formatDateForAPI(endDate, true),

      // ✅ IMPORTANT: MULTIPLE PRODUCTS
 product: "chargeback",
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
    
 product: "chargeback",
 searchdata: txnSearch || undefined,
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
          "Opening Bal": row.payin_opening_balance,
          "Closing Bal": row.payin_closing_balance,
      };
    });

    const headers = Object.keys(csvRows[0]);

    const csv = [
      headers.map(escapeCSV).join(","),
      ...csvRows.map((row) =>
        headers.map((header) => escapeCSV(row[header])).join(",")
      ),
    ].join("\n");

    downloadFile(csv, "chargeback.csv", "text/csv");
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
      accepted: "bg-orange-400 text-white",
      reverse: "bg-red-900 text-white",

    };



  const handleReverseChargeback = async (row) => {
    try {
      const payload = {
        chargeback_id: row.chargeback_id,
      };

      const res = await executReverse(payload);

      if (!res?.status) {
        throw new Error(res?.message || "Reverse failed");
      }

      // ✅ 1. Update the status of this specific row locally
      setAllPayinSettlementData((prev) =>
        prev.map((r) =>
          r.chargeback_id === row.chargeback_id
            ? { ...r, status: "reverse" } // mark as reversed
            : r
        )
      );

      alert("Chargeback reversed successfully ✅");
         fetchFilteredData();

    } catch (err) {
      console.error(err);
      alert("Reverse failed ❌");
    }
  };  
    const payinSettlementColumn = [
      {
        header: "SQ NO",
        accessor: "id",
        Cell: ({ row }) => 
          <>
        <span>{row.id}</span>
        

          </>
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
        header: "Transaction Id",
        accessor: "txnid",
        Cell: ({row}) => (
        <div className="w-70 flex flex-col">
          <span>txnid: <b>{row.txnid}</b></span>
          <span>chargeback id : <b>{row.chargeback_id}</b></span>
          <span>mytxnid : <b>{row.mytxnid}</b></span>

          {role === "admin" && (
           <span>Airpay_id : <b>{row.apitxnid}</b></span>
          )}
        </div>
        ),
      },
      {
        header: "Product Type",
        accessor: "product_type",
      },
      {
        header: "Amount",
        accessor: "amount",
        Cell: ({ row }) => (
          <div className="flex flex-col text-left w-50">
            <span>
              Payout Opening Amount: <b>{row.payout_opening_balance}</b>
            </span>
            <span>
              Pay Amount: <b>{row.amount}</b>
            </span>
            <span>
              Total Charges: <b>{row.charge}</b>
            </span>
            <span>
              GST: <b>{row.gst}</b>
            </span>
            <span>
            Payout Closing Amount: <b>{row.payout_closing_balance}</b>
            </span>
            <span>
          {row.status.toLowerCase().trim() === "reverse" ? "Total Credited Amount" : "Total Debited Amount"}: 
              <b>{row.option2}</b>
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
    statusClasses[String(row.status || "").toLowerCase().trim()] ??
    "bg-gray-100 text-gray-800"
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
  <div className="flex items-center justify-between w-30">
    {/* Date & Time */}
    <div>
      <span className="text-sm font-medium block">
        {isNaN(d)
          ? "N/A"
          : d.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "2-digit",
            })}
      </span>

      <span className="text-sm text-gray-500 block">
        {isNaN(d)
          ? "N/A"
          : d.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
      </span>
    </div>
  {role === "admin" && row.status.toLowerCase().trim() !== "reverse" && row.option3 !== "reverse" && (
    <div className="relative group">
      <span 
  onClick={() => {
      if (window.confirm("Are you sure to reverse this chargeback?")) {
        handleReverseChargeback(row);
      }
    }}
    className="flex items-center justify-center w-10 h-10 bg-blue-600/50 text-black rounded-full cursor-pointer hover:bg-blue-700 hover:text-white transition"
  >
    <i className="fas fa-undo"></i>
  </span>
      {/* Tooltip */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
        Reverse Chargeback
      </div>
    </div>
        )}


  </div>
          );
        },
      },
    
    ];

    return (
      <div className="p-4 space-y-4">
        <div
          className="rounded-lg flex justify-between items-center p-4 shadow-md"
          style={{
            background: "linear-gradient(250deg, #55abe9ff 0%, #00418c 100%)",
          }}
        >
          <div>
            <h4 className="font-bold text-white text-lg sm:text-xl">
              Chargeback Statement
            </h4>
  
          </div>

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
          onExportCSV={exportCSV}
            exporting={exporting}
          onClearAll={handleClearAll}
          totalSuccessAmount={totalSuccessAmount}
        />

        {loading  ? (
          <TableSkeleton />
        ) : error ? (
          <div className="text-center py-6 text-red-500">{error}</div>
        ) : (
          <>
            <Table
              columns={payinSettlementColumn}
              data={filteredData}
              showPagination={true}
              showDeleteColumn={false}
              isServerPaginated={true}
              entriesPerPage={entriesPerPage}
              setEntriesPerPage={setEntriesPerPage}

                currentPage={page}         // ✅ ADD
    setCurrentPage={setPage}   // ✅ ADD
    totalPages={totalPages}    // ✅ ADD
    totalRecords={totalRecords}
            />

            {loadingMore && (
              <div className="text-center py-3 text-sm text-gray-500">
                Loading next records...
              </div>
            )}
          </>
        )}
      </div>
    );
  };


  export default Chargeback
