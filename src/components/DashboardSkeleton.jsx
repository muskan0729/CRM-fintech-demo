import React, { useState } from "react";

const DashboardSkeleton = () => {
  const [role] = useState(atob(localStorage.getItem("role")) || "admin");

  return (
    <div className="flex min-h-screen bg-[#f5f9ff]">
      <div className="flex-1 p-6 lg:p-10 animate-pulse">

        {/* ================= TOP KPI CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border shadow-sm p-6 bg-white"
              style={{ borderColor: "#dbe7ff" }}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="h-4 w-32 bg-[#cfe0ff] rounded" />
                <div className="h-6 w-6 bg-[#cfe0ff] rounded" />
              </div>

              <div className="h-8 w-28 bg-[#b9d1ff] rounded mb-4" />

              <div className="h-4 w-20 bg-[#e6efff] rounded" />
            </div>
          ))}
        </div>

        {/* ================= KPI CARDS ================= */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 mb-10">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div
                className="p-3"
                style={{
                  background: "linear-gradient(250deg,#2a91d9,#00418c)",
                }}
              >
                <div className="h-4 w-28 bg-blue-300/60 rounded" />
              </div>

              <div className="p-6 flex justify-center">
                <div className="h-6 w-32 bg-[#cfe0ff] rounded" />
              </div>
            </div>
          ))}
        </div> */}

        {/* ================= CHART SECTION ================= */}
        {role === "admin" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-12">

            {/* Monthly Revenue / Line Chart Skeleton */}
            <div
              className="xl:col-span-2 rounded-2xl border shadow-sm p-6 bg-white"
              style={{ borderColor: "#dbe7ff" }}
            >
              <div className="h-5 w-40 bg-[#cfe0ff] rounded mb-6" />
              <div className="h-64 bg-[#e6efff] rounded-lg" />
            </div>

            {/* Left Donut / Flip Card Skeleton */}
            <div
              className="xl:col-span-1 rounded-2xl border shadow-sm p-6 flex flex-col items-center justify-center bg-white"
              style={{ borderColor: "#dbe7ff" }}
            >
              <div className="h-5 w-40 bg-[#cfe0ff] rounded mb-6" />

              <div className="relative">
                <div className="w-48 h-48 rounded-full bg-[#dbe7ff]" />
                <div className="absolute top-10 left-10 w-28 h-28 rounded-full bg-white" />
              </div>

              <div className="mt-6 space-y-2 w-full">
                <div className="h-3 w-24 bg-[#cfe0ff] rounded mx-auto" />
                <div className="h-3 w-32 bg-[#cfe0ff] rounded mx-auto" />
              </div>
            </div>

          </div>
        )}

        {/* ================= TABLE SECTION ================= */}
        <div
          className="rounded-2xl border shadow-sm overflow-hidden bg-white"
          style={{ borderColor: "#dbe7ff" }}
        >
          {/* Table Header */}
          <div className="px-6 py-4 bg-[#eef4ff]">
            <div className="h-5 w-48 bg-[#cfe0ff] rounded" />
          </div>

          {/* Table Rows */}
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, row) => (
              <div
                key={row}
                className="flex justify-between items-center border-b pb-3"
                style={{ borderColor: "#eef4ff" }}
              >
                {[...Array(6)].map((__, col) => (
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
