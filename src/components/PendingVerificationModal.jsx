import React, { useEffect, useState } from "react";
import { Stepper } from "../components/Stepper";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "../components/ConfirmModal";
import { useGet } from "../hooks/useGet";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";
import { useLocation } from "react-router-dom";

export const PendingVerificationModal = () => {
  const location = useLocation();
  const [errors, setErrors] = useState({
    frontend: {},
    backend: {}
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const toast = useToast();
  const user = location.state?.user || {};
  // console.log("user data", user);
  const singlemerchant = location.state?.merchant || {};
  // console.log("single merchant", singlemerchant);

  const [memberFormData, setMemberFormData] = useState({
    id: user.id || singlemerchant.id || "",
    name: user.name || singlemerchant.name || "",
    mobile_no: user.mobile_no || singlemerchant.mobile || "",
    email: user.email || singlemerchant.email || "",
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
    payin_at_onboard: "",
    payout_at_onboard: "",
    scheme_id: "",
  });

  const stepRequiredFields = {
    1: [
      "name",
      "mobile_no",
      "email",
      "business_mcc",
      "website_url",
      "city",
      "district",
      "state",
      "pin_code",
      "address",
    ],
    2: [
      "company_pan_no",
      "company_gst_no",
      "cin_llpin",
      "company_type",
      "date_of_incorporation",
      "company_pan_no_doc",
      "company_gst_no_doc",
      "cancel_cheque_doc",
    ],
    3: [
      "director_name",
      "director_pan_no",
      "director_aadhar_no",
      "director_gender",
      "director_dob",
      "user_pan_doc",
      "user_addhar_doc",
    ],
    4: ["video_kyc"],
  };

  const navigate = useNavigate();

  const { execute: executeMember } = usePost("/kyc-merchant");

  // Helper function to get error for a specific field
  const getFieldError = (fieldName, index = null) => {
    // Check frontend errors first
    if (index !== null && errors.frontend?.director?.[index]?.[fieldName]) {
      return errors.frontend.director[index][fieldName];
    } 
    else if (errors.frontend?.[fieldName]) {
      return errors.frontend[fieldName];
    }
    
    // Check backend errors
    if (index !== null && errors.backend?.director?.[index]?.[fieldName]) {
      return errors.backend.director[index][fieldName];
    }
    else if (errors.backend?.[fieldName]) {
      return errors.backend[fieldName];
    }
    
    return null;
  };

  // Function to extract backend errors from API response
  const extractBackendErrors = (errorResponse) => {
    const backendErrors = {};
    const errors = errorResponse?.response?.data?.errors;
    
    if (errors) {
      // Loop through backend error object
      Object.keys(errors).forEach(field => {
        // Handle nested errors like director_info
        if (field.includes('director_info')) {
          // Extract index and field name from string like "director_info.0.director_name"
          const match = field.match(/director_info\.(\d+)\.(.+)/);
          if (match) {
            const index = parseInt(match[1]);
            const directorField = match[2];
            
            if (!backendErrors.director) backendErrors.director = [];
            if (!backendErrors.director[index]) backendErrors.director[index] = {};
            
            backendErrors.director[index][directorField] = errors[field][0];
          }
        } else if (field.includes('[') && field.includes(']')) {
          // Handle array notation like "director_info[0][director_name]"
          const match = field.match(/(\w+)\[(\d+)\]\[(\w+)\]/);
          if (match) {
            const fieldName = match[1];
            const index = parseInt(match[2]);
            const subField = match[3];
            
            if (fieldName === 'director_info') {
              if (!backendErrors.director) backendErrors.director = [];
              if (!backendErrors.director[index]) backendErrors.director[index] = {};
              
              backendErrors.director[index][subField] = errors[field][0];
            }
          }
        } else {
          // Regular field errors
          backendErrors[field] = errors[field][0];
        }
      });
    }
    
    return backendErrors;
  };

  const handlePrev = () => {
    // Clear errors when going back
    setErrors({ frontend: {}, backend: {} });
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
  const nameRegex = /^[A-Za-z ]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const textRegex = /^[A-Za-z]+$/;
  const textNumberRegex = /^[A-Za-z0-9]+$/;
  const numberRegex = /^[0-9]{4}$/;
  const pinnumberRegex = /^[0-9]{6}$/;
  const aadharRegex = /^[0-9]{12}$/;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

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
      pattern: textRegex,
      message: "City name is not valid",
    },
    state: {
      required: true,
      pattern: textRegex,
      message: "State name is not valid",
    },
    district: {
      required: true,
      pattern: textRegex,
      message: "District name is not valid",
    },
    pin_code: {
      required: true,
      pattern: pinnumberRegex,
      message: "Pin code must be 6 digits",
    },
    account_holder_name: {
      required: true,
      pattern: nameRegex,
      message: "Account holder name is not valid",
    },
    bank_account_no: {
      required: true,
      pattern: textNumberRegex,
      message: "Bank account number is not valid",
    },
    cin_llpin: {
      required: true,
      pattern: textNumberRegex,
      message: "CIN / LLPIN is not valid",
    },
    company_pan_no: {
      required: true,
      pattern: panRegex,
      message: "Company PAN number is not valid",
    },
    company_gst_no: {
      required: true,
      pattern: textNumberRegex,
      message: "Company GST number is not valid",
    },
    director_name: {
      required: true,
      pattern: nameRegex,
      message: "Director name is not valid",
    },
    director_pan_no: {
      required: true,
      pattern: panRegex,
      message: "Director PAN number is not valid",
    },
    director_aadhar_no: {
      required: true,
      pattern: aadharRegex,
      message: "Aadhaar number must be 12 digits",
    },
    video_kyc: {
      required: true,
      message: "Please upload your Video KYC recording",
    },
  };

  const validateStep = () => {
    const requiredFields = stepRequiredFields[currentStep];
    const newErrors = { frontend: {}, backend: errors.backend }; // Keep backend errors

    const validateValue = (value, field) => {
      const rules = validationRules[field];

      // required check
      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        return "This field is required";
      }

      // regex check (only if rule exists)
      if (rules?.pattern && typeof value === "string") {
        if (!rules.pattern.test(value.trim())) {
          return rules.message || "Invalid format";
        }
      }

      return null;
    };

    // 👤 STEP 3 — Directors
    if (currentStep === 3) {
      memberFormData.director_info.forEach((director, idx) => {
        requiredFields.forEach((field) => {
          const error = validateValue(director[field], field);

          if (error) {
            if (!newErrors.frontend.director) newErrors.frontend.director = [];
            newErrors.frontend.director[idx] = {
              ...(newErrors.frontend.director[idx] || {}),
              [field]: error,
            };
          }
        });
      });
    }
    // 🧾 Other steps
    else {
      requiredFields.forEach((field) => {
        const value = field === "video_kyc" ? memberFormData.video_kyc : memberFormData[field];
        const error = validateValue(value, field);
        if (error) {
          newErrors.frontend[field] = error;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors.frontend).length === 0 && 
           (!newErrors.frontend.director || Object.keys(newErrors.frontend.director).length === 0);
  };

  const handleNext = () => {
    // Clear backend errors for current step when moving forward
    setErrors(prev => ({ 
      ...prev, 
      backend: {} 
    }));
    
    if (validateStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Clear error for this field when user starts typing
    setErrors(prev => ({
      ...prev,
      frontend: { ...prev.frontend, [name]: null },
      backend: { ...prev.backend, [name]: null }
    }));

    const newValue = name === "credentials_id" ? parseInt(value, 10) || "" : value;

    if (name === "payin_at_onboard" && value === "Airpay") {
      // refetchCredentials();
    }

    setMemberFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleDirectorChange = (index, e) => {
    const { name, value, files } = e.target;
    
    // Clear error for this director field
    setErrors(prev => {
      const updatedBackend = { ...prev.backend };
      const updatedFrontend = { ...prev.frontend };
      
      if (updatedBackend.director?.[index]) {
        updatedBackend.director[index] = { ...updatedBackend.director[index], [name]: null };
      }
      
      if (updatedFrontend.director?.[index]) {
        updatedFrontend.director[index] = { ...updatedFrontend.director[index], [name]: null };
      }
      
      return { frontend: updatedFrontend, backend: updatedBackend };
    });
    
    setMemberFormData((prev) => {
      const updatedDirectors = [...prev.director_info];
      updatedDirectors[index] = {
        ...updatedDirectors[index],
        [name]: files ? files[0] : value,
      };
      return { ...prev, director_info: updatedDirectors };
    });
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
    // Remove director errors when removing director
    setErrors(prev => {
      const updatedBackend = { ...prev.backend };
      const updatedFrontend = { ...prev.frontend };
      
      if (updatedBackend.director) {
        updatedBackend.director = updatedBackend.director.filter((_, i) => i !== index);
      }
      
      if (updatedFrontend.director) {
        updatedFrontend.director = updatedFrontend.director.filter((_, i) => i !== index);
      }
      
      return { frontend: updatedFrontend, backend: updatedBackend };
    });
    
    setMemberFormData((prev) => ({
      ...prev,
      director_info: prev.director_info.filter((_, i) => i !== index),
    }));
  };

  const handleCompanyFileChange = (e) => {
    const { name, files } = e.target;
    
    // Clear error for this file field
    setErrors(prev => ({
      ...prev,
      frontend: { ...prev.frontend, [name]: null },
      backend: { ...prev.backend, [name]: null }
    }));
    
    setMemberFormData((prev) => ({
      ...prev,
      [name]: files?.[0] || null,
    }));
  };

  const handleDirectorFileChange = (index, e) => {
    const { name, files } = e.target;
    
    // Clear error for this director file field
    setErrors(prev => {
      const updatedBackend = { ...prev.backend };
      const updatedFrontend = { ...prev.frontend };
      
      if (updatedBackend.director?.[index]) {
        updatedBackend.director[index] = { ...updatedBackend.director[index], [name]: null };
      }
      
      if (updatedFrontend.director?.[index]) {
        updatedFrontend.director[index] = { ...updatedFrontend.director[index], [name]: null };
      }
      
      return { frontend: updatedFrontend, backend: updatedBackend };
    });
    
    setMemberFormData((prev) => {
      const updatedDirectors = [...prev.director_info];
      updatedDirectors[index][name] = files?.[0] || null;
      return { ...prev, director_info: updatedDirectors };
    });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    
    // Clear errors for this field
    setErrors(prev => ({
      ...prev,
      frontend: { ...prev.frontend, video_kyc: null },
      backend: { ...prev.backend, video_kyc: null }
    }));
    
    if (file && file.type.startsWith("video/")) {
      setMemberFormData((prev) => ({ ...prev, video_kyc: file }));
    } else {
      setErrors(prev => ({
        ...prev,
        frontend: { ...prev.frontend, video_kyc: "Please upload a valid video file" }
      }));
      toast.error("Please upload a valid video file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous backend errors
    setErrors(prev => ({ ...prev, backend: {} }));

    if (!validateStep()) return;

    try {
      const formData = new FormData();
      const merchantId = user.id || singlemerchant.id;
      
      if (!merchantId) {
        toast.error("Merchant ID missing – cannot submit KYC");
        return;
      }
      
      formData.append("id", merchantId);

      // Append text fields (excluding files and directors)
      Object.keys(memberFormData).forEach((key) => {
        if (!["director_info", "company_pan_no_doc", "company_gst_no_doc", "cancel_cheque_doc", "video_kyc"].includes(key)) {
          formData.append(key, memberFormData[key]);
        }
      });

      // Append company files
      ["company_pan_no_doc", "company_gst_no_doc", "cancel_cheque_doc"].forEach((fileKey) => {
        if (memberFormData[fileKey] instanceof File) {
          formData.append(fileKey, memberFormData[fileKey]);
        }
      });

      // Video KYC file
      if (memberFormData.video_kyc instanceof File) {
        formData.append("video_kyc", memberFormData.video_kyc);
      }

      // Append directors correctly
      memberFormData.director_info.forEach((director, idx) => {
        Object.keys(director).forEach((field) => {
          const value = director[field];
          formData.append(`director_info[${idx}][${field}]`, value);
        });
      });

      await executeMember(formData);
      toast.success("Form submitted successfully!");
      navigate("/member-list");

    } catch (err) {
      // Extract and display backend errors
      const backendErrors = extractBackendErrors(err);
      setErrors(prev => ({
        ...prev,
        backend: backendErrors
      }));
      
      // If there are field-specific errors, show the first one in toast
      // Otherwise show generic error
      const firstErrorKey = Object.keys(backendErrors)[0];
      let errorMessage = "Something went wrong";
      
      if (firstErrorKey) {
        if (firstErrorKey === 'director') {
          const firstDirectorError = Object.values(backendErrors.director || {})[0];
          if (firstDirectorError) {
            const firstFieldError = Object.values(firstDirectorError)[0];
            errorMessage = firstFieldError || "Director information error";
          }
        } else {
          errorMessage = backendErrors[firstErrorKey];
        }
      } else {
        errorMessage = err?.response?.data?.message || "Something went wrong";
      }
      
      toast.error(errorMessage);
      
      // Scroll to the first error field
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.border-red-500');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const stepHeadings = {
    1: {
      title: "Merchant Details",
      subtitle: "Basic business information"
    },
    2: {
      title: "Company & Bank Details",
      subtitle: "Legal and banking information"
    },
    3: {
      title: "Director Details",
      subtitle: "Director KYC information"
    },
    4: {
      title: "Video KYC",
      subtitle: "video kyc information"
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-100 flex justify-center">
        <div className="w-full px-6 py-8">
          <div className="rounded-2xl overflow-hidden">
            {/* HEADER */}
            <div
              className="px-6 py-4"
              style={{ background: "linear-gradient(275deg, #7ea1d8ff, #1d2f61ff)" }}
            >
              <h4 className="font-bold text-white text-lg">
                Complete Your KYC
              </h4>
            </div>
            <div
              className="flex items-start gap-6 p-8 shadow-xl/30"
              style={{ background: "linear-gradient(175deg, #e8f8ffff, #e3e4e7ff)" }}
            >
              {/* STEPPER — 1/4 */}
              <div className="w-1/4 shrink-0">
                <Stepper currentStep={currentStep} />
              </div>

              {/* FORM — 3/4 */}
              <div className="w-3/4 rounded-2xl shadow-xl/10 bg-white p-8">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  {currentStep === 1 && (
                    <div className="grid gap-6 mb-6 md:grid-cols-2">
                      <div className="relative">
                        <input
              
                          type="text"
                          name="name"
                          id="floating_outlined_name"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('name') ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder=""
                          value={memberFormData.name}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="floating_outlined_name"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('name')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          Business Name <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('name') && (
                          <span className="mt-1 text-sm text-red-500">
                            {getFieldError('name')}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
               
                          type="number"
                          name="mobile_no"
                          id="floating_outlined_mobile"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('mobile_no') ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder=""
                          value={memberFormData.mobile_no}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="floating_outlined_mobile"
                          className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('mobile_no')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          Business Mobile <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('mobile_no') && (
                          <span className="mt-1 text-sm text-red-500">
                            {getFieldError('mobile_no')}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                         
                          type="email"
                          name="email"
                          id="floating_outlined_email"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('email') ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder=""
                          value={memberFormData.email}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="floating_outlined_email"
                          className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('email')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          Business Email <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('email') && (
                          <span className="text-sm text-red-500">{getFieldError('email')}</span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          name="business_mcc"
                          id="floating_outlined_mcc"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('business_mcc') ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder=""
                          value={memberFormData.business_mcc}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="floating_outlined_mcc"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('business_mcc')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          Business MCC <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('business_mcc') && (
                          <span className="text-sm text-red-500">
                            {getFieldError('business_mcc')}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          name="city"
                          id="floating_outlined_city"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('city') ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder=""
                          value={memberFormData.city}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="floating_outlined_city"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('city')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          City <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('city') && (
                          <span className="text-sm text-red-500">{getFieldError('city')}</span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          name="state"
                          id="floating_outlined_state"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('state') ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder=""
                          value={memberFormData.state}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="floating_outlined_state"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('state')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          State <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('state') && (
                          <span className="text-sm text-red-500">{getFieldError('state')}</span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          name="district"
                          id="floating_outlined_district"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('district') ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder=""
                          value={memberFormData.district}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="floating_outlined_district"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('district')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          District <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('district') && (
                          <span className="text-sm text-red-500">{getFieldError('district')}</span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          name="pin_code"
                          id="floating_outlined_pin"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('pin_code') ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder=""
                          value={memberFormData.pin_code}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="floating_outlined_pin"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('pin_code')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          Pincode <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('pin_code') && (
                          <span className="text-sm text-red-500">{getFieldError('pin_code')}</span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          name="address"
                          id="floating_outlined_address"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('address') ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder=""
                          value={memberFormData.address}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="floating_outlined_address"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('address')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          Address <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('address') && (
                          <span className="text-sm text-red-500">{getFieldError('address')}</span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          name="website_url"
                          id="floating_outlined_web"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('website_url') ? "border-red-500" : "border-gray-300"
                          }`}
                          value={memberFormData.website_url}
                          onChange={handleChange}
                          placeholder=""
                        />
                        <label
                          htmlFor="floating_outlined_web"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('website_url')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          Website Url <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('website_url') && (
                          <span className="text-sm text-red-500">
                            {getFieldError('website_url')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="grid gap-6 mb-5 md:grid-cols-2">
                      <div className="relative">
                        <input
                          type="text"
                          name="company_pan_no"
                          id="floating_outlined_pan"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('company_pan_no') ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder=""
                          value={memberFormData.company_pan_no}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="floating_outlined_pan"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('company_pan_no')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          Company Pan Number <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('company_pan_no') && (
                          <span className="text-sm text-red-500">
                            {getFieldError('company_pan_no')}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input 
                          type="file" 
                          name="company_pan_no_doc" 
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('company_pan_no_doc') ? "border-red-500" : "border-gray-300"
                          }`} 
                          onChange={handleCompanyFileChange} 
                        />
                        <label
                          htmlFor="floating_outlined_pan_doc"
                          className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('company_pan_no_doc')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          Document Of Pan Card <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('company_pan_no_doc') && (
                          <span className="text-sm text-red-500">
                            {getFieldError('company_pan_no_doc')}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          name="company_gst_no"
                          id="floating_outlined_gst"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('company_gst_no') ? "border-red-500" : "border-gray-300"
                          }`}
                          value={memberFormData.company_gst_no}
                          onChange={handleChange}
                          placeholder=""
                        />
                        <label
                          htmlFor="floating_outlined_gst"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('company_gst_no')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          GST Number <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('company_gst_no') && (
                          <span className="text-sm text-red-500">
                            {getFieldError('company_gst_no')}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input 
                          type="file" 
                          name="company_gst_no_doc" 
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('company_gst_no_doc') ? "border-red-500" : "border-gray-300"
                          }`} 
                          onChange={handleCompanyFileChange} 
                        />
                        <label
                          htmlFor="floating_outlined_gst_doc"
                          className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('company_gst_no_doc')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          Document Of GST Number <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('company_gst_no_doc') && (
                          <span className="text-sm text-red-500">
                            {getFieldError('company_gst_no_doc')}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          name="cin_llpin"
                          id="floating_outlined_cin"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('cin_llpin') ? "border-red-500" : "border-gray-300"
                          }`}
                          value={memberFormData.cin_llpin}
                          onChange={handleChange}
                          placeholder=""
                        />
                        <label
                          htmlFor="floating_outlined_cin"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('cin_llpin')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          CIN Number <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('cin_llpin') && (
                          <span className="text-sm text-red-500">
                            {getFieldError('cin_llpin')}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <label
                          htmlFor="company_type"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('company_type')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          Company Type <span className="text-red-600">*</span>
                        </label>
                        <select
                          id="company_type"
                          name="company_type"
                          onChange={handleChange}
                          value={memberFormData.company_type}
                          className={`bg-gray-50 border text-gray-900 text-sm rounded-lg w-full p-2.5 ${
                            getFieldError('company_type') ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Choose company type</option>
                          <option value="proprietary">Proprietary</option>
                          <option value="partnership">Partnership</option>
                          <option value="private">Private</option>
                          <option value="public">Public</option>
                          <option value="llp">LLP</option>
                          <option value="society">Society</option>
                          <option value="trust">Trust</option>
                          <option value="government">Government</option>
                          <option value="huf">HUF</option>
                          <option value="boi">BOI</option>
                          <option value="aop">AOP</option>
                          <option value="ajp">AJP</option>
                        </select>
                        {getFieldError('company_type') && (
                          <span className="text-sm text-red-500">
                            {getFieldError('company_type')}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="date"
                          name="date_of_incorporation"
                          id="floating_outlined_date"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('date_of_incorporation') ? "border-red-500" : "border-gray-300"
                          }`}
                          value={memberFormData.date_of_incorporation}
                          onChange={handleChange}
                          placeholder=""
                        />
                        <label
                          htmlFor="floating_outlined_date"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('date_of_incorporation')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          Date Of Incorporation <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('date_of_incorporation') && (
                          <span className="text-sm text-red-500">
                            {getFieldError('date_of_incorporation')}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          name="account_holder_name"
                          id="floating_outlined_account_holder_name"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('account_holder_name') ? "border-red-500" : "border-gray-300"
                          }`}
                          value={memberFormData.account_holder_name}
                          onChange={handleChange}
                          placeholder=""
                        />
                        <label
                          htmlFor="floating_outlined_account_holder_name"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('account_holder_name')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          Account Holder Name <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('account_holder_name') && (
                          <span className="text-sm text-red-500">
                            {getFieldError('account_holder_name')}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          name="bank_account_no"
                          id="floating_outlined_account_number"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('bank_account_no') ? "border-red-500" : "border-gray-300"
                          }`}
                          value={memberFormData.bank_account_no}
                          onChange={handleChange}
                          placeholder=""
                        />
                        <label
                          htmlFor="floating_outlined_account_number"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('bank_account_no')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          Bank Account Number <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('bank_account_no') && (
                          <span className="text-sm text-red-500">
                            {getFieldError('bank_account_no')}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          name="ifsc_code"
                          id="floating_outlined_ifsc"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('ifsc_code') ? "border-red-500" : "border-gray-300"
                          }`}
                          value={memberFormData.ifsc_code}
                          onChange={handleChange}
                          placeholder=""
                        />
                        <label
                          htmlFor="floating_outlined_ifsc"
                          className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('ifsc_code')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          IFSC Code <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('ifsc_code') && (
                          <span className="text-sm text-red-500">
                            {getFieldError('ifsc_code')}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input 
                          type="file" 
                          name="cancel_cheque_doc" 
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                            getFieldError('cancel_cheque_doc') ? "border-red-500" : "border-gray-300"
                          }`} 
                          onChange={handleCompanyFileChange} 
                        />
                        <label
                          htmlFor="floating_outlined_cancel_doc"
                          className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                            getFieldError('cancel_cheque_doc')
                              ? "peer-focus:text-red-600"
                              : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                          }`}
                        >
                          Document Of Cancel Cheque{" "}
                          <span className="text-red-600">*</span>
                        </label>
                        {getFieldError('cancel_cheque_doc') && (
                          <span className="text-sm text-red-500">
                            {getFieldError('cancel_cheque_doc')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {currentStep === 3 &&
                    memberFormData.director_info.map((director, index) => (
                      <div key={index} className="grid gap-6 mb-6 md:grid-cols-2">
                        <div className="relative">
                          <input
                            type="text"
                            id={`floating_outlined_director_name_${index}`}
                            name="director_name"
                            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                              getFieldError('director_name', index) ? "border-red-500" : "border-gray-300"
                            }`}
                            value={director.director_name}
                            onChange={(e) => handleDirectorChange(index, e)}
                            placeholder=""
                            required
                          />
                          <label
                            htmlFor={`floating_outlined_director_name_${index}`}
                            className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                              getFieldError('director_name', index)
                                ? "peer-focus:text-red-600"
                                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                            }`}
                          >
                            Name <span className="text-red-600">*</span>
                          </label>
                          {getFieldError('director_name', index) && (
                            <span className="text-sm text-red-500">
                              {getFieldError('director_name', index)}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <label
                            htmlFor={`director_gender_${index}`}
                            className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                              getFieldError('director_gender', index)
                                ? "peer-focus:text-red-600"
                                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                            }`}
                          >
                            Gender
                          </label>
                          <select
                            id={`director_gender_${index}`}
                            name="director_gender"
                            className={`bg-gray-50 border text-gray-900 text-sm rounded-lg w-full p-2.5 ${
                              getFieldError('director_gender', index)
                                ? "border-red-500"
                                : " border-gray-300"
                            }`}
                            value={director.director_gender}
                            onChange={(e) => handleDirectorChange(index, e)}
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                          {getFieldError('director_gender', index) && (
                            <span className="text-sm text-red-500">
                              {getFieldError('director_gender', index)}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            id={`floating_outlined_director_pan_${index}`}
                            name="director_pan_no"
                            value={director.director_pan_no}
                            onChange={(e) => handleDirectorChange(index, e)}
                            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                              getFieldError('director_pan_no', index) ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder=""
                            required
                          />
                          <label
                            htmlFor={`floating_outlined_director_pan_${index}`}
                            className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                              getFieldError('director_pan_no', index)
                                ? "peer-focus:text-red-600"
                                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                            }`}
                          >
                            Pan Number <span className="text-red-600">*</span>
                          </label>
                          {getFieldError('director_pan_no', index) && (
                            <span className="text-sm text-red-500">
                              {getFieldError('director_pan_no', index)}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="file"
                            name="user_pan_doc"
                            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                              getFieldError('user_pan_doc', index) ? "border-red-500" : "border-gray-300"
                            }`}
                            onChange={(e) => handleDirectorFileChange(index, e)}
                          />
                          <label
                            htmlFor={`floating_outlined_director_pan_doc_${index}`}
                            className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                              getFieldError('user_pan_doc', index)
                                ? "peer-focus:text-red-600"
                                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                            }`}
                          >
                            Document Of Pan Card <span className="text-red-600">*</span>
                          </label>
                          {getFieldError('user_pan_doc', index) && (
                            <span className="text-sm text-red-500">
                              {getFieldError('user_pan_doc', index)}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            id={`floating_outlined_director_aadhar_no_${index}`}
                            name="director_aadhar_no"
                            value={director.director_aadhar_no}
                            onChange={(e) => handleDirectorChange(index, e)}
                            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                              getFieldError('director_aadhar_no', index) ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder=""
                            required
                          />
                          <label
                            htmlFor={`floating_outlined_director_aadhar_no_${index}`}
                            className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                              getFieldError('director_aadhar_no', index)
                                ? "peer-focus:text-red-600"
                                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                            }`}
                          >
                            Aadhar Number <span className="text-red-600">*</span>
                          </label>
                          {getFieldError('director_aadhar_no', index) && (
                            <span className="text-sm text-red-500">
                              {getFieldError('director_aadhar_no', index)}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="file"
                            name="user_addhar_doc"
                            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                              getFieldError('user_addhar_doc', index) ? "border-red-500" : "border-gray-300"
                            }`}
                            onChange={(e) => handleDirectorFileChange(index, e)}
                          />
                          <label
                            htmlFor={`floating_outlined_director_aadhar_doc_${index}`}
                            className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                              getFieldError('user_addhar_doc', index)
                                ? "peer-focus:text-red-600"
                                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                            }`}
                          >
                            Document Of Aadhar Card{" "}
                            <span className="text-red-600">*</span>
                          </label>
                          {getFieldError('user_addhar_doc', index) && (
                            <span className="text-sm text-red-500">
                              {getFieldError('user_addhar_doc', index)}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="date"
                            id={`floating_outlined_director_dob_${index}`}
                            name="director_dob"
                            value={director.director_dob}
                            onChange={(e) => handleDirectorChange(index, e)}
                            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none peer focus:outline-none focus:ring-0 ${
                              getFieldError('director_dob', index) ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder=""
                            required
                          />
                          <label
                            htmlFor={`floating_outlined_director_dob_${index}`}
                            className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 ${
                              getFieldError('director_dob', index)
                                ? "peer-focus:text-red-600"
                                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                            }`}
                          >
                            DOB <span className="text-red-600">*</span>
                          </label>
                          {getFieldError('director_dob', index) && (
                            <span className="text-sm text-red-500">
                              {getFieldError('director_dob', index)}
                            </span>
                          )}
                        </div>
                        <div>
                          <Button
                            type="button"
                            onClick={() => removeDirector(index)}
                            className="text-red-800 p-3 rounded-xl cursor-pointer"
                          >
                            <i className="fa-solid fa-trash fa-lg"></i>
                          </Button>
                        </div>
                      </div>
                    ))}

                  {currentStep === 4 && (
                    <div className="max-w-2xl mx-auto">
                      <div className="bg-white border-l-4 border-[#4b669a] p-6 rounded-r-lg mb-8">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <i className="fa-solid fa-video text-2xl text-[#4b669a]"></i>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-xl font-bold text-[#4b669a] mb-4">Video KYC</h3>
                            <p className="text-black-500 mb-4">
                              Please record a short video following these steps:
                            </p>
                            <ol className="list-decimal list-inside text-black space-y-3">
                              <li>Hold your face in front of the camera and clearly say your full name.</li>
                              <li>Show your PAN card to the camera so it is clearly visible.</li>
                              <li>Optionally, show any other required documents if prompted.</li>
                              <li>Ensure good lighting and no obstructions for clear verification.</li>
                            </ol>
                          </div>
                        </div>
                      </div>

                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoChange}
                          className="hidden"
                          id="video_kyc_upload"
                        />
                        <label
                          htmlFor="video_kyc_upload"
                          className={`cursor-pointer block w-full py-4 px-6 bg-white border rounded-lg hover:bg-gray-50 transition ${
                            getFieldError('video_kyc') ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <div className="text-lg font-medium text-gray-700">
                            {memberFormData.video_kyc ? memberFormData.video_kyc.name : "Choose file"}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {memberFormData.video_kyc ? "Click to change" : "No file chosen"}
                          </div>
                        </label>

                        {getFieldError('video_kyc') && (
                          <p className="mt-3 text-sm text-red-600">{getFieldError('video_kyc')}</p>
                        )}

                        {memberFormData.video_kyc && (
                          <div className="mt-6">
                            <video
                              src={URL.createObjectURL(memberFormData.video_kyc)}
                              controls
                              className="max-w-full h-auto rounded-lg shadow-md mx-auto max-h-96"
                            />
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
                          className="cursor-pointer text-white bg-blue-600 hover:bg-blue-800 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
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
        body={"If you go back then you will lose your filled data in form."}
        handleConfirmModal={setShowConfirmModal}
        action={() => navigate("/")}
      />
    </>
  );
};