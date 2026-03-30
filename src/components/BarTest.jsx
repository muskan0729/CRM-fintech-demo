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
        s.name === "Payin" ? "#2563EB" : "#22C55E"
      ),

      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "45%",
          borderRadius: 4,
        },
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

        {/* YEAR SELECT */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border px-2 py-1 text-xs rounded"
        >
          {[2023, 2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* TOGGLES */}
        <div className="flex gap-4 text-xs">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showPayin}
              onChange={() => setShowPayin(p => !p)}
              className="accent-blue-600"
            />
            Payin
          </label>

          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showPayout}
              onChange={() => setShowPayout(p => !p)}
              className="accent-green-600"
            />
            Payout
          </label>
        </div>

      </div>

      {/* CHART */}
      <div ref={chartRef} className="flex-1" />

    </div>
  );
};