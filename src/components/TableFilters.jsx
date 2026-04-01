import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "./Button";

const TableFilters = ({
  rawData = [],
  txnSearch,
  showSearch = true,
  setTxnSearch,
  statusFilter,
  setStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedMerchant,
  setSelectedMerchant,
  statusList = [],
  showExport = true,
  showStatusFilter = true,
  showDateFilter = true,
  showSelectUserFilter = false,
  onExportCSV,
  exporting,
  onClearAll,
  totalSuccessAmount = 0,
    merchantOptions = [],   
}) => {
  const [openExport, setOpenExport] = useState(false);
  const exportRef = useRef(null);


    const role = atob(localStorage.getItem("role"));
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setOpenExport(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const selectData = useMemo(() => {
  //   return Array.from(
  //     new Map(
  //       rawData?.map((item) => {
  //         const value = item.user_id ?? item.id;
  //         const label =
  //           item.merchant_details_text ||
  //           (item.merchant_name && `${item.merchant_name} (${value})`) ||
  //           (item.raw_name && `${item.raw_name} (${value})`) ||
  //           `User ${value}`;

  //         return [value, { value, label }];
  //       })
  //     ).values()
  //   );
  // }, [rawData]);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const years = Array.from({ length: 25 }, (_, i) => 2015 + i);

  const customHeader = ({ date, changeMonth, changeYear }) => (
    <div className="flex justify-between items-center px-2 py-1 bg-gradient-to-r from-sky-200 to-indigo-200 rounded-t-lg">
      <select
        value={months[date.getMonth()]}
        onChange={(e) => changeMonth(months.indexOf(e.target.value))}
        className="bg-white text-sky-800 rounded px-2 py-1 border border-sky-300 text-sm"
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={date.getFullYear()}
        onChange={(e) => changeYear(Number(e.target.value))}
        className="bg-white text-sky-800 rounded px-2 py-1 border border-sky-300 text-sm"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );

  // return (
return (
  <div className="w-full flex flex-col gap-5">
{showSearch && (
    <div className="relative w-full">
      <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-400"></i>
      <input
        type="text"
        placeholder="Search Merchant / TxnId / Payee"
        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-sky-400 outline-none"
        value={txnSearch}
        onChange={(e) => setTxnSearch(e.target.value)}
      />
    </div>
    )}

    {/* 📅 Date Filter */}
    {showDateFilter && (
      <div className="flex flex-col gap-3 w-full">
        <label className="text-sm font-medium text-gray-600">Date Range</label>

        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm"
          renderCustomHeader={customHeader}
          isClearable
        />

        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="End Date"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm"
          renderCustomHeader={customHeader}
          isClearable
        />
      </div>
    )}

    {/* 🔽 Status */}
    {showStatusFilter && (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-600">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 shadow-sm font-medium"
        >
          <option value="all">All</option>
          {statusList?.map((item, idx) => (
            <option key={idx} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    )}

    {/* 👤 Merchant */}
    {showSelectUserFilter && role === "admin" && (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-600">Merchant</label>
        <select
          value={selectedMerchant?.value || ""}
          onChange={(e) => {
            const selected = merchantOptions.find(
              (item) => String(item.value) === e.target.value
            );
            setSelectedMerchant(selected || null);
          }}
          className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 shadow-sm font-medium"
        >
          <option value="">Select Merchant</option>
          {merchantOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    )}

    {/* 📤 Export */}
    {showExport && (
      <div className="relative w-full" ref={exportRef}>
        <Button
          onClick={() => !exporting && setOpenExport((prev) => !prev)}
          disabled={exporting}
          className={`w-full text-white px-4 py-2 rounded-lg shadow-md flex items-center justify-center gap-2 ${
            exporting ? "opacity-60 cursor-not-allowed" : ""
          }`}
          style={{
            // background: "linear-gradient(275deg, #a2c1f3ff, #d4d6ddff)",
             background:"var(--bg-button)"
  
          }}
        >
          {exporting ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-blue-800 border-t-transparent rounded-full"  style={{background:"var(--bg-button)"
          }}></span>
              Exporting...
            </>
          ) : (
            <>
              <i className="fa-solid fa-download"></i> Export
            </>
          )}
        </Button>

        {openExport && !exporting && (
          <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg p-2 w-full z-50"
         >
            <button
              onClick={() => {
                onExportCSV?.();
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
            >
              CSV
            </button>
          </div>
        )}
      </div>
    )}

    {/* 💰 Success Amount */}
    {showSelectUserFilter && totalSuccessAmount > 0 && (
      <div className="text-sm font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-lg shadow-sm">
        ₹{Number(totalSuccessAmount || 0).toFixed(2)} Successful
      </div>
    )}
  </div>
);
  // );
};

export default TableFilters;