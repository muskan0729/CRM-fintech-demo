// src/pages/Login.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo_crown.png";
import paymentGatewayBg from "../images/logo_bg.png";
import { usePost } from "../hooks/usePost";
import {  toast } from "sonner";

import Kyc_demo from "./Kyc_demo";

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

        localStorage.setItem(
          DASHBOARD_LOCK_KEY,
          JSON.stringify({ userId: response.user.id, tabId: TAB_ID })
        );

        channelRef.current?.postMessage({
          type: "LOGIN",
          userId: response.user.id,
        });

      if (user.role_type === "admin") {
        navigate("home", { replace: true });
        return;
      }

        if (user.kyc === 1 && user.pre_kyc === 1) {
          toast.success("Login successful 🎉");
          navigate("/home", { replace: true });
        } else if (user.kyc === 0 && user.pre_kyc === 0) {
          alert("Please complete KYC first!");
          navigate("/Kyc_demo", { replace: true, state: { 
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
  toast.info(
    user.kyc_rejected === 1
      ? "KYC Rejected. Please re-submit documents."
      : "KYC Pending. Wait for approval."
  );
}
      }
    } catch (err) {
  console.log("Login failed:", err);

  if (/^\d+$/.test(formData.login_id)) {
    toast.error("Please login using your email");
  } else {
    toast.error("Invalid credentials");
  }
}
  };

  // return (
  return (
  <div style={{ display: "flex", height: "100vh", fontFamily: "Inter, Arial" ,overflow: "hidden" ,flexDirection: window.innerWidth < 768 ? "column" : "row"}}>

    {/* LEFT SIDE (Banner) */}
  <div
  style={{
    flex: 1,
    background: "var(--bg-color)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    display: window.innerWidth < 768 ? "none" : "flex", // 👈 hide on mobile

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
<div
  style={{
    flex: 1,
    background: "#f9fafb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem"
  }}
>

<div
  style={{
    width: "100%",
    maxWidth: "500px",     // thoda bada for better balance
    padding: "2rem",
    borderRadius: "12px",
    boxSizing: "border-box",
  }}
>

        {/* Logo */}
        <div style={{ display: "flex",   justifyContent: "center", marginBottom: "20px"}}>
          <img 
          src={logo} 
          alt="company logo" style={{ width: "140px",  textAlign:"center"}} />
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
            onClick={() => navigate("/Kyc_demo")}
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
