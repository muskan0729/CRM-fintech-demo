import React, { useEffect, useState } from "react";
import { Stepper } from "../components/Stepper";
import Button from "../components/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { ConfirmModal } from "../components/ConfirmModal";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";
import paymentGatewayBg from "../images/login-background.jpg";

export const Kyc = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [gstLoading, setGstLoading] = useState(false);
  const [gstVerified, setGstVerified] = useState(false);
  const [gstCompanyName, setGstCompanyName] = useState("");
  const [gstAddressLocked, setGstAddressLocked] = useState(false);

  const [directorVerifyLoading, setDirectorVerifyLoading] = useState({});
  const [directorVerifyStatus, setDirectorVerifyStatus] = useState({});
  const [directorVerifyError, setDirectorVerifyError] = useState({});
  const [directorRequestIds, setDirectorRequestIds] = useState({});
  const [directorFetchLoading, setDirectorFetchLoading] = useState({});
  const [directorFetchedDocs, setDirectorFetchedDocs] = useState({});

  const [vkycLoading, setVkycLoading] = useState(false);

  const [memberFormData, setMemberFormData] = useState({
    id: "",
    name: "",
    mobile_no: "",
    email: "",
    business_mcc: "",
    city: "",
    district: "",
    state: "",
    pin_code: "",
    address: "",
    company_pan_no: "",
    company_gst_no: "",
    cin_llpin: "",
    account_holder_name: "",
    bank_account_no: "",
    ifsc_code: "",
    website_url: "",
    company_type: "",
    company_name: "",
    date_of_incorporation: "",
    cancel_cheque_doc: null,
    company_pan_no_doc: null,
    company_gst_no_doc: null,
    director_info: [
      {
        director_name: "",
        director_pan_no: "",
        director_aadhar_no: "",
        director_gender: "",
        director_dob: "",
        user_pan_doc: null,
        user_addhar_doc: null,
      },
    ],
    video_kyc: null,
    vkyc_session_id: "",
    vkyc_link: "",
    vkyc_purpose: "",
    payin_at_onboard: "",
    payout_at_onboard: "",
    scheme_id: "",
  });

  const { execute: executeMember } = usePost("/kyc-merchant");

  useEffect(() => {
    const saved = localStorage.getItem("kycFormData");
    const merchant =
      location.state?.merchant || JSON.parse(localStorage.getItem("user"));

    if (merchant?.id) {
      setMemberFormData((prev) => ({
        ...prev,
        id: merchant.id,
        name: merchant.name || "",
        email: merchant.email || "",
        mobile_no: merchant.mobile_no || "",
      }));
      return;
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMemberFormData((prev) => ({
          ...prev,
          ...parsed,
        }));
      } catch (e) {
        console.error("Invalid localStorage data");
      }
    }
  }, [location.state]);

  useEffect(() => {
    const savedRequestIds = localStorage.getItem("directorRequestIds");
    const savedFetchedDocs = localStorage.getItem("directorFetchedDocs");

    if (savedRequestIds) {
      try {
        setDirectorRequestIds(JSON.parse(savedRequestIds));
      } catch (e) {
        console.error("Invalid directorRequestIds");
      }
    }

    if (savedFetchedDocs) {
      try {
        setDirectorFetchedDocs(JSON.parse(savedFetchedDocs));
      } catch (e) {
        console.error("Invalid directorFetchedDocs");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("directorRequestIds", JSON.stringify(directorRequestIds));
  }, [directorRequestIds]);

  useEffect(() => {
    localStorage.setItem("directorFetchedDocs", JSON.stringify(directorFetchedDocs));
  }, [directorFetchedDocs]);

  useEffect(() => {
    if (!memberFormData.id) return;

    const savable = { ...memberFormData };
    delete savable.video_kyc;
    delete savable.company_pan_no_doc;
    delete savable.company_gst_no_doc;
    delete savable.cancel_cheque_doc;

    savable.director_info = savable.director_info.map((d) => ({
      director_name: d.director_name,
      director_pan_no: d.director_pan_no,
      director_aadhar_no: d.director_aadhar_no,
      director_gender: d.director_gender,
      director_dob: d.director_dob,
    }));

    localStorage.setItem("kycFormData", JSON.stringify(savable));
  }, [memberFormData]);

  const stepRequiredFields = {
    1: [
      "name",
      "mobile_no",
      "email",
      "company_gst_no",
      "company_gst_no_doc",
      "address",
      "city",
      "state",
      "district",
      "pin_code",
    ],
    2: [
      "business_mcc",
      "website_url",
      "company_pan_no",
      "company_pan_no_doc",
      "cin_llpin",
      "company_type",
      "cancel_cheque_doc",
    ],
    3: [
      "director_name",
      "director_gender",
      "director_dob",
      "director_pan_no",
      "director_aadhar_no",
    ],
    4: ["vkyc_session_id"],
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const nameRegex = /^[A-Za-z ]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const numberRegex = /^[0-9]{4}$/;
  const pinnumberRegex = /^[0-9]{6}$/;
  const aadharRegex = /^[0-9Xx]{8,12}$/;
  const gstRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const websiteRegex =
    /^(https?:\/\/)(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/;
  const cinRegex = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;

  const validationRules = {
    name: {
      required: true,
      pattern: nameRegex,
      message: "Name is not valid",
    },
    email: {
      required: true,
      pattern: emailRegex,
      message: "Email is not valid",
    },
    business_mcc: {
      required: true,
      pattern: numberRegex,
      message: "Business MCC must be 4 digits",
    },
    city: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z ]+$/,
      message: "Valid city name required",
    },
    state: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z ]+$/,
      message: "Valid state name required",
    },
    district: {
      required: true,
      minLength: 2,
      pattern: /^[A-Za-z ]+$/,
      message: "Valid district name required",
    },
    address: {
      required: true,
      minLength: 10,
      message: "Address must be at least 10 characters",
    },
    pin_code: {
      required: true,
      pattern: pinnumberRegex,
      message: "Pin code must be 6 digits",
    },
    website_url: {
      required: true,
      pattern: websiteRegex,
      message: "Website URL must be like https://example.com",
    },
    cin_llpin: {
      required: true,
      pattern: cinRegex,
      message: "CIN is not valid (e.g. L12345MH2010PLC123456)",
    },
    company_pan_no: {
      required: true,
      pattern: panRegex,
      message: "Company PAN is not valid (e.g. ABCDE1234F)",
    },
    company_gst_no: {
      required: true,
      pattern: gstRegex,
      message: "GST is not valid (e.g. 27AAAPZ1234C1Z1)",
    },
    director_name: {
      required: true,
      pattern: nameRegex,
      message: "Director name is not valid",
    },
    director_pan_no: {
      required: true,
      pattern: panRegex,
      message: "Director PAN is not valid (e.g. ABCDE1234F)",
    },
    director_aadhar_no: {
      required: true,
      pattern: aadharRegex,
      message: "Aadhaar is not valid",
    },
    company_type: {
      required: true,
      message: "Please select company type",
    },
    director_gender: {
      required: true,
      message: "Please select gender",
    },
    director_dob: {
      required: true,
      message: "Date of birth is required",
    },
    vkyc_session_id: {
      required: true,
      message: "Please generate Video KYC link first",
    },
    company_pan_no_doc: {
      required: true,
      message: "Company PAN document is required",
    },
    company_gst_no_doc: {
      required: true,
      message: "GST document is required",
    },
    cancel_cheque_doc: {
      required: true,
      message: "Cancel cheque document is required",
    },
  };

  const validateStep = () => {
    const requiredFields = stepRequiredFields[currentStep];
    const newErrors = {};

    const validateValue = (value, field) => {
      const rules = validationRules[field];

      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        return rules?.message || "This field is required";
      }

      if (rules?.pattern && typeof value === "string") {
        if (!rules.pattern.test(value.trim())) {
          return rules.message || "Invalid format";
        }
      }

      return null;
    };

    if (currentStep === 3) {
      memberFormData.director_info.forEach((director, idx) => {
        const hasFetchedPan = !!directorFetchedDocs?.[idx]?.pan;
        const hasFetchedAadhaar = !!directorFetchedDocs?.[idx]?.aadhaar;

        if (!hasFetchedPan || !hasFetchedAadhaar) {
          if (!newErrors.director) newErrors.director = [];
          newErrors.director[idx] = {
            ...newErrors.director[idx],
            fetch_documents: "Please complete DigiLocker and click Fetch Documents",
          };
        }

        requiredFields.forEach((field) => {
          const error = validateValue(director[field], field);
          if (error) {
            if (!newErrors.director) newErrors.director = [];
            newErrors.director[idx] = {
              ...newErrors.director[idx],
              [field]: error,
            };
          }
        });
      });
    } else {
      requiredFields.forEach((field) => {
        const value = memberFormData[field];
        const error = validateValue(value, field);
        if (error) {
          newErrors[field] = error;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const extractPincode = (text = "") => {
    const match = String(text).match(/\b\d{6}\b/);
    return match ? match[0] : "";
  };

  const extractStateDistrictFromJurisdiction = (text = "") => {
    const value = String(text || "");
    const stateMatch = value.match(/State\s*-\s*([^,]+)/i);
    const districtMatch = value.match(/District\s*-\s*([^,]+)/i);

    return {
      state: stateMatch?.[1]?.trim() || "",
      district: districtMatch?.[1]?.trim() || "",
    };
  };

  const splitAddressParts = (rawAddress = "") => {
    const cleaned = String(rawAddress || "").replace(/\s+/g, " ").trim();

    if (!cleaned) {
      return {
        fullAddress: "",
        address: "",
        city: "",
        district: "",
        state: "",
        pin_code: "",
      };
    }

    const pin = extractPincode(cleaned);

    let addressWithoutPin = cleaned.replace(pin, "").trim();
    addressWithoutPin = addressWithoutPin.replace(/,\s*$/, "").trim();

    const parts = addressWithoutPin
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    let state = "";
    let district = "";
    let city = "";
    let address = "";

    if (parts.length >= 4) {
      state = parts[parts.length - 1] || "";

      const localityBlock = parts[parts.length - 2] || "";
      const localityWords = localityBlock.split(" ").filter(Boolean);

      if (localityWords.length >= 2) {
        district = localityWords[localityWords.length - 1] || "";
        city = localityWords.slice(0, -1).join(" ").trim();
      } else {
        district = localityBlock || "";
        city = parts[parts.length - 3] || "";
      }

      address = parts.slice(0, parts.length - 2).join(", ").trim();
    } else if (parts.length === 3) {
      state = parts[2] || "";
      district = parts[1] || "";
      city = parts[1] || "";
      address = parts[0] || "";
    } else if (parts.length === 2) {
      state = parts[1] || "";
      district = parts[0] || "";
      city = parts[0] || "";
      address = parts[0] || "";
    } else {
      address = cleaned;
    }

    return {
      fullAddress: cleaned,
      address: address || cleaned,
      city: city || "",
      district: district || "",
      state: state || "",
      pin_code: pin || "",
    };
  };

  const getGstResultNode = (data) => {
    return (
      data?.api_response?.response?.result ||
      data?.api_response?.result ||
      data?.response?.result ||
      data?.result ||
      data?.data?.result ||
      data?.data ||
      {}
    );
  };

  const formatAadhaarAddress = (address = {}) => {
    return [
      address?.house,
      address?.street,
      address?.loc,
      address?.vtc,
      address?.po,
      address?.subdist,
      address?.dist,
      address?.state,
      address?.pc,
      address?.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const formatToInputDate = (value = "") => {
    if (!value) return "";
    const str = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
      const [dd, mm, yyyy] = str.split("-");
      return `${yyyy}-${mm}-${dd}`;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      const [mm, dd, yyyy] = str.split("/");
      return `${yyyy}-${mm}-${dd}`;
    }

    return "";
  };

  const normalizeGender = (value = "") => {
    const gender = String(value || "").toUpperCase();
    if (gender === "M" || gender === "MALE") return "male";
    if (gender === "F" || gender === "FEMALE") return "female";
    return "other";
  };

  const verifyGST = async (gstNumber) => {
    const gst = String(gstNumber || "")
      .toUpperCase()
      .replace(/\s/g, "")
      .trim();

    setGstVerified(false);
    setGstCompanyName("");
    setGstAddressLocked(false);

    if (!gstRegex.test(gst)) {
      setErrors((prev) => ({
        ...(prev || {}),
        company_gst_no: "GST is not valid (e.g. 27AAAPZ1234C1Z1)",
      }));
      return;
    }

    setErrors((prev) => ({ ...(prev || {}), company_gst_no: "" }));

    try {
      setGstLoading(true);

      const res = await fetch(
        "https://uatfintech.spay.live/api/gst/advance-verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_gstin_number: gst,
            financial_year: "2023-24",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrors((prev) => ({
          ...(prev || {}),
          company_gst_no: data?.message || "GST verification failed",
        }));
        return;
      }

      const resultNode = getGstResultNode(data);

      const legalName =
        resultNode?.legal_name ||
        resultNode?.trade_name ||
        resultNode?.business_name ||
        "";

      const rawAddress =
        resultNode?.primary_business_address?.registered_address ||
        resultNode?.primary_business_address?.detailed_address ||
        resultNode?.registered_address ||
        resultNode?.principal_place_address ||
        resultNode?.principal_address ||
        resultNode?.address ||
        resultNode?.trade_address ||
        resultNode?.business_address ||
        resultNode?.principalPlaceOfBusiness ||
        "";

      const jurisdictionData = extractStateDistrictFromJurisdiction(
        resultNode?.state_jurisdiction || ""
      );

      const parsedAddress = splitAddressParts(rawAddress);

      const cityFromApi =
        resultNode?.city ||
        resultNode?.primary_business_address?.city ||
        parsedAddress.city ||
        "";

      const districtFromApi =
        resultNode?.district ||
        jurisdictionData?.district ||
        resultNode?.primary_business_address?.district ||
        parsedAddress.district ||
        "";

      const stateFromApi =
        resultNode?.state ||
        jurisdictionData?.state ||
        resultNode?.primary_business_address?.state ||
        parsedAddress.state ||
        "";

      const pinFromApi =
        resultNode?.pincode ||
        resultNode?.pin_code ||
        resultNode?.primary_business_address?.pincode ||
        resultNode?.primary_business_address?.pin_code ||
        parsedAddress.pin_code ||
        extractPincode(rawAddress);

      setGstVerified(true);
      setGstCompanyName(String(legalName || "").trim());

      setMemberFormData((prev) => ({
        ...prev,
        company_gst_no: gst,
        company_name: String(legalName || "").trim() || prev.company_name,
        address: parsedAddress.address || rawAddress || prev.address,
        city: cityFromApi || prev.city,
        district: districtFromApi || prev.district,
        state: stateFromApi || prev.state,
        pin_code: pinFromApi || prev.pin_code,
      }));

      setGstAddressLocked(true);
      toast.success("GST Verified and address fetched ✅");
    } catch (err) {
      setErrors((prev) => ({
        ...(prev || {}),
        company_gst_no: "Network error / server issue",
      }));
    } finally {
      setGstLoading(false);
    }
  };

  const verifyDirectorDigilocker = async (index) => {
    setDirectorVerifyLoading((prev) => ({ ...prev, [index]: true }));
    setDirectorVerifyStatus((prev) => ({ ...prev, [index]: "" }));
    setDirectorVerifyError((prev) => ({ ...prev, [index]: "" }));

    setDirectorFetchedDocs((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });

    try {
      const res = await fetch(
        "https://uatfintech.spay.live/api/digilocker/init-aadhaar-pan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          "DigiLocker verification failed";
        setDirectorVerifyError((prev) => ({ ...prev, [index]: msg }));
        return;
      }

      const sdkUrl =
        data?.data?.sdk_url || data?.api?.data?.sdk_url || "";

      const requestId =
        data?.data?.request_id || data?.api?.data?.request_id || "";

      const successMsg =
        data?.message ||
        data?.api?.message ||
        data?.status ||
        "DigiLocker verification initialized successfully";

      setDirectorVerifyStatus((prev) => ({
        ...prev,
        [index]: successMsg,
      }));

      if (requestId) {
        setDirectorRequestIds((prev) => ({
          ...prev,
          [index]: requestId,
        }));
      }

      if (sdkUrl) {
        toast.success(`Director ${index + 1} DigiLocker started ✅`);
        window.open(sdkUrl, "_blank", "noopener,noreferrer");
      } else {
        setDirectorVerifyError((prev) => ({
          ...prev,
          [index]: "SDK URL not found in API response",
        }));
      }
    } catch (error) {
      setDirectorVerifyError((prev) => ({
        ...prev,
        [index]: "Network error / server issue",
      }));
    } finally {
      setDirectorVerifyLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const fetchDirectorDocuments = async (index) => {
    const requestId = directorRequestIds[index];

    if (!requestId) {
      setDirectorVerifyError((prev) => ({
        ...prev,
        [index]: "Please click Verify PAN + Aadhaar first",
      }));
      return;
    }

    setDirectorFetchLoading((prev) => ({ ...prev, [index]: true }));
    setDirectorVerifyError((prev) => ({ ...prev, [index]: "" }));

    try {
      const res = await fetch(
        "https://uatfintech.spay.live/api/digilocker/fetch-documents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request_id: requestId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          "Failed to fetch DigiLocker documents";
        setDirectorVerifyError((prev) => ({ ...prev, [index]: msg }));
        return;
      }

      const docs = data?.data || {};
      const aadhaarInfo = docs?.aadhaar?.aadhaar_data?.personal_info || {};
      const panInfo = docs?.pan?.pancard_data || {};
      const uidMasked = docs?.aadhaar?.aadhaar_data?.uid || "";

      setDirectorFetchedDocs((prev) => ({
        ...prev,
        [index]: docs,
      }));

      setMemberFormData((prev) => {
        const updated = [...prev.director_info];

        updated[index] = {
          ...updated[index],
          director_name:
            aadhaarInfo?.name ||
            panInfo?.holder_name ||
            updated[index]?.director_name ||
            "",
          director_dob:
            formatToInputDate(aadhaarInfo?.dob) ||
            formatToInputDate(panInfo?.holder_dob) ||
            updated[index]?.director_dob ||
            "",
          director_gender:
            normalizeGender(aadhaarInfo?.gender) ||
            updated[index]?.director_gender ||
            "",
          director_pan_no:
            panInfo?.pan_number ||
            updated[index]?.director_pan_no ||
            "",
          director_aadhar_no:
            uidMasked || updated[index]?.director_aadhar_no || "",
        };

        return { ...prev, director_info: updated };
      });

      setErrors((prev) => {
        const updated = { ...prev };
        if (!updated.director) updated.director = [];
        updated.director[index] = {
          ...(updated.director?.[index] || {}),
          director_name: "",
          director_gender: "",
          director_dob: "",
          director_pan_no: "",
          director_aadhar_no: "",
          fetch_documents: "",
        };
        return updated;
      });

      setDirectorVerifyStatus((prev) => ({
        ...prev,
        [index]: data?.message || "Transaction Successful",
      }));

      toast.success(`Director ${index + 1} documents fetched ✅`);
    } catch (error) {
      setDirectorVerifyError((prev) => ({
        ...prev,
        [index]: "Network error while fetching documents",
      }));
    } finally {
      setDirectorFetchLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const createVkycSession = async () => {
    setVkycLoading(true);
    setErrors((prev) => ({ ...prev, vkyc_session_id: "" }));

    try {
      const res = await fetch("https://uatfintech.spay.live/api/vkyc/session", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
          body: JSON.stringify({
    user_id: memberFormData.id, // ✅ send real merchant id
  }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Failed to generate VKYC link");
        return;
      }

      const sessionId = data?.data?.session_id || "";
      const link = data?.data?.link || "";
      const purpose = data?.data?.purpose || "";
// console.log("Saved VKYC Session:", sessionId); 
      setMemberFormData((prev) => ({
        ...prev,
        vkyc_session_id: sessionId,
        vkyc_link: link,
        vkyc_purpose: purpose,
      }));

      toast.success(data?.message || "VKYC link generated");

      if (link) {
        window.open(link, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      toast.error("Network error while generating VKYC link");
    } finally {
      setVkycLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setMemberFormData((prev) => ({
      ...prev,
      [name]:
        name === "company_pan_no"
          ? value.toUpperCase()
          : name === "company_gst_no"
          ? value.toUpperCase().replace(/\s/g, "")
          : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const addDirector = () => {
    setMemberFormData((prev) => ({
      ...prev,
      director_info: [
        ...prev.director_info,
        {
          director_name: "",
          director_gender: "",
          director_pan_no: "",
          director_aadhar_no: "",
          user_pan_doc: null,
          user_addhar_doc: null,
          director_dob: "",
        },
      ],
    }));
  };

  const removeDirector = (index) => {
    setMemberFormData((prev) => ({
      ...prev,
      director_info: prev.director_info.filter((_, i) => i !== index),
    }));

    setDirectorVerifyLoading((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });

    setDirectorVerifyStatus((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });

    setDirectorVerifyError((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });

    setDirectorRequestIds((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });

    setDirectorFetchLoading((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });

    setDirectorFetchedDocs((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const handleCompanyFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];

    if (!file) {
      setMemberFormData((prev) => ({ ...prev, [name]: null }));
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error(`Only PDF files are allowed for ${name.replace(/_/g, " ")}`);
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      e.target.value = "";
      return;
    }

    setMemberFormData((prev) => ({
      ...prev,
      [name]: file,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
// console.log("Submitting VKYC Session:", memberFormData.vkyc_session_id);
    if (!validateStep()) return;

    try {
      const formData = new FormData();

      const merchantId = memberFormData.id;
      if (!merchantId) {
        toast.error("Merchant ID missing – cannot submit KYC");
        return;
      }

      formData.append("id", merchantId);

      Object.keys(memberFormData).forEach((key) => {
        if (
          ![
            "director_info",
            "company_pan_no_doc",
            "company_gst_no_doc",
            "cancel_cheque_doc",
            "video_kyc",
          ].includes(key)
        ) {
          formData.append(key, memberFormData[key] ?? "");
        }
      });
formData.append("vkyc_session_id", memberFormData.vkyc_session_id);
      ["company_pan_no_doc", "company_gst_no_doc", "cancel_cheque_doc"].forEach(
        (fileKey) => {
          if (memberFormData[fileKey] instanceof File) {
            formData.append(fileKey, memberFormData[fileKey]);
          }
        }
      );

      memberFormData.director_info.forEach((director, idx) => {
        Object.keys(director).forEach((field) => {
          const value = director[field];
          if (value instanceof File) {
            formData.append(`director_info[${idx}][${field}]`, value);
          } else {
            formData.append(`director_info[${idx}][${field}]`, value ?? "");
          }
        });
      });

      await executeMember(formData);
      toast.success("Form submitted successfully!");
      navigate("/member-list");
    } catch (err) {
      const backendErrors = err?.response?.data?.errors;
      const msg = backendErrors
        ? Object.values(backendErrors)[0][0]
        : err?.response?.data?.message || "Something went wrong";
      toast.error(msg);
    }
  };

  const stepHeadings = {
    1: {
      title: "Merchant Details",
      subtitle: "Basic business information",
    },
    2: {
      title: "Business & Company Details",
      subtitle: "Business and legal information",
    },
    3: {
      title: "Director Details",
      subtitle: "Director KYC information",
    },
    4: {
      title: "Video KYC",
      subtitle: "Video KYC information",
    },
  };

  return (
    <>
      <div
        className="min-h-screen w-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${paymentGatewayBg})` }}
      >
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-5xl">
            <div className="shadow-2xl overflow-hidden">
              <div className="w-full max-w-3xl mx-auto rounded-2xl bg-white p-8">
                <div className="relative mb-10">
                  <div
                    className="absolute inset-0 rounded-xl blur-md opacity-70"
                    style={{
                      background:
                        "linear-gradient(120deg, #2958da, #2F5BFF, #6A8CFF)",
                    }}
                  />

                  <div
                    className="relative rounded-xl px-6 py-4 flex items-center justify-between"
                    style={{
                      background:
                        "linear-gradient(275deg, #4b76eb, #1E40FF, #4F6FFF)",
                    }}
                  >
                    <h4 className="text-2xl md:text-2xl font-bold text-white tracking-wide ml-52">
                      Complete Your KYC
                    </h4>
                    <Stepper currentStep={currentStep} />
                  </div>
                </div>

                <div className="border-b pb-3 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mt-6 text-center">
                    {stepHeadings[currentStep].title}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  {currentStep === 1 && (
                    <div className="space-y-4 mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 tracking-wide ml-2">
                            Business Name <span className="text-red-600">*</span>
                          </label>
                          <input
                            name="name"
                            readOnly
                            value={memberFormData.name || ""}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                          />
                          {errors?.name && (
                            <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 tracking-wide ml-2">
                            Business Mobile <span className="text-red-600">*</span>
                          </label>
                          <input
                            name="mobile_no"
                            readOnly
                            value={memberFormData.mobile_no || ""}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                          />
                          {errors?.mobile_no && (
                            <p className="text-red-600 text-xs mt-1">
                              {errors.mobile_no}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 tracking-wide ml-2">
                            Business Email <span className="text-red-600">*</span>
                          </label>
                          <input
                            name="email"
                            readOnly
                            value={memberFormData.email || ""}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                          />
                          {errors?.email && (
                            <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                            GST Number <span className="text-red-600">*</span>
                          </label>
                          <input
                            name="company_gst_no"
                            value={memberFormData.company_gst_no || ""}
                            maxLength={15}
                            readOnly={gstVerified}
                            disabled={gstVerified}
                            onChange={(e) => {
                              const value = e.target.value
                                .toUpperCase()
                                .replace(/\s/g, "");

                              setMemberFormData((prev) => ({
                                ...prev,
                                company_gst_no: value,
                              }));

                              setErrors((prev) => ({
                                ...(prev || {}),
                                company_gst_no: "",
                              }));

                              setGstVerified(false);
                              setGstCompanyName("");
                              setGstAddressLocked(false);

                              if (value.length === 15) verifyGST(value);
                            }}
                            className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#375EF4] ${
                              gstVerified ? "bg-gray-100 cursor-not-allowed" : ""
                            }`}
                          />

                          {gstLoading && (
                            <p className="text-blue-600 text-xs mt-1">
                              Verifying GST...
                            </p>
                          )}

                          {gstVerified && !gstLoading && (
                            <div className="mt-2 p-2 rounded-lg bg-green-50 border border-green-200">
                              <p className="text-xs text-gray-600">
                                Company Name (as per GST):
                              </p>
                              <p className="text-sm font-semibold text-green-700">
                                {gstCompanyName || "Company name not returned by API"}
                              </p>
                            </div>
                          )}

                          {errors?.company_gst_no && (
                            <p className="text-red-600 text-xs mt-1">
                              {errors.company_gst_no}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 tracking-wide ml-2">
                            Address <span className="text-red-600">*</span>
                          </label>
                          <input
                            name="address"
                            value={memberFormData.address || ""}
                            onChange={handleChange}
                            readOnly={gstAddressLocked}
                            className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#375EF4] ${
                              gstAddressLocked
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                            }`}
                          />
                          {errors?.address && (
                            <p className="text-red-600 text-xs mt-1">
                              {errors.address}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 tracking-wide ml-2">
                            City <span className="text-red-600">*</span>
                          </label>
                          <input
                            name="city"
                            value={memberFormData.city || ""}
                            onChange={handleChange}
                            readOnly={gstAddressLocked}
                            className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#375EF4] ${
                              gstAddressLocked
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                            }`}
                          />
                          {errors?.city && (
                            <p className="text-red-600 text-xs mt-1">{errors.city}</p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 tracking-wide ml-2">
                            State <span className="text-red-600">*</span>
                          </label>
                          <input
                            name="state"
                            value={memberFormData.state || ""}
                            onChange={handleChange}
                            readOnly={gstAddressLocked}
                            className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#375EF4] ${
                              gstAddressLocked
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                            }`}
                          />
                          {errors?.state && (
                            <p className="text-red-600 text-xs mt-1">{errors.state}</p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 tracking-wide ml-2">
                            District <span className="text-red-600">*</span>
                          </label>
                          <input
                            name="district"
                            value={memberFormData.district || ""}
                            onChange={handleChange}
                            readOnly={gstAddressLocked}
                            className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#375EF4] ${
                              gstAddressLocked
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                            }`}
                          />
                          {errors?.district && (
                            <p className="text-red-600 text-xs mt-1">
                              {errors.district}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 tracking-wide ml-2">
                            Pincode <span className="text-red-600">*</span>
                          </label>
                          <input
                            name="pin_code"
                            value={memberFormData.pin_code || ""}
                            onChange={handleChange}
                            readOnly={gstAddressLocked}
                            className={`w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#375EF4] ${
                              gstAddressLocked
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                            }`}
                          />
                          {errors?.pin_code && (
                            <p className="text-red-600 text-xs mt-1">
                              {errors.pin_code}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                            GST Document <span className="text-red-600">*</span>
                          </label>

                          <input
                            type="text"
                            readOnly
                            placeholder="Upload GST document"
                            value={memberFormData.company_gst_no_doc?.name || ""}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 cursor-pointer bg-white focus:outline-none focus:ring-1 focus:ring-[#375EF4]"
                            onClick={() =>
                              document.getElementById("company_gst_no_doc").click()
                            }
                          />

                          <input
                            id="company_gst_no_doc"
                            name="company_gst_no_doc"
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={handleCompanyFileChange}
                          />

                          {errors?.company_gst_no_doc && (
                            <p className="text-red-600 text-xs mt-1">
                              {errors.company_gst_no_doc}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                            Business MCC <span className="text-red-600">*</span>
                          </label>
                          <input
                            name="business_mcc"
                            value={memberFormData.business_mcc || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#375EF4]"
                          />
                          {errors?.business_mcc && (
                            <p className="text-red-600 text-xs mt-1">
                              {errors.business_mcc}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                            Website URL <span className="text-red-600">*</span>
                          </label>
                          <input
                            name="website_url"
                            value={memberFormData.website_url || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#375EF4]"
                          />
                          {errors?.website_url && (
                            <p className="text-red-600 text-xs mt-1">
                              {errors.website_url}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                            Company PAN Number <span className="text-red-600">*</span>
                          </label>
                          <input
                            name="company_pan_no"
                            value={memberFormData.company_pan_no || ""}
                            onChange={(e) =>
                              setMemberFormData((prev) => ({
                                ...prev,
                                company_pan_no: e.target.value.toUpperCase(),
                              }))
                            }
                            maxLength={10}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#375EF4]"
                          />
                          {errors?.company_pan_no && (
                            <p className="text-red-600 text-xs mt-1">
                              {errors.company_pan_no}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                            Company PAN Document{" "}
                            <span className="text-red-600">*</span>
                          </label>

                          <input
                            type="text"
                            readOnly
                            placeholder="Upload PAN document"
                            value={memberFormData.company_pan_no_doc?.name || ""}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 cursor-pointer bg-white focus:outline-none focus:ring-1 focus:ring-[#375EF4]"
                            onClick={() =>
                              document.getElementById("company_pan_no_doc").click()
                            }
                          />

                          <input
                            id="company_pan_no_doc"
                            name="company_pan_no_doc"
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={handleCompanyFileChange}
                          />

                          {errors?.company_pan_no_doc && (
                            <p className="text-red-600 text-xs mt-1">
                              {errors.company_pan_no_doc}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                            CIN / LLPIN <span className="text-red-600">*</span>
                          </label>
                          <input
                            name="cin_llpin"
                            value={memberFormData.cin_llpin || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#375EF4]"
                          />
                          {errors?.cin_llpin && (
                            <p className="text-red-600 text-xs mt-1">
                              {errors.cin_llpin}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                            Company Type <span className="text-red-600">*</span>
                          </label>
                          <select
                            name="company_type"
                            value={memberFormData.company_type || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#375EF4]"
                          >
                            <option value="">Select</option>
                            <option value="private">Private</option>
                            <option value="public">Public</option>
                            <option value="llp">LLP</option>
                          </select>
                          {errors?.company_type && (
                            <p className="text-red-600 text-xs mt-1">
                              {errors.company_type}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                            Cancel Cheque <span className="text-red-600">*</span>
                          </label>

                          <input
                            type="text"
                            readOnly
                            placeholder="Upload cancel cheque"
                            value={memberFormData.cancel_cheque_doc?.name || ""}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 cursor-pointer bg-white focus:outline-none focus:ring-1 focus:ring-[#375EF4]"
                            onClick={() =>
                              document.getElementById("cancel_cheque_doc").click()
                            }
                          />

                          <input
                            id="cancel_cheque_doc"
                            name="cancel_cheque_doc"
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={handleCompanyFileChange}
                          />

                          {errors?.cancel_cheque_doc && (
                            <p className="text-red-600 text-xs mt-1">
                              {errors.cancel_cheque_doc}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6 mb-6">
                      {memberFormData?.director_info?.map((director, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-2xl p-5 space-y-4"
                        >
                          <div className="flex justify-between items-center">
                            {/* <h3 className="text-base font-semibold text-gray-700">
                              Director {index + 1}
                            </h3> */}
                            <h3 className="text-base font-semibold text-gray-700 mb-3 mt-4">
                              Director {index + 1}<br/>
                             <span className="text-red-800 bg-red-500/20 block mt-2 p-2 rounded-xl text-sm font-medium shadow-[0_0_6px_rgba(255,0,0,0.4)]">
                              <b >note:</b> <br/>
                              <div className="mt-2">
                               step 1: click verify Pan + Aadhaar button to auto fetch director details.</div>
                                <div className="mt-2">step 2: After completion of submit redirect back to this page. </div>

                               </span>

                            </h3>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => removeDirector(index)}
                                className="text-red-600 text-sm font-semibold"
                              >
                                <i className="fa-solid fa-trash"></i> Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                                Director Name <span className="text-red-600">*</span>
                              </label>
                              <input
                                name="director_name"
                                readOnly
                                value={director.director_name || ""}
                                placeholder="Will auto fill after fetch"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                              />
                              {errors?.director?.[index]?.director_name && (
                                <p className="text-red-600 text-xs mt-1">
                                  {errors.director[index].director_name}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                                Gender <span className="text-red-600">*</span>
                              </label>
                              <input
                                readOnly
                                value={
                                  director.director_gender
                                    ? director.director_gender.charAt(0).toUpperCase() +
                                      director.director_gender.slice(1)
                                    : ""
                                }
                                placeholder="Will auto fill after fetch"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                              />
                              {errors?.director?.[index]?.director_gender && (
                                <p className="text-red-600 text-xs mt-1">
                                  {errors.director[index].director_gender}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                                Date of Birth <span className="text-red-600">*</span>
                              </label>
                              <input
                                type="date"
                                readOnly
                                value={director.director_dob || ""}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                              />
                              {errors?.director?.[index]?.director_dob && (
                                <p className="text-red-600 text-xs mt-1">
                                  {errors.director[index].director_dob}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                                PAN Number <span className="text-red-600">*</span>
                              </label>
                              <input
                                readOnly
                                value={director.director_pan_no || ""}
                                placeholder="Will auto fill after fetch"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                              />
                              {errors?.director?.[index]?.director_pan_no && (
                                <p className="text-red-600 text-xs mt-1">
                                  {errors.director[index].director_pan_no}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                                PAN Document
                              </label>
                              <input
                                type="text"
                                readOnly
                                value={
                                  directorFetchedDocs?.[index]?.pan?.document_name || ""
                                }
                                placeholder="Will auto fill after fetch"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                              />
                            </div>

                            <div>
                              <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                                Aadhaar Number <span className="text-red-600">*</span>
                              </label>
                              <input
                                readOnly
                                value={director.director_aadhar_no || ""}
                                placeholder="Will auto fill after fetch"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                              />
                              {errors?.director?.[index]?.director_aadhar_no && (
                                <p className="text-red-600 text-xs mt-1">
                                  {errors.director[index].director_aadhar_no}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block mb-1 text-xs font-semibold text-gray-600 ml-2">
                                Aadhaar Document
                              </label>
                              <input
                                type="text"
                                readOnly
                                value={
                                  directorFetchedDocs?.[index]?.aadhaar?.document_name || ""
                                }
                                placeholder="Will auto fill after fetch"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => verifyDirectorDigilocker(index)}
                              disabled={directorVerifyLoading[index]}
                              className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                                directorVerifyLoading[index]
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-green-600 hover:bg-green-700"
                              }`}
                            >
                              {directorVerifyLoading[index]
                                ? "Verifying..."
                                : "Verify PAN + Aadhaar"}
                            </button>

                            {directorRequestIds[index] && (
                              <button
                                type="button"
                                onClick={() => fetchDirectorDocuments(index)}
                                disabled={directorFetchLoading[index]}
                                className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                                  directorFetchLoading[index]
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                              >
                                {directorFetchLoading[index]
                                  ? "Fetching..."
                                  : "Fetch Documents"}
                              </button>
                            )}

                            {directorVerifyStatus[index] && (
                              <p className="text-green-700 text-sm font-medium">
                                {directorVerifyStatus[index]}
                              </p>
                            )}

                            {directorVerifyError[index] && (
                              <p className="text-red-600 text-sm font-medium">
                                {directorVerifyError[index]}
                              </p>
                            )}

                            {errors?.director?.[index]?.fetch_documents && (
                              <p className="text-red-600 text-sm font-medium">
                                {errors.director[index].fetch_documents}
                              </p>
                            )}
                          </div>

                          {directorFetchedDocs[index] && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-base font-bold text-blue-800">
                                    Aadhaar Card
                                  </h4>
                                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                    {directorFetchedDocs[index]?.aadhaar?.status || "N/A"}
                                  </span>
                                </div>

                                <div className="flex gap-4">
                                  {directorFetchedDocs[index]?.aadhaar?.aadhaar_data
                                    ?.photo_base64 && (
                                    <img
                                      src={`data:image/jpeg;base64,${
                                        directorFetchedDocs[index]?.aadhaar
                                          ?.aadhaar_data?.photo_base64
                                      }`}
                                      alt="Aadhaar"
                                      className="w-24 h-28 object-cover rounded-lg border border-blue-200 bg-white"
                                    />
                                  )}

                                  <div className="flex-1 space-y-2 text-sm text-gray-700">
                                    <p>
                                      <span className="font-semibold">Name:</span>{" "}
                                      {directorFetchedDocs[index]?.aadhaar?.aadhaar_data
                                        ?.personal_info?.name || "-"}
                                    </p>
                                    <p>
                                      <span className="font-semibold">DOB:</span>{" "}
                                      {directorFetchedDocs[index]?.aadhaar?.aadhaar_data
                                        ?.personal_info?.dob || "-"}
                                    </p>
                                    <p>
                                      <span className="font-semibold">Gender:</span>{" "}
                                      {directorFetchedDocs[index]?.aadhaar
                                        ?.aadhaar_data?.personal_info?.gender || "-"}
                                    </p>
                                    <p>
                                      <span className="font-semibold">UID:</span>{" "}
                                      {directorFetchedDocs[index]?.aadhaar?.aadhaar_data
                                        ?.uid || "-"}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 text-sm text-gray-700">
                                  <p className="font-semibold mb-1">Address:</p>
                                  <p className="leading-6">
                                    {formatAadhaarAddress(
                                      directorFetchedDocs[index]?.aadhaar?.aadhaar_data
                                        ?.address
                                    ) || "-"}
                                  </p>
                                </div>
                              </div>

                              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-base font-bold text-green-800">
                                    PAN Card
                                  </h4>
                                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                                    {directorFetchedDocs[index]?.pan?.status || "N/A"}
                                  </span>
                                </div>

                                <div className="space-y-3 text-sm text-gray-700">
                                  <p>
                                    <span className="font-semibold">PAN Number:</span>{" "}
                                    {directorFetchedDocs[index]?.pan?.pancard_data
                                      ?.pan_number || "-"}
                                  </p>
                                  <p>
                                    <span className="font-semibold">Holder Name:</span>{" "}
                                    {directorFetchedDocs[index]?.pan?.pancard_data
                                      ?.holder_name || "-"}
                                  </p>
                                  <p>
                                    <span className="font-semibold">DOB:</span>{" "}
                                    {directorFetchedDocs[index]?.pan?.pancard_data
                                      ?.holder_dob || "-"}
                                  </p>
                                  <p>
                                    <span className="font-semibold">
                                      Certificate Number:
                                    </span>{" "}
                                    {directorFetchedDocs[index]?.pan?.pancard_data
                                      ?.certificate_number || "-"}
                                  </p>
                                  <p>
                                    <span className="font-semibold">Issuer:</span>{" "}
                                    {directorFetchedDocs[index]?.pan?.issuer || "-"}
                                  </p>
                                  <p>
                                    <span className="font-semibold">Document Name:</span>{" "}
                                    {directorFetchedDocs[index]?.pan?.document_name || "-"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-6 mb-6">
                      <p className="text-sm text-gray-600 text-center max-w-2xl mx-auto">
                        Click the button below to generate your Video KYC session.
                        The VKYC page will open in a new tab. Complete the process there,
                        then come back and submit this form.
                      </p>

                      <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50 max-w-3xl mx-auto">
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                          <li>Click Generate VKYC Link</li>
                          <li>Complete video verification in the new tab</li>
                          <li>Come back here after finishing the process</li>
                          <li>Then click Submit</li>
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-white p-6 max-w-3xl mx-auto shadow-sm">
                        <div className="flex flex-wrap items-center gap-3 justify-center">
                          <button
                            type="button"
                            onClick={createVkycSession}
                            disabled={vkycLoading}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white ${
                              vkycLoading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-purple-600 hover:bg-purple-700"
                            }`}
                          >
                            {vkycLoading ? "Generating..." : "Generate VKYC Link"}
                          </button>

                          {memberFormData.vkyc_link && (
                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  memberFormData.vkyc_link,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                              Open VKYC Page
                            </button>
                          )}
                        </div>

                        {errors?.vkyc_session_id && (
                          <p className="mt-3 text-sm text-red-600 text-center">
                            {errors.vkyc_session_id}
                          </p>
                        )}

                        {memberFormData.vkyc_session_id && (
                          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                            <p className="text-sm text-green-700 font-medium">
                              VKYC session generated successfully
                            </p>

                            <div className="mt-3 space-y-2 text-sm text-gray-700 break-all">
                              <p>
                                <span className="font-semibold">Session ID:</span>{" "}
                                {memberFormData.vkyc_session_id}
                              </p>
                              <p>
                                <span className="font-semibold">Purpose:</span>{" "}
                                {memberFormData.vkyc_purpose || "-"}
                              </p>
                              <p>
                                <span className="font-semibold">Link:</span>{" "}
                                {memberFormData.vkyc_link || "-"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <div>
                      <button
                        type="button"
                        className={`text-white font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center mr-3 ${
                          currentStep === 1
                            ? "disabled bg-gray-500 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-800 cursor-pointer"
                        }`}
                        onClick={handlePrev}
                      >
                        &lt; Prev
                      </button>

                      {currentStep < 4 && (
                        <button
                          type="button"
                          className="text-white bg-blue-600 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
                          onClick={handleNext}
                        >
                          Next &gt;
                        </button>
                      )}

                      {currentStep === 4 && (
                        <button
                          type="submit"
                          disabled={!memberFormData.vkyc_session_id}
                          className={`font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ${
                            memberFormData.vkyc_session_id
                              ? "cursor-pointer text-white bg-blue-600 hover:bg-blue-800"
                              : "cursor-not-allowed text-white bg-gray-400"
                          }`}
                        >
                          Submit
                        </button>
                      )}
                    </div>

                    <div className="flex justify-between">
                      {currentStep === 3 && (
                        <Button
                          type="button"
                          onClick={addDirector}
                          className="cursor-pointer px-4 py-2 mr-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800"
                        >
                          + Add Director
                        </Button>
                      )}

                      <Button
                        onClick={() => setShowConfirmModal(!showConfirmModal)}
                        type="button"
                        className="cursor-pointer text-white bg-blue-600 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
                      >
                        Cancel KYC
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        showConfirmModal={showConfirmModal}
        heading={"Are you sure you want to go back?"}
        body={"If you go back then you will lose your filled data in form...."}
        handleConfirmModal={setShowConfirmModal}
        action={() => navigate("/")}
      />
    </>
  );
};