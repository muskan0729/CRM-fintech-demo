// src/pages/Register.jsx

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import paymentGatewayBg from "../images/login-background.jpg";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";

const OTP_TIMER = 300;

// Strong email regex - prevents unrealistic TLDs like .commmmmmm
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,12}$/i;

const FloatingInput = ({
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  className = "",
  error = "",
  noFloat = false,
  ...props
}) => {
  const hasValue = value && value.length > 0;

  return (
    <div className="relative w-full">
      <input
        {...props}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder={noFloat ? placeholder : " "}
        className={`
          peer w-full h-11 px-4 rounded-xl border 
          bg-white text-gray-900 text-sm leading-tight
          focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${noFloat ? "py-2.5" : "pt-6 pb-2"}
          ${error 
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/30" 
            : "border-gray-300 focus:border-blue-600 focus:ring-blue-500/20"}
          ${className}
        `}
      />

      {/* Floating label ONLY when enabled */}
      {!noFloat && (
        <label
          className={`
            absolute left-4 pointer-events-none transition-all duration-200 text-sm
            ${hasValue || props.autoFocus
              ? "top-2 text-xs font-medium"
              : "top-3.5 text-gray-500"}
            peer-focus:top-2 peer-focus:text-xs peer-focus:font-medium
            ${error ? "text-red-600" : "text-gray-500 peer-focus:text-blue-600"}
          `}
        >
          {placeholder}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
    </div>
  );
};


const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const { execute: register, loading } = usePost("/create-merchant");
  const { execute: sendEmailOtpApi, loading: emailOtpLoading } = usePost("/otp/send-email");
  const { execute: verifyEmailOtpApi } = usePost("/verify-email-otp");
  const { execute: sendMobileOtpApi } = usePost("/otp/send-custom-mobile");
  const { execute: verifyMobileOtpApi } = usePost("/verify-email-otp");

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    mobile: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    companyName: "",
    email: "",
    mobile: "",
  });

  const [serverErrorMessage, setServerErrorMessage] = useState("");

  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const [emailExpired, setEmailExpired] = useState(false);

  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtpVerified, setMobileOtpVerified] = useState(false);
  const [mobileTimer, setMobileTimer] = useState(0);
  const [mobileExpired, setMobileExpired] = useState(false);

  const emailOtpRefs = useRef([]);
  const mobileOtpRefs = useRef([]);

  const trimmedCompany = formData.companyName.trim();
  const trimmedEmail = formData.email.trim();
  const trimmedMobile = formData.mobile.trim();

  const isValidCompany =
    trimmedCompany.length >= 3 &&
    trimmedCompany.length <= 100 &&
    /^[a-zA-Z\s]+$/.test(trimmedCompany);

  const isValidEmail = EMAIL_REGEX.test(trimmedEmail);
  const isValidMobile = /^\d{10}$/.test(trimmedMobile);

  useEffect(() => {
    let interval;
    if (emailTimer > 0) {
      interval = setInterval(() => {
        setEmailTimer((t) => {
          const next = Math.max(0, t - 1);
          if (next === 0 && emailOtpSent && !emailOtpVerified) {
            setEmailExpired(true);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailTimer, emailOtpSent, emailOtpVerified]);

  useEffect(() => {
    let interval;
    if (mobileTimer > 0) {
      interval = setInterval(() => {
        setMobileTimer((t) => {
          const next = Math.max(0, t - 1);
          if (next === 0 && mobileOtpSent && !mobileOtpVerified) {
            setMobileExpired(true);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mobileTimer, mobileOtpSent, mobileOtpVerified]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const sendEmailOtpHandler = async () => {
    setServerErrorMessage("");
    setFieldErrors(prev => ({ ...prev, companyName: "", email: "" }));
    setEmailExpired(false);

    if (!isValidCompany) {
      setFieldErrors(prev => ({ ...prev, companyName: "3–100 letters only" }));
      toast.error("Invalid company name");
      return;
    }

    if (!isValidEmail) {
      setFieldErrors(prev => ({ ...prev, email: "Please enter a valid email" }));
      toast.error("Invalid email format");
      return;
    }

    try {
      const res = await sendEmailOtpApi({ email: trimmedEmail });
      setEmailOtpSent(true);
      setEmailTimer(OTP_TIMER);
      setEmailOtp("");
      setEmailExpired(false);
      // alert(`Email OTP (dev): ${res.otp || "—"}`);
    } catch (err) {
      const msg = err?.message || "Failed to send OTP";
      setServerErrorMessage(msg);
      toast.error(msg);
    }
  };

  const verifyEmailOtp = async () => {
    if (emailOtp.length !== 6) return;

    if (emailTimer === 0 || emailExpired) {
      toast.error("OTP has expired. Please request a new one.");
      setEmailExpired(true);
      return;
    }

    try {
      await verifyEmailOtpApi({ email: trimmedEmail, otp: emailOtp });
      setEmailOtpVerified(true);
      setEmailTimer(0);
      setEmailExpired(false);
    } catch (err) {
      toast.error("Invalid or expired OTP");
    }
  };

  const sendMobileOtp = async () => {
    setServerErrorMessage("");
    setFieldErrors(prev => ({ ...prev, mobile: "" }));
    setMobileExpired(false);

    if (!isValidMobile) {
      setFieldErrors(prev => ({ ...prev, mobile: "Exactly 10 digits" }));
      toast.error("Invalid mobile number");
      return;
    }

    try {
      const res = await sendMobileOtpApi({ mobile: trimmedMobile, email: trimmedEmail });
      setMobileOtpSent(true);
      setMobileTimer(OTP_TIMER);
      setMobileOtp("");
      setMobileExpired(false);
      // alert(`Mobile OTP (dev): ${res.otp || "—"}`);
    } catch (err) {
      const msg = err?.message || "Failed to send OTP";
      setServerErrorMessage(msg);
      toast.error(msg);
    }
  };

  const verifyMobileOtp = async () => {
    if (mobileOtp.length !== 6) return;

    if (mobileTimer === 0 || mobileExpired) {
      toast.error("OTP has expired. Please request a new one.");
      setMobileExpired(true);
      return;
    }

    try {
      await verifyMobileOtpApi({ mobile: trimmedMobile, otp: mobileOtp });
      setMobileOtpVerified(true);
      setMobileTimer(0);
      setMobileExpired(false);
    } catch (err) {
      toast.error("Invalid or expired OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrorMessage("");

    if (!isValidCompany || !isValidEmail || !emailOtpVerified || !isValidMobile || !mobileOtpVerified) {
      toast.error("Please complete all verification steps");
      return;
    }

    try {
      const response = await register({
        name: trimmedCompany,
        email: trimmedEmail,
        mobile_no: trimmedMobile,
      });

      toast.success("Account created successfully!");

      navigate("/kyc", {
        state: {
          merchant: {
            id: response?.id || response?.data?.id || response?.merchant_id || response?.merchant?.id,
            name: trimmedCompany,
            email: trimmedEmail,
            mobile: trimmedMobile,
            mobile_no: trimmedMobile,
          },
        },
      });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Registration failed";
      setServerErrorMessage(msg);
      toast.error(msg);
    }
  };

  const handleOtpChange = (e, index, setter, currentOtp) => {
    const value = e.target.value.replace(/\D/, "");
    const newOtp = currentOtp.split("");
    newOtp[index] = value ? value[0] : "";
    setter(newOtp.join(""));

    const refs = setter === setEmailOtp ? emailOtpRefs : mobileOtpRefs;

    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const renderOtpInputs = (otp, setOtp, refs, verifyFn, timer, resendFn, isVerified, expired, channel) => (
    <div className="space-y-3 mt-4">
      <label className="block text-sm font-medium text-gray-700">
        Enter 6-digit code
        {timer > 0 && <span className="text-red-600 ml-2">({formatTime(timer)})</span>}
        {timer === 0 && expired && <span className="text-red-600 ml-2">(Expired)</span>}
      </label>

      <div className="flex gap-2 sm:gap-3 justify-center">
        {Array(6).fill(0).map((_, i) => (
          <input
            key={i}
            ref={el => (refs.current[i] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={otp[i] || ""}
            onChange={e => handleOtpChange(e, i, setOtp, otp)}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
              setOtp(pasted.padEnd(6, ""));
              if (pasted.length === 6 && timer > 0 && !expired) {
                setTimeout(verifyFn, 100);
              }
            }}
            disabled={expired}
            className={`h-11 w-11 sm:h-12 sm:w-12 text-center text-xl font-semibold border rounded-lg outline-none transition ${
              expired
                ? "border-red-400 bg-red-50/60 cursor-not-allowed"
                : "border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-400"
            }`}
            autoFocus={i === 0}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-5">
        <button
          type="button"
          onClick={verifyFn}
          disabled={otp.length !== 6 || isVerified || timer === 0 || expired}
          className={`
            flex-1 py-3 px-5 rounded-xl font-medium text-sm transition
            ${otp.length === 6 && !isVerified && timer > 0 && !expired
              ? "bg-green-600 text-white hover:bg-green-700 shadow-sm"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"}
          `}
        >
          {isVerified 
            ? "Verified ✓" 
            : timer === 0 || expired 
              ? "Time Expired" 
              : "Verify OTP"}
        </button>

        <button
          type="button"
          onClick={resendFn}
          disabled={timer > 0}
          className={`
            flex-1 py-3 px-5 rounded-xl font-medium text-sm transition
            ${timer > 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"}
          `}
        >
          {timer > 0 ? `Resend (${formatTime(timer)})` : "Resend OTP"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${paymentGatewayBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/22 to-black/5" />
      </div>

      {/* Content wrapper */}
      <div className="relative min-h-screen w-full flex items-center justify-center px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16 overflow-y-auto">
        <div 
          className={`
            w-full 
            max-w-md 
            sm:max-w-lg 
            md:max-w-xl 
            lg:max-w-2xl 
            xl:max-w-3xl
            bg-gradient-to-b from-white/98 via-white/96 to-white/93
            backdrop-blur-lg 
            rounded-2xl sm:rounded-3xl lg:rounded-3xl 
            shadow-2xl shadow-black/9 
            border border-gray-100/70 
            overflow-hidden
            transition-all duration-700 ease-out
            ${emailOtpVerified && mobileOtpVerified 
              ? 'scale-[1.012] shadow-green-600/25 border-green-400/60 animate-gentle-glow' 
              : 'hover:shadow-2xl hover:shadow-black/14'}
          `}
        >
          <div className="p-6 sm:p-8 lg:p-10 xl:p-12 space-y-8 lg:space-y-10">

            {/* Header + progress */}
            <div className="text-center space-y-5">
              <div className="inline-block p-2.5 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-xl shadow-sm transition-transform duration-500 hover:scale-105">
                <img
                  src={logo}
                  alt="SPay Logo"
                  className="w-20 sm:w-28 lg:w-32 xl:w-36 h-auto drop-shadow-md transition-all duration-700"
                />
              </div>

              <div>
                <h1 className="
                  text-xl sm:text-2xl 
                  lg:text-3xl xl:text-[2rem]
                  font-extrabold 
                  bg-gradient-to-r from-blue-700 via-blue-500 to-blue-800 
                  bg-clip-text text-transparent 
                  tracking-tight leading-tight
                ">
                  Create Your Account
                </h1>
                <p className="mt-2.5 text-gray-600 text-sm sm:text-base font-medium opacity-90">
                  Fast • Secure • Ready in minutes
                </p>
              </div>

              <div className="w-full max-w-xs mx-auto mt-4">
                <div className="h-1.5 bg-gray-200/70 rounded-full overflow-hidden">
                  <div 
                    className={`
                      h-full rounded-full transition-all duration-900 ease-out
                      ${emailOtpVerified && mobileOtpVerified 
                        ? 'w-full bg-gradient-to-r from-emerald-500 to-green-500' 
                        : emailOtpVerified 
                          ? 'w-2/3 bg-gradient-to-r from-[#12319B] to-[#1299D0]' 
                          : 'w-1/3 bg-gradient-to-r from-[#12319B] to-[#1299D0]'}
                    `}
                    style={{ transition: 'width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium tracking-wide">
                  <span className={emailOtpVerified ? 'text-green-600 font-semibold' : ''}>Ready</span>
                  <span className={mobileOtpVerified ? 'text-green-600 font-semibold' : ''}>Email</span>
                  <span className={(emailOtpVerified && mobileOtpVerified) ? 'text-green-600 font-semibold' : ''}>Mobile</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Company Name */}
              <FloatingInput
                placeholder="Company Name"
                value={formData.companyName}
                onChange={e => setFormData({
                  ...formData,
                  companyName: e.target.value.replace(/[^a-zA-Z\s]/g, ""),
                })}
                required
                error={fieldErrors.companyName || (!isValidCompany && formData.companyName && "3–100 letters only")}
                className="
                  h-13 text-base
                  transition-all duration-200
                  hover:shadow-[0_0_0_1px] hover:shadow-blue-400/40 
                  focus-within:shadow-[0_0_0_3.5px] focus-within:shadow-blue-500/30
                  focus-within:scale-[1.008]
                "
              />

              {/* Email */}
              <FloatingInput
                placeholder={emailOtpSent ? "Check your inbox " : "Business Email"}
                type="email"
                value={formData.email}
                onChange={e => {
                  setFormData({ ...formData, email: e.target.value });
                  setFieldErrors(p => ({ ...p, email: "" }));
                }}
                disabled={emailOtpVerified}
                required
                className={`
                  h-13 text-base
                  transition-all duration-200
                  ${emailOtpVerified
                    ? "border-green-500 bg-green-50/80 text-green-950 shadow-sm shadow-green-300/30"
                    : ""}
                  ${!emailOtpVerified && (fieldErrors.email || (!isValidEmail && formData.email))
                    ? "border-red-500 focus:border-red-500 ring-red-500/30 bg-red-50/45"
                    : "border-gray-300 hover:shadow-[0_0_0_1px] hover:shadow-blue-400/40 focus-within:shadow-[0_0_0_3.5px] focus-within:shadow-blue-500/30 focus-within:scale-[1.008]"}
                `}
              />

              {/* Mobile section – NO +91 prefix anymore */}
              {emailOtpVerified && (
                <div className="space-y-5 animate-fade-in-up">
                  <FloatingInput
                    placeholder={mobileOtpSent ? "Check messages " : "Mobile Number (10 digits)"}
                    type="tel"
                    value={formData.mobile}
                    onChange={e => setFormData({
                      ...formData,
                      mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })}
                    disabled={mobileOtpVerified}
                    required
                    className={`
                      transition-all duration-200
                      ${mobileOtpVerified
                        ? "border-green-500 bg-green-50/80 text-green-950 shadow-sm shadow-green-300/30"
                        : ""}
                      ${!mobileOtpVerified && (fieldErrors.mobile || (!isValidMobile && formData.mobile))
                        ? "border-red-500 focus:border-red-500 ring-red-500/30 bg-red-50/45"
                        : "border-gray-300 hover:shadow-[0_0_0_1px] hover:shadow-blue-400/40 focus-within:shadow-[0_0_0_3.5px] focus-within:shadow-blue-500/30 focus-within:scale-[1.008]"}
                    `}
                  />

                  {/* Send / OTP controls */}
                  {mobileOtpVerified ? null : !mobileOtpSent ? (
                    <button
                      type="button"
                      onClick={sendMobileOtp}
                      disabled={mobileTimer > 0 || !isValidMobile}
                      className={`
                        relative w-full py-3 font-semibold rounded-xl overflow-hidden group
                        transition-all duration-300 shadow-md
                        ${!isValidMobile || mobileTimer > 0
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#12319B] to-[#1299D0] text-white hover:from-blue-650 hover:to-indigo-650 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"}
                      `}
                    >
                      <span className="relative z-10">Send Mobile OTP</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/18 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </button>
                  ) : (
                    renderOtpInputs(
                      mobileOtp,
                      setMobileOtp,
                      mobileOtpRefs,
                      verifyMobileOtp,
                      mobileTimer,
                      sendMobileOtp,
                      mobileOtpVerified,
                      mobileExpired,
                      "mobile"
                    )
                  )}
                </div>
              )}

              {/* Email OTP block */}
              {emailOtpVerified ? null : emailOtpSent ? (
                renderOtpInputs(
                  emailOtp,
                  setEmailOtp,
                  emailOtpRefs,
                  verifyEmailOtp,
                  emailTimer,
                  sendEmailOtpHandler,
                  emailOtpVerified,
                  emailExpired,
                  "email"
                )
              ) : (
                <button
                  type="button"
                  onClick={sendEmailOtpHandler}
                  disabled={emailOtpLoading || emailOtpVerified || !isValidCompany || !isValidEmail}
                  className={`
                    relative w-full py-3 font-semibold rounded-xl overflow-hidden group
                    transition-all duration-300 shadow-md
                    ${!isValidCompany || !isValidEmail || emailOtpLoading
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#12319B] to-[#1299D0] text-white hover:from-blue-650 hover:to-indigo-650 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"}
                  `}
                >
                  <span className="relative z-10">
                    {emailOtpLoading ? "Sending…" : "Send Email OTP"}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/18 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              )}

              {/* Error message */}
              {serverErrorMessage && (
                <div className="bg-red-50/80 border-l-4 border-red-500 p-4 rounded-xl text-red-800 text-sm shadow-sm">
                  <strong className="block mb-1">Error</strong>
                  {serverErrorMessage}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !emailOtpVerified || !mobileOtpVerified}
                className={`
                  w-full py-2.5 text-[17px] font-semibold
                  rounded-xl
                  transition-all duration-300
                  bg-gradient-to-r from-[#12319B] to-[#1299D0]
                  hover:brightness-110
                  text-white
                  shadow-lg shadow-blue-600/25
                  active:scale-[0.97]
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-30"/>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Creating…
                    </>
                  ) : (
                    "Create Account"
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/18 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              </button>

            </form>

            <p className="text-center text-sm text-gray-600 pt-4">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/")}
                className="font-semibold text-blue-700 hover:text-blue-800 underline-offset-4 hover:underline transition-colors duration-200"
              >
                Sign in
              </button>
            </p>

          </div>
        </div>
      </div>
    </>
  );
};

export default Register;