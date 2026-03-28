import { useEffect, useRef, useMemo, useState } from "react";

export const LineChart1 = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [showPayin, setShowPayin] = useState(true);
  const [showPayout, setShowPayout] = useState(true);

  // ================= MONTH CONSTANTS =================
  const DEFAULT_MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const MONTH_MAP = {
    January: "Jan", February: "Feb", March: "Mar", April: "Apr",
    May: "May", June: "Jun", July: "Jul", August: "Aug",
    September: "Sep", October: "Oct", November: "Nov", December: "Dec",
  };

  // ================= DYNAMIC MONTH RANGE (last 12 months from today) =================
  const getLast12Months = () => {
    const today = new Date();
    const months = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthShort = DEFAULT_MONTHS[date.getMonth()];
      const yearShort = date.getFullYear().toString().slice(-2);
      const yearFull = date.getFullYear();
      months.push({
        label: `${monthShort} '${yearShort}`,
        month: monthShort,
        fullMonth: date.toLocaleString("default", { month: "long" }),
        year: yearFull,
      });
    }

    return months;
  };

  const monthsRange = useMemo(() => getLast12Months(), []);

  // ================= FORMAT API DATA INTO MAP =================
  const dataMap = useMemo(() => {
    const map = {};

    if (!Array.isArray(data)) {
      console.warn("[LineChart1] Invalid data: expected array, received:", data);
      return map;
    }

    data.forEach((item, index) => {
      if (typeof item !== "object" || item === null) {
        console.warn(`[LineChart1] Invalid item at index ${index}:`, item);
        return;
      }

      let rawMonth = (item.month_name || "").trim();
      let monthPart = rawMonth.split(/[\s\-/]/)[0];
      let yearPartFromMonth = rawMonth.match(/\d{4}|\d{2}/)?.[0];

      const month = MONTH_MAP[monthPart] ||
                    MONTH_MAP[monthPart.charAt(0).toUpperCase() + monthPart.slice(1).toLowerCase()] ||
                    "Jan";

      let year = item.year ?? yearPartFromMonth ?? new Date().getFullYear();
      if (typeof year === "string") {
        year = year.replace(/\D/g, "");
        year = year.length === 2 ? `20${year}` : year;
        year = parseInt(year, 10);
      }

      if (isNaN(year) || year < 2000 || year > new Date().getFullYear() + 5) {
        console.warn(`[LineChart1] Invalid year for item:`, item, "→ using current year");
        year = new Date().getFullYear();
      }

      const key = `${month}-${year}`;

      // console.log(`[LineChart1] Parsed item #${index}: raw_month="${rawMonth}", month="${month}", year=${year}, key="${key}"`);

      map[key] = {
        payinAmount: Number(item.payin_amount) || 0,
        payinCount: Number(item.payin_count) || 0,
        payoutAmount: Number(item.payout_amount) || 0,
        payoutCount: Number(item.payout_count) || 0,
      };
    });

    // console.log("[LineChart1] All parsed keys:", Object.keys(map));

    return map;
  }, [data]);

  const chartData = useMemo(() => {
    return monthsRange.map(({ label, month, year }) => {
      const key = `${month}-${year}`;
      const entry = dataMap[key] || {};

      if (month === "Dec" && year === 2025 && !entry.payinAmount && !entry.payoutAmount) {
        console.warn(`Dec 2025 missing! Expected key: ${key} | Available keys:`, Object.keys(dataMap));
      }

      return {
        month_name: label,
        payinAmount: entry.payinAmount || 0,
        payinCount: entry.payinCount || 0,
        payoutAmount: entry.payoutAmount || 0,
        payoutCount: entry.payoutCount || 0,
      };
    });
  }, [monthsRange, dataMap]);

  const months = chartData.map((i) => i.month_name);

  // ================= FORMATTERS =================
  const formatShortIndian = (num) => {
    if (num == null || num === 0) return "0";
    const abs = Math.abs(num);

    let value, unit;
    if (abs >= 10000000) {
      value = abs / 10000000;
      unit = "Cr";
    } else if (abs >= 100000) {
      value = abs / 100000;
      unit = "L";
    } else if (abs >= 1000) {
      value = abs / 1000;
      unit = "K";
    } else {
      value = abs;
      unit = "";
    }

    const formatted = value < 10 ? value.toFixed(1) : Math.round(value).toString();
    return (num < 0 ? "-" : "") + formatted + unit;
  };

  const formatFullIndian = (num) =>
    Number(num).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
    });

  const yAxisMax = useMemo(() => {
    let values = [];
    if (showPayin) values.push(...chartData.map((i) => i.payinAmount));
    if (showPayout) values.push(...chartData.map((i) => i.payoutAmount));

    const max = Math.max(...values, 0);
    return max > 0 ? max * 1.12 : 10;
  }, [chartData, showPayin, showPayout]);

  const series = useMemo(() => {
    const s = [];
    if (showPayin) {
      s.push({ name: "Payin", data: chartData.map((i) => i.payinAmount) });
    }
    if (showPayout) {
      s.push({ name: "Payout", data: chartData.map((i) => i.payoutAmount) });
    }
    if (s.length === 0) {
      s.push({ name: "No selection", data: Array(12).fill(0) });
    }
    return s;
  }, [showPayin, showPayout, chartData]);

  useEffect(() => {
    if (!chartRef.current || typeof ApexCharts === "undefined") return;

    const options = {
      chart: {
        type: "area",
        height: 320,
        toolbar: { show: false },
        fontFamily: "Inter, sans-serif",
      },

      series,

      // Fixed: Assign colors by name instead of index slicing
      colors: series.map(s => s.name === "Payin" ? "#2563EB" : "#22C55E"),

      stroke: { curve: "smooth", width: 3 },

      dataLabels: { enabled: false },

      xaxis: {
        categories: months,
        axisBorder: { show: true },
        axisTicks: { show: true },
      },

      yaxis: {
        min: 0,
        max: yAxisMax,
        tickAmount: 5,
        forceNiceScale: true,
        labels: {
          formatter: formatShortIndian,
          style: { fontSize: "12px" },
        },
        title: {
          text: "Amount (₹)",
          offsetX: 5,
          style: { fontSize: "13px", fontWeight: 500 },
        },
      },

      legend: { show: false },

      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.4,
          gradientToColors: series.map(s => s.name === "Payin" ? "#60A5FA" : "#86EFAC"),
          opacityFrom: 0.65,
          opacityTo: 0.15,
          stops: [0, 90, 100],
        },
      },

      tooltip: {
        shared: true,
        followCursor: true,
        intersect: false,
        y: {
          formatter: function (val, { seriesIndex, dataPointIndex }) {
            const point = chartData[dataPointIndex];
            if (!point) return "";

            // Only show the line for the current series being hovered
            const name = series[seriesIndex]?.name;

            if (name === "Payin") {
              return `Payin: ₹${formatFullIndian(point.payinAmount)} (${point.payinCount})`;
            }
            if (name === "Payout") {
              return `Payout: ₹${formatFullIndian(point.payoutAmount)} (${point.payoutCount})`;
            }
            return "";
          },
        },
      },

      noData: {
        text: "No data available",
        align: "center",
        verticalAlign: "middle",
        style: { fontSize: "14px", color: "#94a3b8" },
      },
    };

    if (!chartInstance.current) {
      chartInstance.current = new ApexCharts(chartRef.current, options);
      chartInstance.current.render();
    } else {
      chartInstance.current.updateOptions(options, true, true);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [series, months, chartData, yAxisMax, showPayin, showPayout]);

  return (
    <div className="w-full rounded-lg md:p-6 bg-white shadow-sm">
      <p className="text-xl font-bold text-gray-700 mb-4">
        Monthly Success Volume (Payin + Payout)
      </p>

      <div ref={chartRef} />

      <div className="flex justify-center gap-10 mt-5 text-sm font-medium text-gray-700">
        <label className="flex items-center gap-2.5 cursor-pointer hover:text-blue-600 transition">
          <input
            type="checkbox"
            checked={showPayin}
            onChange={() => setShowPayin((p) => !p)}
            className="w-4 h-4 accent-blue-600"
          />
          Payin
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer hover:text-green-600 transition">
          <input
            type="checkbox"
            checked={showPayout}
            onChange={() => setShowPayout((p) => !p)}
            className="w-4 h-4 accent-green-600"
          />
          Payout
        </label>
      </div>
    </div>
  );
};