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
  const [allPayoutData, setAllPayoutData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [error, setError] = useState(null);

  const [entriesPerPage, setEntriesPerPage] = useState(50);

  const [txnSearch, setTxnSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  const nextCursorRef = useRef(null);
  const stopFetchingRef = useRef(false);
  const seenIdsRef = useRef(new Set());

  const userId =
    localStorage.getItem("user_id") ||
    localStorage.getItem("auth") ||
    localStorage.getItem("userid") ||
    "default_user";

  const CACHE_KEY = `payout_statement_cache_${userId}`;
console.log("caschekey",userId);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
        total_charges: item.profit ?? 0,
        total_debited_amount: (
          Number(item.amount ?? 0) + Number(item.profit ?? 0)
        ).toFixed(2),
        closing_wallet_amount: item.payout_closing_balance ?? 0,
        note: `Debit ${(
          Number(item.amount ?? 0) + Number(item.profit ?? 0)
        ).toFixed(2)} to Payout Wallet`,

        status: item.status ?? "N/A",
        created_at: item.created_at,
        numericAmount: parseFloat(item.amount) || 0,
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, []);

  const saveCache = useCallback(
    (data, nextCursor, finished) => {
      try {
        setSafeItem(CACHE_KEY, {
          data,
          nextCursor,
          allLoaded: finished,
          savedAt: Date.now(),
        });
      } catch (err) {
        console.error("Cache save error:", err);
      }
    },
    [CACHE_KEY]
  );

  const loadCache = useCallback(() => {
    try {
      const parsed = getSafeItem(CACHE_KEY);
      if (!parsed?.data || !Array.isArray(parsed.data)) return null;

      const isExpired = Date.now() - (parsed.savedAt || 0) > CACHE_TTL_MS;
      if (isExpired) {
        removeSafeItem(CACHE_KEY);
        return null;
      }

      return parsed;
    } catch (err) {
      console.error("Cache read error:", err);
      return null;
    }
  }, [CACHE_KEY]);

  const clearCache = useCallback(() => {
    removeSafeItem(CACHE_KEY);
  }, [CACHE_KEY]);

  const fetchBatch = useCallback(
    async (isFirstLoad = false) => {
      try {
        if (isFirstLoad) {
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const token = localStorage.getItem("token");

        const query = new URLSearchParams({
          product: "payout",
          per_page: String(BATCH_SIZE),
          ...(nextCursorRef.current ? { cursor: nextCursorRef.current } : {}),
        }).toString();

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/reportrecords-List?${query}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();

        if (!res.ok || !json?.status) {
          throw new Error(json?.message || "Invalid API response");
        }

        const rows = Array.isArray(json.data) ? json.data : [];

        const uniqueRows = rows.filter((item) => {
          if (!item?.id) return false;
          if (seenIdsRef.current.has(item.id)) return false;
          seenIdsRef.current.add(item.id);
          return true;
        });

        const formattedRows = normalizeRows(uniqueRows);

        setAllPayoutData((prev) => {
          const merged = [...prev, ...formattedRows].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );

          const nextCursor = json.next_cursor || null;
          const finished = !nextCursor;

          saveCache(merged, nextCursor, finished);

          return merged;
        });

        nextCursorRef.current = json.next_cursor || null;

        if (!json.next_cursor) {
          setAllLoaded(true);
          stopFetchingRef.current = true;
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load payout statements");
        stopFetchingRef.current = true;
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [normalizeRows, saveCache]
  );

  const startProgressiveFetch = useCallback(async () => {
    stopFetchingRef.current = false;
    seenIdsRef.current = new Set();

    await fetchBatch(true);

    while (!stopFetchingRef.current && nextCursorRef.current) {
      await sleep(FETCH_DELAY);
      await fetchBatch(false);
    }
  }, [fetchBatch]);

  useEffect(() => {
    const cached = loadCache();

    if (cached) {
      setAllPayoutData(cached.data || []);
      setAllLoaded(Boolean(cached.allLoaded));
      nextCursorRef.current = cached.nextCursor || null;
      seenIdsRef.current = new Set((cached.data || []).map((item) => item.id));
      setLoading(false);

      if (!cached.allLoaded && cached.nextCursor) {
        startProgressiveFetch();
      }

      return;
    }

    nextCursorRef.current = null;
    setAllPayoutData([]);
    setAllLoaded(false);
    startProgressiveFetch();

    return () => {
      stopFetchingRef.current = true;
    };
  }, [loadCache, startProgressiveFetch]);

  const parseDate = (value) => {
    if (!value) return null;

    if (value instanceof Date && !isNaN(value)) {
      const d = new Date(value);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    const d = new Date(value);
    if (!isNaN(d)) {
      d.setHours(0, 0, 0, 0);
      return d;
    }

    if (typeof value === "string") {
      const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) {
        const fixed = new Date(match[1]);
        fixed.setHours(0, 0, 0, 0);
        return fixed;
      }
    }

    return null;
  };

  const parseEndDate = (value) => {
    const d = parseDate(value);
    if (!d) return null;
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const filteredData = useMemo(() => {
    return allPayoutData.filter((row) => {
      const searchValue = txnSearch.trim().toLowerCase();

      const searchText = [
        row.id,
        row.user_id,
        row.merchant_name,
        row.merchant_details_text,
        row.holder,
        row.account,
        row.ifsc,
        row.upi_id,
        row.mobile,
        row.payment_mode,
        row.refno,
        row.mytxnid,
        row.txnid,
      ]
        .map((v) => String(v || "").toLowerCase())
        .join(" ");

      const matchesTxn = !searchValue || searchText.includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        String(row.status || "").toLowerCase() === statusFilter.toLowerCase();

      const rowDate = parseDate(row.created_at);
      const start = parseDate(startDate);
      const end = parseEndDate(endDate);

      const matchesDate =
        (!start || (rowDate && rowDate >= start)) &&
        (!end || (rowDate && rowDate <= end));

      const matchesMerchant =
        !selectedMerchant || String(row.user_id) === String(selectedMerchant.value);

      return matchesTxn && matchesStatus && matchesDate && matchesMerchant;
    });
  }, [allPayoutData, txnSearch, statusFilter, startDate, endDate, selectedMerchant]);

  const totalSuccessAmount = useMemo(() => {
    return filteredData
      .filter((row) => {
        const status = String(row.status || "").toLowerCase();
        return status === "success" || status === "completed";
      })
      .reduce((sum, row) => sum + (Number(row.numericAmount) || 0), 0);
  }, [filteredData]);

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

  const exportCSV = () => {
    if (!filteredData.length) {
      alert("No data to export.");
      return;
    }

    const csvRows = filteredData.map((row) => {
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
        "Total Charges": row.total_charges,
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

    downloadFile(csv, "payout_statement_filtered.csv", "text/csv");
  };

  const handleClearAll = () => {
    setTxnSearch("");
    setStatusFilter("all");
    setStartDate(null);
    setEndDate(null);
    setSelectedMerchant(null);
  };

  const handleRefreshData = async () => {
    clearCache();
    stopFetchingRef.current = true;

    nextCursorRef.current = null;
    seenIdsRef.current = new Set();
    setAllPayoutData([]);
    setAllLoaded(false);

    await startProgressiveFetch();
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
      header: "Order ID",
      accessor: "id",
      Cell: ({ row }) => {
        const d = new Date(row.created_at);
        return (
          <div className="flex flex-col text-left">
            <span>
              <b>{row.id}</b>
            </span>
            <span>
              {isNaN(d)
                ? "N/A"
                : `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`}
            </span>
            <span className="text-sm text-gray-500">
              {isNaN(d)
                ? "N/A"
                : d
                    .toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .toUpperCase()}
            </span>
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
            Total Charges: <b>{row.total_charges}</b>
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
          background: "linear-gradient(250deg, #55abe9ff 0%, #00418c 100%)",
        }}
      >
        <div>
          <h4 className="font-bold text-white text-xl">Payout Statement</h4>
          <p className="text-white/90 text-sm mt-1 hidden">
            Loaded: {allPayoutData.length}{" "}
            {allLoaded ? "(All records loaded)" : "(Loading in background...)"}
          </p>
        </div>

        <button
          onClick={handleRefreshData}
          className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hidden"
        >
          Refresh
        </button>
      </div>

      <TableFilters
        rawData={allPayoutData}
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
        onClearAll={handleClearAll}
        totalSuccessAmount={totalSuccessAmount}
      />

      {loading && allPayoutData.length === 0 ? (
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
            isServerPaginated={false}
            entriesPerPage={entriesPerPage}
            setEntriesPerPage={setEntriesPerPage}
          />

          {loadingMore && (
            <div className="text-center py-3 text-sm text-gray-500">
              Loading next 50 records...
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PayoutStatement;