import React, { useState } from "react";

const DashboardSkeleton = () => {
  const [role] = useState(atob(localStorage.getItem("role")) || "admin");

  return (
    <div className="flex min-h-screen bg-[#f5f9ff]">
      <div className="flex-1 p-6 lg:p-10 animate-pulse">

        {/* ================= TOP SECTION ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">

          {/* LEFT: Monthly Summary Chart */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-[#e0ecff]">
            <div className="h-5 w-48 bg-[#cfe0ff] rounded mb-6" />
            <div className="h-64 bg-[#e6efff] rounded-xl" />
          </div>

          {/* RIGHT: KPI CARDS (2x2) */}
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-5 border border-[#e0ecff]"
              >
                <div className="h-4 w-28 bg-[#cfe0ff] rounded mb-4" />
                <div className="h-6 w-20 bg-[#b9d1ff] rounded mb-2" />
              </div>
            ))}
          </div>

        </div>

        {/* ================= TRANSACTION SECTION ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e0ecff] overflow-hidden">

          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 bg-[#0f3d3e] rounded-t-2xl">
            <div className="h-5 w-48 bg-white/30 rounded" />
            <div className="h-8 w-28 bg-white/30 rounded-full" />
          </div>

          {/* Table Rows */}
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, row) => (
              <div
                key={row}
                className="flex justify-between items-center border-b pb-3 border-[#eef4ff]"
              >
                {[...Array(5)].map((__, col) => (
                  <div
                    key={col}
                    className="h-4 w-24 bg-[#cfe0ff] rounded"
                  />
                ))}
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardSkeleton;