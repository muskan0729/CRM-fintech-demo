// src/pages/Login.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import paymentGatewayBg from "../images/login-background.jpg";
import { usePost } from "../hooks/usePost";
import { ConfirmModal } from "../components/ConfirmModal";
import { setSafeItem, getSafeItem, removeSafeItem } from "../utils/localSecure";

const DASHBOARD_LOCK_KEY = "payment_dashboard_logged_in";

// Unique ID per tab
const TAB_ID =
  sessionStorage.getItem("tabId") ||
  (() => {
    const id = crypto.randomUUID();
    sessionStorage.setItem("tabId", id);
    return id;
  })();

// FloatingInput – same as before
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
          peer w-full h-13 px-4 rounded-xl text-base border
          bg-white text-gray-900 text-sm leading-tight
          focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${noFloat ? "py-2.5" : "pt-6 pb-2"}
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
              : "border-gray-300 focus:border-blue-600 focus:ring-blue-500/20"
          }
          ${className}
        `}
      />

      {!noFloat && (
        <label
          className={`
            absolute left-3.5 pointer-events-none transition-all duration-200 text-sm
            ${
              hasValue || props.autoFocus
                ? "top-2 text-xs font-medium"
                : "top-3.5 text-gray-500"
            }
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

function LoginForm() {
  const [prekycmodal, setprekycmodal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // const [formData, setFormData] = useState({ mobile_no: "", password: "" });
    const [formData, setFormData] = useState({ login_id: "", password: "" });


  const navigate = useNavigate();
  const channelRef = useRef(null);

  const [modalHeading, setModalHeading] = useState("");
  const [modalBody, setModalBody] = useState("");

  const { execute: login, loading, error } = usePost("/login");

  useEffect(() => {
    if (!window.BroadcastChannel) return;
    const channel = new BroadcastChannel("dashboard_login_channel");
    channelRef.current = channel;

    channel.onmessage = (event) => {
      if (event.data.type === "LOGIN") {
        alert("Another logged in from a different tab!");
        navigate("/");
      }
    };

    return () => channel.close();
  }, [navigate]);

  useEffect(() => {
    const handleUnload = () => {
      const lock = JSON.parse(localStorage.getItem(DASHBOARD_LOCK_KEY) || "{}");
      if (lock.tabId === TAB_ID) {
        localStorage.removeItem(DASHBOARD_LOCK_KEY);
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

const handleChange = (e) => {
  const { name, value } = e.target;
  
  setFormData({
    ...formData,
    [name]: value,
  });
  // if (name === "mobile_no") {
  //   // Allow only numbers and max 10 digits
  //   const cleanedValue = value.replace(/\D/g, "").slice(0, 10);

  //   setFormData({
  //     ...formData,
  //     [name]: cleanedValue,
  //   });
  // } else {
  //   setFormData({
  //     ...formData,
  //     [name]: value,
  //   });
  // }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // const response = await login(formData);
      const payload = {
  username: formData.login_id,
  password: formData.password
};

const response = await login(payload);
      if (response) {
        const user = response.user;
        localStorage.setItem("token", response.token);
        localStorage.setItem("email", btoa(response.user.mobile_no));
        localStorage.setItem("login_id", response.user.login_id);
        localStorage.setItem("role", btoa(response.user.role_type));
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("user_id", JSON.stringify(response.user.id));

 
        // setSafeItem("token", response.token);
        // setSafeItem("email", response.user.mobile_no);
        // setSafeItem("login_id", response.user.login_id);
        // setSafeItem("role", btoa(response.user.role_type));
        // setSafeItem("user", JSON.stringify(response.user));

        localStorage.setItem(
          DASHBOARD_LOCK_KEY,
          JSON.stringify({ userId: response.user.id, tabId: TAB_ID })
        );

        channelRef.current?.postMessage({
          type: "LOGIN",
          userId: response.user.id,
        });

      if (user.role_type === "admin") {
        navigate("dashboard", { replace: true });
        return;
      }

        if (user.kyc === 1 && user.pre_kyc === 1) {
          navigate("/dashboard", { replace: true });
        } else if (user.kyc === 0 && user.pre_kyc === 0) {
          alert("Please complete KYC first!");
          navigate("/kyc", { replace: true, state: { 
                merchant: {
                id: user.id,
                name: user.name,
                email: user.email,
                mobile_no: user.mobile_no,
              },
              token: response.token,
              from: "login",
            } });
        } else if (user.pre_kyc === 1 && user.kyc === 0) {
          setModalHeading(
            user.kyc_rejected === 1 ? "KYC Rejected" : "KYC Pending Approval"
          );
          setModalBody(
            user.kyc_rejected === 1
              ? "Your KYC has been rejected by the admin. Please contact support or re-submit your documents."
              : "Your KYC has been submitted successfully. Please wait up to 24 hours for admin approval."
          );
          setprekycmodal(true);
        }
      }
    } catch (err) {
      console.log("Login failed:", err);
        if (/^\d+$/.test(formData.login_id)) {
    alert("Please login using your email.");
  }
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${paymentGatewayBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/22 to-black/5" />
      </div>

      <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8 overflow-y-auto">
        <div
          className={`
            w-full max-w-[340px] sm:max-w-[360px]
            bg-gradient-to-b from-white/98 via-white/96 to-white/93
            backdrop-blur-lg 
            rounded-3xl
            shadow-2xl shadow-black/10
            border border-gray-100/70
            overflow-hidden
          `}
        >
          {/* <div className="px-3 py-6 sm:px-4 sm:py-7 space-y-6"> */}
          <div className="px-4 py-5 sm:px-5 sm:py-7 space-y-6">


            <div className="text-center space-y-3">
              <div className="inline-block p-2 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-xl shadow-sm transition-transform duration-500 hover:scale-105">
                <img
                  src={logo}
                  alt="SPay Logo"
                  className="w-16 sm:w-20 lg:w-22 h-auto drop-shadow-md transition-all duration-700"
                />
              </div>

              <div>
                <h1
                  className="
                  text-xl font-extrabold
                  bg-gradient-to-r from-blue-700 to-blue-500
                  bg-clip-text text-transparent
                  tracking-tight
                "
                >
                  Sign In to Your Account
                </h1>

                <p className="mt-1.5 text-gray-600 text-sm font-medium opacity-90">
                  Secure • Fast • Trusted
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field – now 80% width, centered */}
              <div className="w-[92%] mx-auto">
                <FloatingInput
                  placeholder="Business Email"
                  type="text"
                  name="login_id"
                  value={formData.login_id}
                  onChange={handleChange}
                  required
                  error={error?.errors?.login_id}
                  className="
                    h-13 text-base
                    transition-all duration-200
                    hover:shadow-md
                    focus-within:shadow-lg
                    mt-2
                  "
                />
              </div>

              {/* Password field – 80% width, centered */}
              {/* <div className="w-full relative"> */}
              <div className="w-[92%] mx-auto relative">

                <FloatingInput
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  error={error?.errors?.password}
                  className="
                    h-13 text-base pr-11
                    transition-all duration-200
                    hover:shadow-md
                    focus-within:shadow-lg
                    mt-2
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[52%] -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium z-10"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {error && !error.errors && (
                <div className="bg-red-50/80 border-l-4 border-red-500 p-3.5 rounded-xl text-red-800 text-sm shadow-sm mx-auto w-[80%]">
                  <strong className="block mb-1">Error</strong>
                  {error.message || "Login failed. Please try again."}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-[92%] mx-auto block
                  py-2.5 text-[15px] font-semibold
                  rounded-xl
                  transition-all duration-300
                  bg-gradient-to-r from-[#12319B] to-[#1299D0]
                  hover:brightness-110
                  text-white
                  shadow-lg shadow-blue-600/25
                  active:scale-[0.97]
                "
              >
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="opacity-30"
                        />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/18 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 pt-2">
              New to SPay?{" "}
              <button
                onClick={() => navigate("/register")}
                className="font-semibold text-blue-700 hover:text-blue-800 underline-offset-4 hover:underline transition-colors duration-200"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        showConfirmModal={prekycmodal}
        handleConfirmModal={setprekycmodal}
        action={() => {
          setprekycmodal(false);
          navigate("/");
        }}
        heading={modalHeading}
        body={modalBody}
        confirmText="OK"
        showCancel={false}
      />
    </>
  );
}

export default LoginForm;
