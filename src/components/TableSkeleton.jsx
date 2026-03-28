import React from "react";

export const TableSkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
      <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex justify-between items-center border-b border-gray-100 pb-2"
          >
            {[...Array(5)].map((__, j) => (
              <div key={j} className="h-4 w-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
