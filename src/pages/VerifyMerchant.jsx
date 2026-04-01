import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGet } from '../hooks/useGet';
import Button from '../components/Button';
import { SchemeModal } from "../components/SchemeModal";
import { BankModal } from "../components/BankModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { usePost } from '../hooks/usePost';
import { useToast } from '../contexts/ToastContext';


export const VerifyMerchant = () => {
    const [errors, setErrors] = useState();
    const [showSchemeModal, setShowSchemeModal] = useState(false);
    const [showPayinModal, setShowPayinModal] = useState(false);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [activeTab, setActiveTab] = useState("payin");
    const [airpayMids, setAirpayMids] = useState([]);
    const toast = useToast();
  const { id } = useParams();
  // console.log("Merchant ID:", id);

  const navigate = useNavigate();

  const { data: response, loading, error } = useGet(
    id ? `/show-merchant/${id}` : null
  );
  // console.log("merchant response",response);
    const { execute: updateMerchant } = usePost("/update-merchant-scheme");
// Payin Banks (for "Payin at Onboard")
const { data: payinBanks, refetch: refetchPayin } = useGet(
  "/payinbanks-List?status=1"
);

// Payout Banks (for "Payout at Onboard")
const { data: payoutBanks, refetch: refetchPayout } = useGet(
  "/payoutbanks-List?status=1"
);

// Schemes (for "Scheme" dropdown)
const { data: schemes, refetch: refetchScheme } = useGet("/get-scheme");

// Airpay Credentials (MID) – only fetched when Payin = "Airpay"
const {
  data: midCredentials,
  refetch: refetchCredentials,
  isLoading,
} = useGet("/credentials");

const [memberFormData, setMemberFormData] = useState({
  // ... other fields
  id:id,
  payin_at_onboard: "",
  payout_at_onboard: "",
  scheme_id: "",
  credentials_id: "", // This is for Airpay MID selection (added dynamically)
});

useEffect(() => {
  if (memberFormData.payin_at_onboard !== "Airpay") return;
  if (isLoading) return;
  const credentialsData = midCredentials?.data || [];
  if (credentialsData.length > 0) {
    setAirpayMids(credentialsData);
  } else {
    setAirpayMids([]);
  }
}, [memberFormData.payin_at_onboard, midCredentials, isLoading]);

// Trigger refetch when Airpay is selected
const handleChange = (e) => {
  const { name, value } = e.target;
  const newValue = name === "credentials_id" ? parseInt(value, 10) || "" : value;

  if (name === "payin_at_onboard" && value === "Airpay") {
    refetchCredentials(); // Fetch available Airpay MIDs
  }

  setMemberFormData((prev) => ({
    ...prev,
    [name]: newValue,
  }));
};

  const handleSchemeModal = () => {
    setShowSchemeModal(!showSchemeModal);
  };

  const handlePayoutModal = () => {
    setShowPayoutModal(!showPayoutModal);
    setActiveTab("payout");
  };

  const handlePayinModal = () => {
    setShowPayinModal(!showPayinModal);
    setActiveTab("payin");
  };

  const filteredCredentials = midCredentials?.data?.filter(
  (cred) => cred.bank_id === Number(memberFormData.payin_at_onboard)
);

const handleApproveOnboard = async () => {
  try {
    setErrors(null);

    // frontend validation
    if (!memberFormData.payin_at_onboard) {
      return setErrors({ payin_at_onboard: "Required" });
    }
    if (!memberFormData.payout_at_onboard) {
      return setErrors({ payout_at_onboard: "Required" });
    }
    if (!memberFormData.scheme_id) {
      return setErrors({ scheme_id: "Required" });
    }
    // if (
    //   memberFormData.payin_at_onboard === "Airpay" &&
    //   !memberFormData.credentials_id
    // ) {
    //   return setErrors({ credentials_id: "Airpay MID is required" });
    // }
    if (!memberFormData.payin_at_onboard) return;


    const payload = {
      id: memberFormData.id,
      scheme_id: memberFormData.scheme_id,
      credentials_id: memberFormData.credentials_id || null,
      payin_at_onboard: memberFormData.payin_at_onboard,
      payout_at_onboard: memberFormData.payout_at_onboard,
    };

    await updateMerchant(payload);

    toast.success("Merchant onboarded successfully");

    navigate(-1);

  } catch (err) {
    console.error("Approve error:", err);

    const apiMessage =
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong";

    toast.error(apiMessage);
  }
};
const handleReject = async () => {
  try {
    setErrors(null);

    await updateMerchant({id:memberFormData.id,kyc_rejected:true});

    toast.success("KYC Rejected Successfully");

    navigate(-1);

  } catch (err) {
    console.error("Reject error:", err);

    const apiMessage =
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong";

    toast.error(apiMessage);
  }
};


  const merchant = response?.data;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading merchant details...</div>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-lg text-red-600">Failed to load merchant details</div>
      </div>
    );
  }

const DocumentPreview = ({ label, filePath }) => {
  if (!filePath)
    return <span className="text-gray-400 text-sm">Not uploaded</span>;

  const BASE_URL = "https://uatfintech.spay.live";

  // 🚀 FIX: convert server path → public URL
  const normalizePath = (path) => {
    // remove server root till /storage
    const storageIndex = path.indexOf("/storage/");
    if (storageIndex !== -1) {
      return BASE_URL + path.substring(storageIndex);
    }
    return path.startsWith("http") ? path : `${BASE_URL}/${path}`;
  };

  const fullUrl = normalizePath(filePath);

  const isImage = /\.(jpg|jpeg|png)$/i.test(fullUrl);
  const isVideo = fullUrl.includes("videokyc");

  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>

      {isImage && (
        <a href={fullUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={fullUrl}
            alt={label}
            className="w-full max-w-sm rounded-md shadow hover:shadow-md transition"
          />
        </a>
      )}

      {isVideo && (
        <video controls className="w-full max-w-xl rounded-md shadow mt-2">
          <source src={fullUrl} type="video/mp4" />
        </video>
      )}

      {!isImage && !isVideo && (
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          View / Download File
        </a>
      )}
    </div>
  );
};


  return (
    <div className="w-full py-6 px-4"
    // style={{ background: "linear-gradient(275deg, #7993bdff, #a2b8f5ff)" }}
    >
      <div className=" mx-auto">
        {/* Header */}
        <div className="rounded-t-xl shadow-xl/30 p-5 flex justify-between items-center"
        style={{  background:"var(--bg-gradient)" }}>
          <div>
            <h1 className="text-2xl font-bold text-[#e5e7eb]">
              Verify Merchant
              {/* <span className="text-[#e5e7eb] text-xl">{merchant.name}</span> */}
            </h1>
            {/* <p className="text-sm text-white mt-1">
              ID: {merchant.id} • Email: {merchant.email}
            </p> */}
          </div>
            {/* <Button
              onClick={() => navigate(-1)}
              className="px-5 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ← Back
            </Button> */}
        </div>

        {/* Main Content */}
        <div className="bg-[#ecf3ff] rounded-b-xl shadow-md p-6">
          {/* Basic Info */}
          <h2 className="text-lg font-semibold mb-4 text-[#1d3a96] ">Basic Information</h2>
          <div className="grid  p-7 bg-white grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8 text-sm">
            <div>
              <p className="text-gray-500">Business Name</p>
              <p className="font-medium">{merchant.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{merchant.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Mobile</p>
              <p className="font-medium">{merchant.mobile_no}</p>
            </div>
            <div>
              <p className="text-gray-500">Website</p>
              <p className="font-medium break-all">
                {merchant.website_url || <span className="text-gray-400">Not provided</span>}
              </p>
            </div>
            <div>
              <p className="text-gray-500">MCC</p>
              <p className="font-medium">{merchant.business_mcc || "N/A"}</p>
            </div>
            <div className="lg:col-span-3">
              <p className="text-gray-500">Address</p>
              <p className="font-medium">
                {merchant.address}, {merchant.city}, {merchant.district}, {merchant.state} - {merchant.pin_code}
              </p>
            </div>
          </div>

          {/* Company & Bank */}
          <h2 className="text-lg font-semibold text-[#1d3a96]  mb-4">Company & Bank Details</h2>
          <div className="grid  p-7 bg-white grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8 text-sm">
            <div>
              <p className="text-gray-500">Company PAN</p>
              <p className="font-medium">{merchant.company_pan_no}</p>
            </div>
            <div>
              <p className="text-gray-500">GST Number</p>
              <p className="font-medium">{merchant.company_gst_no || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-500">CIN/LLPIN</p>
              <p className="font-medium">{merchant.cin_llpin}</p>
            </div>
            <div>
              <p className="text-gray-500">Company Type</p>
              <p className="font-medium capitalize">{merchant.company_type}</p>
            </div>
            <div>
              <p className="text-gray-500">Incorporation Date</p>
              <p className="font-medium">
                {new Date(merchant.date_of_incorporation).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Account Holder</p>
              <p className="font-medium">{merchant.account_holder_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Bank A/c No</p>
              <p className="font-medium">{merchant.bank_account_no}</p>
            </div>
            <div>
              <p className="text-gray-500">IFSC Code</p>
              <p className="font-medium">{merchant.ifsc_code}</p>
            </div>
          </div>

          {/* Documents */}
          <h2 className="text-lg font-semibold text-[#1d3a96]  mb-4">Uploaded Documents</h2>
          <div className="grid  p-7 bg-white grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <DocumentPreview label="Company PAN" filePath={merchant.company_pan_no_doc} />
            <DocumentPreview label="GST Document" filePath={merchant.company_gst_no_doc} />
            <DocumentPreview label="Cancelled Cheque" filePath={merchant.cancel_cheque_doc} />
          </div>

          {/* Video KYC */}
          <h2 className="text-lg font-semibold text-[#1d3a96] mb-4">Video KYC</h2>
          <div className="mb-8  p-7 bg-white">
            <DocumentPreview label="Video Recording" filePath={merchant.video_kyc} />
          </div>

          {/* Directors */}
          {merchant.director_info && merchant.director_info.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Directors ({merchant.director_info.length})
              </h2>
              {merchant.director_info.map((director, index) => (
                <div key={index} className="rounded-lg p-5 mb-5  text-sm">
                  <h3 className="font-semibold text-gray-800 mb-3">Director {index + 1}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium">{director.director_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">PAN</p>
                      <p className="font-medium">{director.director_pan_no}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Aadhaar</p>
                      <p className="font-medium">{director.director_aadhar_no}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Gender</p>
                      <p className="font-medium capitalize">{director.director_gender}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date of Birth</p>
                      <p className="font-medium">
                        {new Date(director.director_dob).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DocumentPreview label="PAN Document" filePath={director.user_pan_doc} />
                    <DocumentPreview label="Aadhaar Document" filePath={director.user_addhar_doc} />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Actions */}
       
   

<div>
                <h2 className="text-lg font-semibold text-[#1d3a96]  mb-4">
                Add Scheme and Bank
              </h2>
<div className="grid  p-7 bg-white gap-6 mb-6 md:grid-cols-2 p-5">
    {/* ==================== Payin at Onboard ==================== */}

    <div className="flex items-center gap-4 mb-4">
      <div className="relative flex-1">
        <label
          htmlFor="payin_at_onboard"
          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-blue-600 ${
            errors?.payin_at_onboard ? "text-red-600 peer-focus:text-red-600" : ""
          }`}
        >
          Payin at Onboard <span className="text-red-600">*</span>
        </label>

        <select
          id="payin_at_onboard"
          name="payin_at_onboard"
          className={`bg-gray-50 border text-gray-900 text-sm rounded-lg w-full p-2.5 ${
            errors?.payin_at_onboard ? "border-red-500" : "border-gray-300"
          }`}
          value={memberFormData.payin_at_onboard}
          onChange={handleChange}
        >
          <option value="">Select Bank</option>
          {/* {payinBanks?.data?.data?.map((item) => (
            <option key={item.id} value={item.onboard_payin_bank}>
              {item.onboard_payin_bank}
            </option>
          ))} */}
          {payinBanks?.data?.data?.map((bank) => (
  <option key={bank.id} value={bank.id}>
    {bank.onboard_payin_bank}
  </option>
))}
        </select>

        {errors?.payin_at_onboard && (
          <span className="text-sm text-red-500">
            {errors.payin_at_onboard}
          </span>
        )}
      </div>

      {/* + Button to open Payin Bank Modal */}
      <Button
        type="button"
        onClick={handlePayinModal}
        className="text-white bg-blue-500 hover:bg-blue-800 rounded-full w-10 h-10 flex items-center justify-center text-lg font-medium"
      >
        +
      </Button>
    </div>

    {/* ==================== Airpay MID (Conditional) ==================== */}
    {/* {memberFormData.payin_at_onboard === "Airpay" && ( */}
    {filteredCredentials?.length > 0 && (
      <div className="flex items-center gap-4 mb-4 md:col-span-2">
        <div className="relative flex-1">
          <label
            htmlFor="credentials_id"
            className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-blue-600"
          >
            Airpay MID <span className="text-red-600">*</span>
          </label>

          {/* <select
            id="credentials_id"
            name="credentials_id"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
            value={memberFormData.credentials_id || ""}
            onChange={handleChange}
          >
            <option value="">Select Airpay MID</option>
            {airpayMids.map((mid) => (
              <option key={mid.id} value={mid.id}>
                {mid.name}
              </option>
            ))}
          </select> */}

          <select
  id="credentials_id"
  name="credentials_id"
  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
  value={memberFormData.credentials_id || ""}
  onChange={handleChange}
>
  <option value="">Select Credential</option>

  {filteredCredentials.map((cred) => (
    <option key={cred.id} value={cred.id}>
      {cred.name}
    </option>
  ))}
</select>
        </div>
      </div>
    )}

    {/* ==================== Payout at Onboard ==================== */}
    <div className="flex items-center gap-4 mb-4">
      <div className="relative flex-1">
        <label
          htmlFor="payout_at_onboard"
          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-blue-600 ${
            errors?.payout_at_onboard ? "text-red-600 peer-focus:text-red-600" : ""
          }`}
        >
          Payout at Onboard <span className="text-red-600">*</span>
        </label>

        <select
          id="payout_at_onboard"
          name="payout_at_onboard"
          className={`bg-gray-50 border text-gray-900 text-sm rounded-lg w-full p-2.5 ${
            errors?.payout_at_onboard ? "border-red-500" : "border-gray-300"
          }`}
          value={memberFormData.payout_at_onboard}
          onChange={handleChange}
        >
          <option value="">Select Bank</option>
          {payoutBanks?.data?.data?.map((item) => (
            <option key={item.id} value={item.onboard_payout_bank}>
              {item.onboard_payout_bank}
            </option>
          ))}
        </select>

        {errors?.payout_at_onboard && (
          <span className="text-sm text-red-500">
            {errors.payout_at_onboard}
          </span>
        )}
      </div>

      {/* + Button to open Payout Bank Modal */}
      <Button
        type="button"
        onClick={handlePayoutModal}
        className="text-white bg-blue-500 hover:bg-blue-800 rounded-full w-10 h-10 flex items-center justify-center text-lg font-medium"
      >
        +
      </Button>
    </div>

    {/* ==================== Scheme ==================== */}
    <div className="flex items-center gap-4 mb-4">
      <div className="relative flex-1">
        <label
          htmlFor="scheme_id"
          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-blue-600 ${
            errors?.scheme_id ? "text-red-600 peer-focus:text-red-600" : ""
          }`}
        >
          Scheme <span className="text-red-600">*</span>
        </label>

        <select
          id="scheme_id"
          name="scheme_id"
          className={`bg-gray-50 border text-gray-900 text-sm rounded-lg w-full p-2.5 ${
            errors?.scheme_id ? "border-red-500" : "border-gray-300"
          }`}
          value={memberFormData.scheme_id}
          onChange={handleChange}
        >
          <option value="">Select Scheme</option>
          {schemes?.data?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        {errors?.scheme_id && (
          <span className="text-sm text-red-500">
            {errors.scheme_id}
          </span>
        )}
      </div>

      {/* + Button to open Scheme Modal */}
      <Button
        type="button"
        onClick={handleSchemeModal}
        className="text-white bg-blue-500 hover:bg-blue-800 rounded-full w-10 h-10 flex items-center justify-center text-lg font-medium"
      >
        +
      </Button>
    </div>
  </div></div>
            <div className="mt-10 pt-6 border-t flex justify-end gap-3">
            <Button className="px-6 py-2.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={handleReject}
              >
              Reject Application
            </Button>
          <Button
            type="button"
            onClick={handleApproveOnboard}
            disabled={loading}
            className="px-6 py-2.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            {loading ? "Processing..." : "Approve & Onboard"}
          </Button>

          </div>
  <SchemeModal
  showModal={showSchemeModal}
  handleModal={handleSchemeModal}
  refreshTable={refetchScheme}  // Refreshes scheme list after adding new
/>

<BankModal
  showModal={showPayinModal || showPayoutModal}
  handleModal={activeTab === "payin" ? handlePayinModal : handlePayoutModal}
  activeTab={activeTab}
  refreshTable={activeTab === "payin" ? refetchPayin : refetchPayout}
/>
   </div>
    </div>
     </div>
  );
};