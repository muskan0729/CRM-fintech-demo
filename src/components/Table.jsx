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
    <table className="w-full text-sm text-left">

      {/* HEADER */}
      <thead className="text-xs uppercase bg-[#033b44] text-slate-300">
        <tr>
          {columns.map((col, idx) => (
            <th
              key={idx}
              className="px-5 py-4 font-semibold tracking-wide"
            >
              {col.header}
            </th>
          ))}

          {showDeleteColumn && (
            <th className="px-5 py-4">Delete</th>
          )}
        </tr>
      </thead>

      {/* BODY */}
<tbody className="bg-white">
  {paginatedData.length ? (
    paginatedData.map((row, idx) => (
      <tr
        key={row.id || idx}
        className={`
          transition-all duration-300
          bg-[#365458]/15 
          hover:bg-[#04606F]/60
          backdrop-blur-sm
        `}
        style={{
          boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
        }}
      >
        {columns.map((col, ci) => (
          <td
            key={ci}
            className="px-4 py-4 text-[#033b44] text-[15px] leading-5 break-words"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {col.Cell
              ? col.Cell({ value: row[col.accessor], row })
              : row[col.accessor]}
          </td>
        ))}

        {showDeleteColumn && (
          <td className="px-4 py-4 text-center">
            <button
              type="button"
              onClick={() => handleConfirmModal(row.id)}
              className="text-red-400 hover:text-red-300 transition"
            >
              <i className="fa-solid fa-trash fa-lg"></i>
            </button>
          </td>
        )}
      </tr>
    ))
  ) : (
          <tr>
            <td
              colSpan={columns.length}
              className="text-center py-10 text-slate-400"
            >
              <img src={nodata} className="mx-auto h-24 opacity-70" />
              <p className="mt-2">No data found</p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
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