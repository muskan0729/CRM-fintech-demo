import React, { useEffect, useRef, useState } from "react";

export const DonutChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [mode, setMode] = useState("UPI");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);

  // Detect mobile for responsiveness
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset selection when mode or data changes
  useEffect(() => {
    setSelectedLabel(null);
    setSelectedValue(null);
  }, [mode, data]);

  // ────────────────────────────────────────────────
  // Data handling – computed once per render
  // ────────────────────────────────────────────────
  const txData = data?.[mode] || {};
  const pending = Number(txData.initiated) || 0;
  const success = Number(txData.success)   || 0;
  const failed  = Number(txData.failed)    || 0;
  const total   = pending + success + failed;
  const isEmpty = total === 0;

  const series = isEmpty ? [1] : [pending, success, failed];
  const labels = isEmpty ? ["No activity"] : ["Initiated", "Success", "Failed"];

  // Animation trigger when data or mode meaningfully changes
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [mode, data]);

  // ────────────────────────────────────────────────
  // Chart creation / update
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!chartRef.current || typeof ApexCharts === "undefined") {
      console.warn("ApexCharts not loaded or ref missing");
      return;
    }

    const displayLabel = selectedLabel || (isEmpty ? "—" : "Total");
    const displayValue = selectedValue !== null ? selectedValue.toLocaleString() : (isEmpty ? "" : total.toLocaleString());

    const options = {
      series,
      labels,
      chart: {
        height: isMobile ? 240 : 280,
        type: "donut",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
        events: {
          dataPointSelection: (event, chartContext, config) => {
            if (isEmpty) return;
            const index = config.dataPointIndex;
            setSelectedLabel(labels[index]);
            setSelectedValue(series[index]);
          },
        },
      },
      colors: isEmpty ? ["#e2e8f0"] : ["#3187afff", "#369c36", "#1a5b8a"],
      stroke: { show: true, width: 5, colors: ["#e9eeecff"] },
      plotOptions: {
        pie: {
          donut: {
            size: "74%",
            labels: {
              show: true,
              total: {
                show: true,
                showAlways: true,
                label: displayLabel,
                fontSize: isMobile ? "20px" : isAnimating ? "22px" : "20px",
                fontWeight: 800, // Bold by default
                color: isEmpty ? "#94a3b8" : "#0f172a",
                offsetY: -4,
                formatter: () => displayValue,
              },
            },
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "radial",
          gradientToColors: isEmpty ? ["#9ca3af"] : ["#0d35b9ff", "#3b82f6", "#14b8a6"],
          stops: [0, 0, 100],
        },
      },
      dataLabels: { enabled: false },
      legend: {
        position: "bottom",
        fontSize: isMobile ? "12px" : "13px",
        fontWeight: 600, // Bold by default
        offsetY: isMobile ? 4 : 6,
        markers: { width: isMobile ? 10 : 12, height: isMobile ? 10 : 12, radius: 10 },
        itemMargin: { horizontal: isMobile ? 10 : 14, vertical: isMobile ? 4 : 6 },
      },
      tooltip: {
        enabled: !isEmpty,
        style: { fontSize: isMobile ? "11px" : "12.5px" },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { height: 240 },
            legend: { offsetY: 4, fontSize: "12px" },
          },
        },
        {
          breakpoint: 480,
          options: {
            chart: { height: 200 },
            legend: { offsetY: 2, fontSize: "11px" },
          },
        },
      ],
    };

    if (!chartInstance.current) {
      // First render → create chart
      chartInstance.current = new ApexCharts(chartRef.current, options);
      chartInstance.current.render();
    } else {
      // Update existing chart → smooth transition
      chartInstance.current.updateOptions(options, true, true);
    }

    // Cleanup on unmount or before next effect run
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [mode, data, isMobile, selectedLabel, selectedValue, isAnimating, total, series, labels]); // Dependencies include selection states

  // Prevent rapid mode spam (optional but improves UX)
  const changeMode = (newMode) => {
    if (newMode !== mode) {
      setMode(newMode);
    }
  };

  const accentColor = mode === "UPI" ? "#3187afff" : "#369c36";

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
        borderRadius: "20px",
        border: "1px solid rgba(226,232,240,0.9)",
        boxShadow: "0 16px 32px -10px rgba(0,0,0,0.07)",
        padding: isMobile ? "16px" : "20px 20px 28px",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        minHeight: isMobile ? "300px" : "340px",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.4s ease",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Glow background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 70% 30%, ${accentColor}12 0%, transparent 65%)`,
          opacity: isAnimating ? 0.6 : 0.12,
          transition: "opacity 1s ease",
          pointerEvents: "none",
        }}
      />

      {/* Header - more compact and responsive */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: isMobile ? "16px" : "20px",
          position: "relative",
          zIndex: 2,
          flexWrap: "wrap",
          gap: isMobile ? "12px" : "0",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 auto", minWidth: 0 }}>
          <div
            // style={{
            //   width: "12px",
            //   height: "12px",
            //   borderRadius: "50%",
            //   background: accentColor,
            //   boxShadow: `0 0 12px ${accentColor}50`,
            //   animation: isAnimating ? "breathe 2s infinite ease-in-out" : "none",
            // }}
          />
          <div>
            <h5
              style={{
                fontSize: isMobile ? "1.2rem" : "1.35rem",
                fontWeight: "800", // Bold by default
                color: "#0f172a",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {mode === "UPI" ? "PayIn" : "PayOut"}
            </h5>
            {/* Removed "Transactions" as per request */}
          </div>
        </div>

        {/* Responsive toggle - stacks on mobile, smaller on small screens */}
        <div
          className="toggle-container"
          style={{
            background: "#f1f5f9",
            borderRadius: "999px",
            padding: isMobile ? "4px" : "3px",
            display: "inline-flex",
            boxShadow: "inset 0 1px 4px rgba(0,0,0,0.05)",
            flexShrink: 0,
            minWidth: isMobile ? "100%" : "140px",
            width: isMobile ? "100%" : "auto",
            justifyContent: isMobile ? "stretch" : "flex-start",
          }}
        >
          <button
            onClick={() => changeMode("UPI")}
            style={{
              padding: isMobile ? "6px 12px" : "5px 16px",
              borderRadius: "999px",
              fontSize: isMobile ? "0.8rem" : "0.86rem",
              fontWeight: "600", // Bold by default
              color: mode === "UPI" ? "white" : "#475569",
              background: mode === "UPI" ? accentColor : "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all 0.28s ease",
              boxShadow: mode === "UPI" ? "0 2px 8px rgba(49,135,175,0.3)" : "none",
              whiteSpace: "nowrap",
              flex: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Pay-in
          </button>

          <button
            onClick={() => changeMode("payout")}
            style={{
              padding: isMobile ? "6px 12px" : "5px 16px",
              borderRadius: "999px",
              fontSize: isMobile ? "0.8rem" : "0.86rem",
              fontWeight: "600", // Bold by default
              color: mode !== "UPI" ? "white" : "#475569",
              background: mode !== "UPI" ? accentColor : "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all 0.28s ease",
              boxShadow: mode !== "UPI" ? "0 2px 8px rgba(54,156,54,0.3)" : "none",
              whiteSpace: "nowrap",
              flex: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Payout
          </button>
        </div>
      </div>

      {/* Chart area - responsive sizing */}
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: isMobile ? "200px" : "240px",
          width: "100%",
        }}
      >
        <div
          ref={chartRef}
          style={{
            width: "100%",
            maxWidth: isMobile ? "100%" : "340px",
            height: isMobile ? "240px" : "280px",
            transform: isAnimating ? "scale(0.98)" : "scale(1)",
            transition: "transform 0.8s ease-out",
          }}
        />

        {isEmpty && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: isMobile ? "1rem" : "1.1rem",
              background: "rgba(248,250,252,0.88)",
              borderRadius: "14px",
              pointerEvents: "none",
              width: "100%",
              height: "100%",
            }}
          >
            <div style={{ fontSize: isMobile ? "2.5rem" : "2.8rem", marginBottom: "8px", opacity: 0.7 }}>📊</div>
            No data
          </div>
        )}
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.3); opacity: 0.7; }
        }

        @media (max-width: 768px) {
          .toggle-container {
            flex-direction: column !important;
            gap: 4px !important;
            border-radius: 12px !important;
            padding: 6px !important;
          }
          .toggle-container > button {
            width: 100% !important;
            border-radius: 8px !important;
            padding: 8px 12px !important;
            font-size: 0.85rem !important;
          }
        }

        @media (max-width: 480px) {
          .toggle-container > button {
            padding: 6px 10px !important;
            font-size: 0.8rem !important;
          }
        }
      `}</style>
    </div>
  );
};