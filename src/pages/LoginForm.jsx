// src/pages/Login.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import paymentGatewayBg from "../images/logo_bg.png";
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

  // return (
  return (
  <div style={{ display: "flex", height: "100vh", fontFamily: "Inter, Arial" }}>

    {/* LEFT SIDE (Banner) */}
  <div
  style={{
    flex: 1,
    background: "var(--bg-color)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  }}
>
  <img
    src={paymentGatewayBg} // 
    // src="https://png.pngtree.com/element_our/png/20181102/2.5d-fintech-scene-png_221192.jpg"
    alt="banner"
    style={{
      width: "80%",
      height: "80%",
      objectFit: "contain" // important for full cover
    }}
  />
</div>

    {/* RIGHT SIDE (Login Form) */}
    <div style={{
      flex: 1,
      background: "#f9fafb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>

      <div style={{
        width: "100%",
        maxWidth: "400px",
        background: "#fff",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img 
          // src={logo} 
        src="data:image/png;base64,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"

          alt="company logo" style={{ width: "100px" }} />
        </div>

        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
          Log in to get started
        </h2>

        <p style={{
          textAlign: "center",
          fontSize: "14px",
          color: "#6b7280",
          marginBottom: "20px"
        }}>
          Please enter your details
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

          <FloatingInput
            placeholder="User ID"
            name="login_id"
            value={formData.login_id}
            onChange={handleChange}
            required
          />

          <div style={{ position: "relative" }}>
            <FloatingInput
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "12px",
                color: "#555"
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--bg-submit)",
              color: "#fff",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer"
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <button
            onClick={() => navigate("/register")}
            style={{
              background: "none",
              border: "none",
              color: "#0f5fa5",
              cursor: "pointer"
            }}
          >
            Create an account
          </button>
        </div>

      </div>
    </div>
  </div>
);
  // );
}

export default LoginForm;
