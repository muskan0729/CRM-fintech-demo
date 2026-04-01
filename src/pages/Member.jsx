import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../components/Table";
import TableFilters from "../components/TableFilters";
import Toggle from "../components/Toggle";
import Button from "../components/Button";
import { SchemeModal } from "../components/SchemeModal";
import useAutoFetch from "../hooks/useAutoFetch";
import { usePut } from "../hooks/usePut";
import { MONTH_NAMES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";
import { useGet } from "../hooks/useGet";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";
import ActionDropdown from "../components/actionDropdown";
import WalletModal from "../components/WalletModal";
import PayinSettlementModal from "../components/PayinSettlementModal";

export const Member = () => {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const memberDetails = useNavigate();
  const memberVerify = useNavigate();

  const [merchantData, setMerchantData] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showPayinModal, setShowPayinModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [modalType, setModalType] = useState("load");

  const [walletFormData, setWalletFormData] = useState({
    payout_wallet: "",
    remark: "",
  });

  const { execute: loadWallet } = usePost("/payout-load-wallet");
  const { execute: reverseTopup } = usePost("/payout-take-back");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const [txnSearch, setTxnSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterMerchant, setFilterMerchant] = useState(null);

  const { executePut: updateSingle } = usePut("/update-user-statuses");
  const { executePut: updateAll } = usePut("/payin-payout-statuses");
  const { execute: updateCredential } = usePost("/update-credential");
  const { data: Bank_payin } = useGet("/payinbanks-List");
  const { executePut: updatepayinbank } = usePut("/update-user-payin-bank");

  const {
    data: dataOfMerchants,
    refetch: refetchOfMerchants,
    loading: merchantLoading,
  } = useAutoFetch("/get-merchants", 20000);

  const m_id = dataOfMerchants?.data?.map((m) => m.id).join(",");
  const { data: credentialsData } = useGet("/credentials");

  const initialDataOfMerchants = useMemo(
    () => dataOfMerchants?.data ?? [],
    [dataOfMerchants]
  );

  const { data: summaryData } = useAutoFetch(`/collection-summary?user_ids=${m_id}`);

  useEffect(() => {
    if (!merchantLoading && dataOfMerchants) setInitialLoad(false);
  }, [merchantLoading, dataOfMerchants]);

  const bankList = Bank_payin?.data?.data || [];

  const handleChange = (e) => {
    setWalletFormData({
      ...walletFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitWallet = async (e) => {
    e.preventDefault();

    const payload = {
      user_id: selectedUser.id,
      payout_wallet: walletFormData.payout_wallet,
      remark: walletFormData.remark,
    };

    try {
      const res =
        modalType === "load"
          ? await loadWallet(payload)
          : await reverseTopup(payload);

      if (res) {
        toast.success("Wallet updated successfully");
        setShowWalletModal(false);
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleCredentialChange = async (merchantId, credentialId) => {
    try {
      await updateCredential({
        id: merchantId,
        credentials_id: Number(credentialId),
      });
      toast.success("MID Updated Successfully!");
      refetchOfMerchants();
    } catch (err) {
      console.error(err);
      toast.error("Error updating MID");
    }
  };

  const handlePayinBankChange = async (userId, bankId) => {
    try {
      await updatepayinbank({
        user_id: userId,
        payin_bank: Number(bankId),
      });

      toast.success("Payin bank updated");
      refetchOfMerchants();
    } catch (err) {
      console.log(err);
      toast.error("Failed to update bank");
    }
  };

  const handlePayinToggle = async (v, rowId, accountStatus) => {
    try {
      if (accountStatus) await updateSingle({ user_id: rowId, payin_status: v });
    } catch (err) {
      console.log("Payin Toggle Failed: ", err);
    }
  };

  const handlePayoutToggle = async (v, rowId, accountStatus) => {
    try {
      if (accountStatus) await updateSingle({ user_id: rowId, payout_status: v });
    } catch (err) {
      console.log("Payout Toggle Failed: ", err);
    }
  };

  const handleAccountToggle = async (v, rowId) => {
    try {
      const response = await updateSingle({
        user_id: rowId,
        payin_status: false,
        payout_status: false,
        account_status: v,
      });
      if (response) refetchOfMerchants();
    } catch (err) {
      console.log("Account Toggle Failed: ", err);
    }
  };

  const handleAllPayinToggle = async (v) => {
    try {
      const x = v ? 1 : 0;
      const response = await updateAll({ payin_status: x });

      if (response) {
        setMerchantData((prev) =>
          prev.map((item) => ({ ...item, payin: item.account ? v : false }))
        );
      }
    } catch (err) {
      console.log("All Payin Toggle Failed: ", err);
    }
  };

  const handleAllPayoutToggle = async (v) => {
    try {
      const x = v ? 1 : 0;
      const response = await updateAll({ payout_status: x });

      if (response) {
        setMerchantData((prev) =>
          prev.map((item) => ({ ...item, payout: item.account ? v : false }))
        );
      }
    } catch (err) {
      console.log("All Payout Toggle Failed: ", err);
    }
  };

  useEffect(() => {
    if (!initialDataOfMerchants || !credentialsData) return;

    const formattedMerchantData = initialDataOfMerchants.map((item) => {
      const filteredCredentials = credentialsData?.data?.filter(
        (cred) => cred.bank_id === item.payin_bank?.id
      );

      const payinBank = (
        <div className="flex items-center space-x-2">
          <select
            value={item.payin_bank?.id || ""}
            onChange={(e) => handlePayinBankChange(item.id, e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-sky-400"
          >
            <option value="">Select Bank</option>
            {bankList.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.onboard_payin_bank}
              </option>
            ))}
          </select>

          {filteredCredentials?.length > 0 && (
            <select
              value={item.credentials_id || ""}
              onChange={(e) => handleCredentialChange(item.id, e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-sky-400"
            >
              <option value="">Select Credential</option>
              {filteredCredentials.map((cred) => (
                <option key={cred.id} value={cred.id}>
                  {cred.name}
                </option>
              ))}
            </select>
          )}
        </div>
      );

      return {
        sqno: item.id,
        id: item.id,
        user_id: item.id,
        raw_name: item.name || "N/A",
        merchant_name: item.name || "N/A",
        merchant_details_text: `${item.name || "N/A"} (${item.id ?? "N/A"})`,
        created_at: item.created_at,

        name: (
          <span
            className="text-blue-600 cursor-pointer w-100"
            onClick={() => {
              localStorage.setItem("merchantId", item.id);
              memberDetails(`/MerchantDetails/${item.id}`);
            }}
          >
            {item.name}
          </span>
        ),

        kyc:
          item.kyc === 1 ? (
            <span className="py-2 mb-1 text-sm font-semibold text-green-700 bg-green-100 rounded-full">
              Verified
            </span>
          ) : item.kyc_rejected === 1 ? (
            <span className="py-2 mb-1 text-sm font-semibold text-red-700 bg-red-100 rounded-full">
              Rejected
            </span>
          ) : (
            <button
              className="py-2 mb-1 text-sm font-semibold text-orange-700 rounded-full hover:bg-orange-200 cursor-pointer transition"
              onClick={() => {
                localStorage.setItem("merchantId", item.id);
                memberVerify(`/VerifyMerchant/${item.id}`);
              }}
            >
              Verify
            </button>
          ),

        kyc_status:
          item.kyc === 1
            ? "verified"
            : item.kyc_rejected === 1
            ? "rejected"
            : "pending",

        payin_bank: payinBank,
        payin: item.payin_status,
        payout: item.payout_status,
        account: item.account_status,

        walletpayin: (
          <div style={{ width: "200px" }}>
            <span>
              payin wallet:<b>{Number(item.payin_wallet || 0).toFixed(2)}</b>
            </span>
            <br />
            <span>
              Payin Rolling Amount:
              <b>{Number(item.rolling_amount || 0).toFixed(2)}</b>
            </span>
            <br />
            <span>
              Payin Total Charges:
              <b>{Number(item.total_charge?.UPI || 0).toFixed(2)}</b>
            </span>
            <br />
            <span>
              Today Payin Amount:
              <b>{summaryData?.specific_user_today_payin?.[item.id] || 0}</b>
            </span>
            <br />
          </div>
        ),

        walletpayout: (
          <div style={{ width: "200px" }}>
            <span>
              payout wallet:<b>{Number(item.payout_wallet || 0).toFixed(2)}</b>
            </span>
            <br />
            <span>
              payout Bank:<b>{item.payout_at_onboard}</b>
            </span>
            <br />
          </div>
        ),

        date:
          new Date(item.created_at).getDate() +
          " " +
          MONTH_NAMES[new Date(item.created_at).getMonth()] +
          " " +
          new Date(item.created_at).getFullYear(),

        actionMeta: item,
      };
    });

    setMerchantData(formattedMerchantData);
  }, [initialDataOfMerchants, credentialsData, summaryData, bankList]);

  const parseDate = (value) => {
    if (!value) return null;

    if (value instanceof Date && !isNaN(value)) {
      const d = new Date(value);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    const d = new Date(value);
    if (!isNaN(d)) {
      d.setHours(0, 0, 0, 0);
      return d;
    }

    if (typeof value === "string") {
      const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) {
        const fixed = new Date(match[1]);
        fixed.setHours(0, 0, 0, 0);
        return fixed;
      }
    }

    return null;
  };

  const parseEndDate = (value) => {
    const d = parseDate(value);
    if (!d) return null;
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const filteredMerchantData = useMemo(() => {
    return merchantData.filter((row) => {
      const searchValue = txnSearch.trim().toLowerCase();

      const searchText = [
        row.id,
        row.user_id,
        row.raw_name,
        row.merchant_name,
        row.merchant_details_text,
        row.date,
        row.kyc_status,
      ]
        .map((v) => String(v || "").toLowerCase())
        .join(" ");

      const matchesTxn = !searchValue || searchText.includes(searchValue);

      const rowStatus = row.account ? "active" : "inactive";
      const matchesStatus =
        statusFilter === "all" ||
        rowStatus.toLowerCase() === statusFilter.toLowerCase();

      const rowDate = parseDate(row.created_at);
      const start = parseDate(startDate);
      const end = parseEndDate(endDate);

      const matchesDate =
        (!start || (rowDate && rowDate >= start)) &&
        (!end || (rowDate && rowDate <= end));

      const matchesMerchant =
        !filterMerchant || String(row.user_id) === String(filterMerchant.value);

      return matchesTxn && matchesStatus && matchesDate && matchesMerchant;
    });
  }, [merchantData, txnSearch, statusFilter, startDate, endDate, filterMerchant]);

  const exportMembersCSV = () => {
    if (!filteredMerchantData.length) {
      toast.error("No data to export.");
      return;
    }

    const escapeCSV = (field) => {
      const string = String(field ?? "");
      if (
        string.includes('"') ||
        string.includes(",") ||
        string.includes("\n") ||
        string.includes("\r")
      ) {
        return `"${string.replace(/"/g, '""')}"`;
      }
      return string;
    };

    const downloadFile = (content, filename, mimeType) => {
      const encodedUri = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const formatExportDateTime = (value) => {
      if (!value) {
        return { date: "", time: "" };
      }

      const d = new Date(value);

      if (isNaN(d.getTime())) {
        const raw = String(value).trim();
        const parts = raw.split(" ");
        return {
          date: parts[0] || "",
          time: parts[1] || "",
        };
      }

      return {
        date: d.toLocaleDateString("en-GB"),
        time: d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      };
    };

    const csvRows = filteredMerchantData.map((row) => {
      const { date, time } = formatExportDateTime(row.created_at);

      return {
        "User ID": row.id,
        Name: row.raw_name,
        "Merchant Details": row.merchant_details_text,
        "Account Status": row.account ? "Active" : "Inactive",
        "Payin Status": row.payin ? "On" : "Off",
        "Payout Status": row.payout ? "On" : "Off",
        "KYC Status": row.kyc_status,
        "Created Date": date,
        "Created Time": time,
      };
    });

    const headers = Object.keys(csvRows[0]);
    const csv = [
      headers.map(escapeCSV).join(","),
      ...csvRows.map((row) =>
        headers.map((header) => escapeCSV(row[header])).join(",")
      ),
    ].join("\n");

    downloadFile(csv, "member_list_filtered.csv", "text/csv");
    toast.success("CSV exported successfully!");
  };

  const memberColumns = [
    { header: "User id", accessor: "sqno" },
    { header: "Name", accessor: "name" },
    { header: "Payin", accessor: "payin" },
    { header: "Payout", accessor: "payout" },
    { header: "Payin Wallet", accessor: "walletpayin" },
    { header: "Payout Wallet", accessor: "walletpayout" },
    { header: "Payin Onboarded Bank", accessor: "payin_bank" },
    { header: "Action", accessor: "action", width: "220px" },
  ];

  const tableDataWithActions = filteredMerchantData.map((row) => ({
    ...row,
    payin: (
      <Toggle
        defaultChecked={row.payin}
        onChange={(v) => handlePayinToggle(v, row.id, row.account)}
        disabled={!row.account}
      />
    ),
    payout: (
      <Toggle
        defaultChecked={row.payout}
        onChange={(v) => handlePayoutToggle(v, row.id, row.account)}
        disabled={!row.account}
      />
    ),
    sqno: (
      <div className="flex flex-col" style={{ width: "100px" }}>
        <div className="flex items-left gap-3">
          <span className="text-sm font-semibold">{row.sqno}</span>
          <Toggle
            defaultChecked={row.account}
            onChange={(v) => handleAccountToggle(v, row.id)}
            className="mt-1"
          />
        </div>
        <span className="text-xs text-blue-400 font-semibold mt-2">{row.date}</span>
        <span className="text-xs text-blue-400 font-semibold mt-1">{row.kyc}</span>
      </div>
    ),
    action: (
      <ActionDropdown
        merchantId={row.id}
        merchant={row}
        onFundReturn={(merchant) => {
          setSelectedMerchant(merchant);
          setShowWalletModal(true);
        }}
        onPayinSettlement={(merchant) => {
          setSelectedMerchant(merchant);
          setShowPayinModal(true);
        }}
        onScheme={(merchant) => {
          setSelectedMerchant(merchant);
          setShowModal(true);
        }}
      />
    ),
  }));

  const totalPages = Math.ceil(tableDataWithActions.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return tableDataWithActions.slice(start, end);
  }, [tableDataWithActions, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredMerchantData.length, itemsPerPage]);

  const handleClearAll = () => {
    setTxnSearch("");
    setStatusFilter("all");
    setStartDate(null);
    setEndDate(null);
    setFilterMerchant(null);
  };

  return (
    <div className="p-4 space-y-4">
      <div
        className="rounded-lg flex justify-between items-center p-4 shadow-md"
        style={{  background:"var(--bg-gradient)" }}
      >
        <h4 className="font-bold text-white text-xl">Member List</h4>

        <div className="flex items-center space-x-2">
          <span className="font-bold text-white">All Payin ON/OFF</span>
          <Toggle
            key={merchantData.map((m) => m.payin).join("")}
            defaultChecked={
              merchantData.length > 0 &&
              merchantData.every((item) => item.account && item.payin)
            }
            onChange={handleAllPayinToggle}
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-bold text-white">All Payout ON/OFF</span>
          <Toggle
            key={merchantData.map((m) => m.payout).join("")}
            defaultChecked={
              merchantData.length > 0 &&
              merchantData.every((item) => item.account && item.payout)
            }
            onChange={handleAllPayoutToggle}
          />
        </div>

        <Button
          onClick={() => navigate("/member-create")}
          className="bg-white border border-sky-200 text-sky-800 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-sky-50 hover:border-sky-300 transition-all duration-200"
        >
          + Create New
        </Button>
      </div>

      {!initialLoad && (
        <TableFilters
          rawData={merchantData}
          txnSearch={txnSearch}
          showSearch={false}
          setTxnSearch={setTxnSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          selectedMerchant={filterMerchant}
          setSelectedMerchant={setFilterMerchant}
          statusList={["active", "inactive"]}
          showExport={false}
          showStatusFilter={false}
          showDateFilter={false}
          showSelectUserFilter={false}
          onExportCSV={exportMembersCSV}
          onClearAll={handleClearAll}
          totalSuccessAmount={0}
        />
      )}

      {initialLoad ? (
        <TableSkeleton />
      ) : (
        <Table
          columns={memberColumns}
          data={paginatedData}
          className="shadow-lg rounded-lg overflow-hidden border border-gray-200"
          rowClassName={(rowIndex) =>
            rowIndex % 2 === 0
              ? "bg-white hover:bg-blue-50"
              : "bg-gray-50 hover:bg-blue-50"
          }
          endPoint="/delete-merchant"
          setData={setMerchantData}
          showStatusFilter={false}
          showDateFilter={false}
          showExport={false}
          showPagination={false}
          showSearch={false}
          showSelectUserFilter={false}
        />
      )}

      {tableDataWithActions.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={150}>150</option>
            </select>
            <span className="text-sm font-medium">entries</span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Prev
              </button>

              <span className="text-sm font-semibold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      <SchemeModal
        showModal={showModal}
        handleModal={() => setShowModal(!showModal)}
        merchant={selectedMerchant}
        refreshTable={refetchOfMerchants}
      />

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        merchant={selectedMerchant}
        defaultMode="load"
        onSuccess={refetchOfMerchants}
      />

      <PayinSettlementModal
        isOpen={showPayinModal}
        onClose={() => setShowPayinModal(false)}
        merchant={selectedMerchant}
        onSuccess={refetchOfMerchants}
      />
    </div>
  );
};