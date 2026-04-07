import { useEffect, useState, useMemo } from "react";
import { DonutChart } from "../components/DonutChart";
import { LineChart1 } from "../components/LineChart1";
import Table from "../components/Table";
import useAutoFetch from "../hooks/useAutoFetch";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { useNavigate } from "react-router-dom";
import { BarTest } from "../components/BarTest";


export const Dashboard = () => {
  const DASHBOARD_LOCK_KEY = "payment_dashboard_logged_in";
  const navigate = useNavigate();

  // ─── Auth states ───
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

 
//  server pagination
const [tableData, setTableData] = useState([]);
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalRecords, setTotalRecords] = useState(0);
const [tableLoading, setTableLoading] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(50);


  // ─── Dashboard states ───
  const [role] = useState(atob(localStorage.getItem("role") || "") || "admin");
 
  const [initialLoad, setInitialLoad] = useState(true);

  const [statusFilter, setStatusFilter] = useState(() => {
  return localStorage.getItem("dashboard_status_filter") || "SUCCESS";
});


  // ─── APIs ───
  const { data: cardData, loading: recordLoading } = useAutoFetch("/collection-record",90000);

  
  const { data: summaryData, loading: summaryLoading } = useAutoFetch("/collection-summary",60000);
  
const { data: statusCounts, loading: statusLoading } = useAutoFetch("/collection-statuscounts",120000);
const { data: monthwiseData, loading: monthLoading } = useAutoFetch("/collection-monthwise",120000);
const { data: cashfreeData, loading: cashfreeLoading } = useAutoFetch("/collection-cashfree");

useEffect(() => {
  // localStorage.setItem("dashboard_status_filter", statusFilter);
 setPage(1);
}, [statusFilter]);


useEffect(() => {
  fetchDashboardTable();
}, [page, entriesPerPage, statusFilter]);

const fetchDashboardTable = async () => {
  try {
    setTableLoading(true);

    const token = localStorage.getItem("token");

    const params = {
      page,
      per_page: entriesPerPage,
      // status: statusFilter !== "ALL" ? statusFilter : undefined,
    };

    // ✅ differentiate filters
if (statusFilter !== "ALL") {
  const chargebackStatuses = ["ACCEPTED", "REVERSE"];

  if (chargebackStatuses.includes(statusFilter)) {
    params.chargeback_status = statusFilter;
    params.product = "chargeback"; // optional but recommended
  } else {
    params.status = statusFilter;
  }
}

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

    // ✅ set data directly (NO merging)
    setTableData(result.data || []);

    // ✅ pagination from API
    setTotalPages(result.pagination?.last_page || 1);
    setTotalRecords(result.pagination?.total || 0);

  } catch (err) {
    console.error(err);
    setTableData([]);
  } finally {
    setTableLoading(false);
  }
};


const transactionData = useMemo(() => {
  return tableData.map((item, index) => {
    const date = new Date(item.created_at);

    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // ✅ MAIN CHANGE HERE
    const isChargeback = item.product?.toUpperCase() === "CHARGEBACK";


    const statusValue = isChargeback
      ? (item.chargeback_status || "UNKNOWN")
      : (item.status || "UNKNOWN");

 const statusUpper = statusValue.toUpperCase();

    // const statusUpper = (item.status || "UNKNOWN").toUpperCase();

    let statusClass = "bg-gray-100 text-gray-700";

    if (["SUCCESS", "COMPLETED"].includes(statusUpper)) {
      statusClass = "bg-emerald-50 text-emerald-700";
    } else if (["PENDING", "INITIATED"].includes(statusUpper)) {
      statusClass = "bg-amber-50 text-amber-700";
    } else if (["FAILED", "REVERSED", "REFUNDED"].includes(statusUpper)) {
      statusClass = "bg-rose-50 text-rose-700";
    }else if (["ACCEPTED"].includes(statusUpper)) {
      statusClass = "bg-orange-50 text-orange-700";
    }
    else if (["REVERSE"].includes(statusUpper)) {
      statusClass = "bg-purple-50 text-purple-700";
    }

    return {
      // txnid: item.txnid || "—",
      txnid: (
  <div className="break-all max-w-[150px]">
    {item.txnid || "—"}
  </div>
),
      name: `${item.user?.name ?? "N/A"} (${item.user_id ?? "N/A"})`,
      type: item.product || "—",
      amount: item.amount,
      status: (
        <span className={`px-3 py-1 rounded-full text-xs ${statusClass}`}>
          {statusUpper}
        </span>
      ),
      time: (
        <div>
          <div>{formattedDate}</div>
          <div className="text-xs text-gray-500">{formattedTime}</div>
        </div>
      ),
    };
  });
}, [tableData]);



  // ─── Auth check ───
  useEffect(() => {
    const checkAuthentication = () => {
      const lock = JSON.parse(localStorage.getItem(DASHBOARD_LOCK_KEY) || "{}");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      // const user = getSafeItem("user");

      const isValid =
        lock?.userId &&
        user?.id &&
        lock.userId === user.id &&
        user.id !== undefined;

      setIsAuthenticated(isValid);
      setIsCheckingAuth(false);

      if (!isValid) {
        navigate("/", { replace: true });
}else {
  const savedFilter = localStorage.getItem("dashboard_status_filter");

  if (!savedFilter) {
    localStorage.setItem("dashboard_status_filter", "SUCCESS");
    setStatusFilter("SUCCESS");
  }
}
    };

    const timer = setTimeout(checkAuthentication, 150);
    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    if (!recordLoading && cardData) setInitialLoad(false);
  }, [recordLoading, cardData]);

const cardsToShow = useMemo(() => [
  { title: "Today Cash-In", value: summaryData?.today_payin ?? "00" },
  { title: "Total Cash-In", value: summaryData?.total_payin ?? "00" },
  { title: "Today Cash-Out", value: summaryData?.today_payout ?? "00"},
  { title: "Total Cash-Out", value: summaryData?.total_payout ?? "00" },
], [summaryData]);

const donutData = useMemo(() => statusCounts || [], [statusCounts]);
const lineChartData = useMemo(() => monthwiseData || [], [monthwiseData]);


  const formatRupee = (value) => {
    const num = Math.round(Number(value || 0));
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const transactioncolumn = [
    { header: "TXN Id", accessor: "txnid" },
    { header: "Merchant", accessor: "name" },
    { header: "Type", accessor: "type" },
    { header: "Amount", accessor: "amount" },
    { header: "Status", accessor: "status" },
    { header: "Date/Time", accessor: "time" },
  ];

  if(isCheckingAuth  || initialLoad){
    return <DashboardSkeleton />
  }
  if (!isAuthenticated) return null;


  
  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-100/70 pb-16">
      <div className="mx-auto px-5 sm:px-7 lg:px-10 pt-8 lg:pt-12 ">
        {/* Cards */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

  {/* LEFT SIDE */}
  <div className="bg-white shadow-md rounded-xl p-4 flex flex-col h-full lg:max-h-[350px]">
    
    <h3 className="text-xl font-semibold text-slate-800 relative inline-block mb-3">
      Monthly Summary
      <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-500/50 to-indigo-500/50 rounded-full" />
    </h3>

    <div className="flex-1 overflow-hidden">
      {/* <LineChart1 data={lineChartData} /> */}
      <BarTest data = {lineChartData}/>
    </div>

  </div>

  {/* RIGHT SIDE */}
<div className="h-full lg:max-h-[420px] overflow-hidden bg-slate-50 rounded-xl p-5  ">

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full overflow-y-auto pr-1">

    {cardsToShow.map((card, i) => {
      const amountStr = formatRupee(card.value);

      return (
        <div
          key={i}
          className="group relative bg-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 overflow-hidden"
        >
          
          {/* LEFT ACCENT STRIP */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--bg-color)]"
            // style={{ backgroundColor: "#023842" }}
          />

          {/* TOP RIGHT ICON BADGE */}
          {/* <div className="absolute top-3 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow"
               style={{ backgroundColor: "#023842" }}>
            ₹
          </div> */}

          {/* CONTENT */}
          <div className="p-4 pl-3">
            <h4 className="text-md font-semibold text-slate-500 uppercase tracking-wide mb-8">
              {card.title}
            </h4>

            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-800 text-xl">
                ₹{amountStr}
              </div>

      
            </div>
          </div>

        </div>
      );
    })}

  </div>

</div>

</div>


        {/* table  */}
        <div className="mt-4 rounded-3xl bg-white shadow-[0_10px_40px_rgb(0,0,0,0.06)]  overflow-hidden">
     <div className="px-6 py-5 bg-[#033b44] mb-4">
  
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 
                  bg-white rounded-xl px-6 py-4 shadow-sm">
    
    {/* Title */}
    <h3 className="text-xl font-semibold text-[var(--bg-color)] tracking-wide">
      Transaction History
    </h3>

    {/* Filter */}
    <div className="relative">
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="bg-slate-50 border border-slate-300 text-slate-700 text-sm 
                   rounded-full px-5 py-2.5 pr-10
                   focus:ring-2 focus:ring-[var(--bg-color)] focus:border-[#031f24]
                   outline-none min-w-[180px]
                   transition-all shadow-sm hover:border-[var(--bg-color)]
                   appearance-none cursor-pointer"
      >
        <option value="ALL">All Status</option>
        <option value="SUCCESS">Success</option>
        <option value="FAILED">Failed</option>
        <option value="PENDING">Pending</option>
        <option value="REVERSED">Reversed</option>
        <option value="REFUNDED">Refunded</option>
        <option value="COMPLETED">Completed</option>
        <option value="INITIATED">Initiated</option>

      </select>

      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
        ▼
      </span>
    </div>

  </div>
</div>

          <div className="overflow-x-auto">
            <Table
              columns={transactioncolumn}
              data={transactionData}
              showSearch={false}
              showPagination={true}
              showExport={false}
              showStatusFilter={false}
              showDeleteColumn={false}
              showDateFilter={false}

              isServerPaginated={true}     // Tell Table to use server logic
              entriesPerPage={entriesPerPage}
              setEntriesPerPage={setEntriesPerPage}

                totalPages={totalPages}
  currentPage={page}
  onPageChange={(newPage) => setPage(newPage)}

  loading={tableLoading}
            />

          
          </div>
        </div> 
      </div>
    </div>
  );
};