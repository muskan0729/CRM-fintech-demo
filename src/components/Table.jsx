import React, { useMemo, useState, useEffect } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";
import nodata from "../images/nodatafound.jpeg";

const Table = ({
  columns,
  data = [],
  showPagination = true,
  showDeleteColumn = true,
  endPoint = "",
  refreshTable,
  setData,
  isServerPaginated = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadNext = () => {},
  entriesPerPage = 50,
  setEntriesPerPage = () => {},
    currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
}) => {
  const toast = useToast();

  const [recordId, setRecordId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);



  const handleConfirmModal = (id) => {
    setRecordId(id);
    setShowConfirmModal(true);
  };

  const modifiedEndpoint = endPoint && recordId ? `${endPoint}/${recordId}` : null;
  const { execute: deleteRecord } = usePost(modifiedEndpoint || "");

  const handleDelete = async () => {
    if (!recordId || !modifiedEndpoint) return;

    try {
      await deleteRecord({});
      toast.success("Record deleted successfully!");

      if (setData) {
        setData((prev) => prev.filter((row) => row.id !== recordId));
      }

      refreshTable?.();
      setShowConfirmModal(false);
      setRecordId(null);
    } catch {
      toast.error("Failed to delete record.");
    }
  };

  // const totalPages = Math.ceil(data.length / entriesPerPage) || 1;

const paginatedData = useMemo(() => {
  if (isServerPaginated) return data;
  return data.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );
}, [data, currentPage, entriesPerPage, isServerPaginated]);

  return (
<div className="bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-200 overflow-hidden">
  <div className="overflow-x-auto">
    <div className="flex flex-col gap-4">
  {paginatedData.length ? (
    paginatedData.map((row, idx) => (
      <div
        key={row.id || idx}
        className="bg-[#f6f3ef] rounded-2xl shadow-md p-6 border border-gray-200 relative"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">

          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col">
              <span className="text-gray-500 text-xs uppercase font-semibold">
                {col.header}
              </span>

              <span className="text-[#033b44] font-medium mt-1">
                {col.Cell
                  ? col.Cell({ value: row[col.accessor], row })
                  : row[col.accessor]}
              </span>
            </div>
          ))}

        </div>

        {/* Delete Button */}
        {showDeleteColumn && (
          <button
            onClick={() => handleConfirmModal(row.id)}
            className="absolute bottom-4 right-4 bg-red-100 hover:bg-red-200 p-3 rounded-xl"
          >
            <i className="fa-solid fa-trash text-red-500"></i>
          </button>
        )}
      </div>
    ))
  ) : (
    <div className="text-center py-10 text-gray-400">
      {/* <img src={nodata} className="mx-auto h-24 opacity-70" /> */}
      <p className="mt-2">No data found</p>
    </div>
  )}
</div>
  </div>

  {/* PAGINATION */}
  {showPagination && data.length > 0 && (
    <div className="flex justify-between items-center px-5 py-4 bg-[#033b44] border-t border-[#04454f]">

      <div className="flex items-center gap-2 text-sm text-slate-300">
        <span>Show</span>
        <select
          value={entriesPerPage}
          onChange={(e) => {
            setEntriesPerPage(Number(e.target.value));
            onPageChange(1);
          }}
          className="bg-[#022c33] border border-[#04454f] px-2 py-1 rounded text-white"
        >
          {[50, 100, 150, 200].map((num) => (
            <option key={num}>{num}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 rounded bg-[#04454f] text-white disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-sm text-slate-300">
          {currentPage} / {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 rounded bg-[#04454f] text-white disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )}
</div>
  );
};

export default Table;