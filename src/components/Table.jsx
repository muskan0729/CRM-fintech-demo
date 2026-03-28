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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm text-left border-collapse">
          <thead
            className="uppercase text-white top-0 z-20"
            style={{
              background: "linear-gradient(250deg, #2a91d9 0%, #00418c 100%)",
            }}
          >
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="font-semibold text-sm px-4 py-3 whitespace-nowrap tracking-wide"
                >
                  {col.header}
                </th>
              ))}

              {showDeleteColumn && (
                <th className="font-semibold text-sm px-4 py-3 whitespace-nowrap">
                  Delete
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className={`transition-all duration-150 ${
                    idx % 2 === 0 ? "bg-[#e6efff]" : "bg-white"
                  } hover:bg-blue-100`}
                >
                  {columns.map((col, ci) => (
                    <td
                      key={ci}
                      className="px-4 py-2 text-gray-700 font-normal text-[13px] leading-5 break-words"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {col.Cell
                        ? col.Cell({ value: row[col.accessor], row })
                        : row[col.accessor]}
                    </td>
                  ))}

                  {showDeleteColumn && (
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleConfirmModal(row.id)}
                        className="text-red-600 hover:text-red-800 transition"
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
                  colSpan={showDeleteColumn ? columns.length + 1 : columns.length}
                  className="text-center text-gray-600 py-10 bg-white"
                >
                  <img
                    src={nodata}
                    alt="no data"
                    className="mx-auto h-32 w-32"
                  />
                  <p className="mt-2 text-gray-500">No data found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
{showPagination && data.length > 0 && (
  <div className="flex flex-col md:flex-row justify-between items-center px-4 py-3 bg-gray-200 rounded-b-2xl border-t border-gray-300 shadow-inner">
    
    {/* Entries selector */}
    <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
      <span>Show</span>
      <select
        value={entriesPerPage}
        onChange={(e) => {
          setEntriesPerPage(Number(e.target.value));
          onPageChange(1); // reset to first page
        }}
        className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:ring-1 focus:ring-sky-400 outline-none"
      >
        {[50, 100, 150, 200].map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
      <span>entries</span>
    </div>

    {/* Pagination controls */}
    <div className="flex items-center gap-3 mt-2 md:mt-0">

      {/* Prev Button */}
      <button
        onClick={() => {
          if (currentPage > 1) {
            onPageChange(currentPage - 1);
          }
        }}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm rounded-md font-medium bg-blue-600 text-white disabled:bg-gray-300"
      >
        Prev
      </button>

      {/* Page Info */}
      <span className="text-sm font-medium text-gray-800">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next Button */}
      <button
        onClick={() => {
          if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
          }
        }}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm rounded-md font-medium bg-blue-600 text-white disabled:bg-gray-300"
      >
        Next
      </button>

    </div>
  </div>
)}

      <ConfirmModal
        showConfirmModal={showConfirmModal}
        handleConfirmModal={() => setShowConfirmModal(false)}
        action={handleDelete}
        heading="Confirm Delete"
        body="Are you sure you want to delete this record?"
      />
    </div>
  );
};

export default Table;