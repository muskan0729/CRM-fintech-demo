import { useEffect, useRef, useMemo, useState } from "react";

export const BarTest = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [showPayin, setShowPayin] = useState(true);
  const [showPayout, setShowPayout] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const DEFAULT_MONTHS = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  // ================= FORMAT DATA =================
const chartData = useMemo(() => {
  const map = {};

  const MONTH_MAP = {
    january: "Jan", february: "Feb", march: "Mar", april: "Apr",
    may: "May", june: "Jun", july: "Jul", august: "Aug",
    september: "Sep", october: "Oct", november: "Nov", december: "Dec"
  };

  (data || []).forEach((item) => {
    if (!item) return;

    const raw = item.month_name || "";

    // 👉 extract month + year from "March 2026"
    const parts = raw.split(" ");
    const monthFull = parts[0]?.toLowerCase();
    const year = Number(parts[1]);

    if (!monthFull || !year) return;

    if (year !== selectedYear) return;

    const month = MONTH_MAP[monthFull];

    map[month] = {
      payinAmount: Number(item.payin_amount) || 0,
      payoutAmount: Number(item.payout_amount) || 0,
    };
  });

  return DEFAULT_MONTHS.map((m) => ({
    label: m,
    payinAmount: map[m]?.payinAmount || 0,
    payoutAmount: map[m]?.payoutAmount || 0,
  }));
}, [data, selectedYear]);

  const categories = chartData.map(i => i.label);

  const series = useMemo(() => {
    const s = [];

    if (showPayin) {
      s.push({
        name: "Payin",
        data: chartData.map(i => i.payinAmount),
      });
    }

    if (showPayout) {
      s.push({
        name: "Payout",
        data: chartData.map(i => i.payoutAmount),
      });
    }

    return s.length ? s : [{ name: "No data", data: [] }];
  }, [chartData, showPayin, showPayout]);

  // ================= CHART INIT =================
  useEffect(() => {
    if (!chartRef.current || typeof ApexCharts === "undefined") return;

    const options = {
      chart: {
        type: "bar",
        height: 220,
        toolbar: { show: false },
        fontFamily: "Inter, sans-serif",
      },

      series,

      colors: series.map(s =>
        s.name === "Payin" ?  "#1E3A5F" : "#14532D"
      ),

      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "100%",
         
        },
      },
 
stroke: {
  show: true,
  width: 5,
  colors: ["transparent"], // creates visual separation
},
      dataLabels: {
        enabled: false,
      },

      xaxis: {
        categories,
        axisBorder: { show: true },
        axisTicks: { show: true },
      },

      yaxis: {
        labels: {
          formatter: (val) => {
            if (val >= 10000000) return (val/10000000).toFixed(1)+"Cr";
            if (val >= 100000) return (val/100000).toFixed(1)+"L";
            if (val >= 1000) return (val/1000).toFixed(1)+"K";
            return val;
          },
        },
        title: {
          text: "Amount (₹)",
        },
      },

      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 4,
      },

      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val) => `₹${Number(val).toLocaleString("en-IN")}`,
        },
      },

      noData: {
        text: "No data available",
      },
    };

    if (!chartInstance.current) {
      chartInstance.current = new ApexCharts(chartRef.current, options);
      chartInstance.current.render();
    } else {
      chartInstance.current.updateOptions(options);
    }

    return () => {
      chartInstance.current?.destroy();
      chartInstance.current = null;
    };
  }, [series, categories]);

  return (
    <div className="w-full h-full flex flex-col">

      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-center mb-2 flex-wrap gap-2">

      </div>

      {/* CHART */}
      <div ref={chartRef} className="flex-1" />

    </div>
  );
};