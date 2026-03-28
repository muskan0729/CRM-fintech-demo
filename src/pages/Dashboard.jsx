import { useEffect, useState, useMemo } from "react";
import { DonutChart } from "../components/DonutChart";
import { LineChart1 } from "../components/LineChart1";
import Table from "../components/Table";
import useAutoFetch from "../hooks/useAutoFetch";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { useNavigate } from "react-router-dom";

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
      txnid: item.txnid || "—",
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
  { title: "Today Pay-IN", value: summaryData?.today_payin ?? "00" },
  { title: "Total Pay-IN", value: summaryData?.total_payin ?? "00" },
  { title: "Today Pay-OUT", value: summaryData?.today_payout ?? "00"},
  { title: "Total Pay-OUT", value: summaryData?.total_payout ?? "00" },
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
      <div className="mx-auto px-5 sm:px-7 lg:px-10 pt-8 lg:pt-12">
        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 mb-12">
          {cardsToShow.map((card, i) => {
            const amountStr = formatRupee(card.value);
            return (
              <div
                key={i}
                className={`group relative bg-white rounded-tl-3xl rounded-br-3xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-400 hover:shadow-[0_25px_70px_rgba(0,0,0,0.18)] hover:-translate-y-2 border border-slate-100/80 min-w-0`}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-3 transform -skew-x-12 origin-left"
                  style={{
                    background: "linear-gradient(90deg, rgba(6,76,150,1) 0%, rgba(40,142,214,1) 100%)",
                  }}
                />
                <div className="p-6 pt-9 relative">
                  <h3 className="text-sm font-semibold text-slate-600 mb-2.5 tracking-wider uppercase">
                    {card.title}
                  </h3>
                  <div
    className="font-bold text-slate-800 whitespace-nowrap w-full tabular-nums text-[clamp(10px,1.5vw,20px)]"

                    title={`₹${amountStr}`}
                  >
                    ₹{amountStr}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
  {role === "admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-7 mb-12">
          {/* Line chart */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.06)] border border-slate-100/80 p-6 lg:p-8 overflow-hidden transition-all duration-400 hover:shadow-[0_25px_70px_rgb(0,0,0,0.09)]">
            <h3 className="text-2xl font-semibold text-slate-800 mb-8 relative inline-block">
              Monthly Performance
              <span className="absolute -bottom-2.5 left-0 w-16 h-1 bg-gradient-to-r from-blue-500/50 to-indigo-500/50 rounded-full" />
            </h3>
           
            <div className="h-[400px] lg:h-[440px] -mx-2">
              {/* <LineChart1 data={cardData?.monthWiseStatusCounts} /> */}
              < LineChart1 data={lineChartData}/>
            </div>
             
          </div>
          {/* Donut chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.06)] border border-slate-100/80 p-6 lg:p-8 transition-all duration-400 hover:shadow-[0_25px_70px_rgb(0,0,0,0.09)]">
            <h3 className="text-2xl font-semibold text-slate-800 mb-8 relative inline-block">
              Status Distribution
              <span className="absolute -bottom-2.5 left-0 w-16 h-1 bg-gradient-to-r from-rose-500/50 to-pink-500/50 rounded-full" />
            </h3>
            <div className="h-[400px] flex items-center justify-center">
              {/* <DonutChart data={cardData?.transactionStatusCounts || []} /> */}
              <DonutChart data={donutData}/>
            </div>
          </div>
        </div>
       )}

        {/* TABLE SECTION */}
        <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.06)] border border-slate-100/80 overflow-hidden">
          <div className="px-7 py-6 border-b border-slate-100/80 bg-slate-50/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <h3 className="text-2xl font-semibold text-slate-800">Transaction History</h3>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-sm rounded-full px-6 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[200px] transition-all shadow-sm hover:border-blue-300 appearance-none cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                  <option value="PENDING">Pending</option>
                  <option value="REVERSED">Reversed</option>
                  <option value="REFUNDED">Refunded</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="INITIATED">Initiated</option>
                   <option value="ACCEPTED">Accepted</option>
                    <option value="REVERSE">Reverse</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</span>
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