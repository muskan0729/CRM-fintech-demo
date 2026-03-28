import { Link, useNavigate } from "react-router-dom";
import { usePost } from "../hooks/usePost";
import { useState, useEffect, useRef } from "react";
import { setSafeItem, getSafeItem, removeSafeItem } from "../utils/localSecure";

export const ProfileSidebar = ({
  open,
  onClose,
  data,
  role,
  payingAmount,
  Payoutwallet,
  PayinTotalCharges,
  PayinRollingAmount

}) => {
  const [PayAmountVisible, setPayAmountVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const { execute: logoutApi } = usePost("/logout");
  const sidebarRef = useRef(null);

  const DASHBOARD_LOCK_KEY = "payment_dashboard_logged_in";

  const handleLogout = async () => {
    if (!showLogoutConfirm) {
      setShowLogoutConfirm(true);
      return;
    }

    setIsLoggingOut(true);
    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      localStorage.removeItem(DASHBOARD_LOCK_KEY);
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      sessionStorage.removeItem("tabId");
      localStorage.removeItem("dashboard_status_filter"); 

      if (window.BroadcastChannel) {
        const channel = new BroadcastChannel("dashboard_login_channel");
        channel.postMessage({ type: "LOGOUT" });
        channel.close();
      }

      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
      onClose();
      navigate("/", { replace: true });
      window.location.reload();
    }
  };

  // New handler to close modal when clicking backdrop
  const closeLogoutModal = () => {
    setShowLogoutConfirm(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setPayAmountVisible(false);
  }, [open]);

  // Blur left sidebar only
  useEffect(() => {
    const leftSidebar = document.querySelector('[data-testid="left-sidebar"]') || 
                       document.querySelector('.fixed.left-0.h-full.w-64, .fixed.left-0.h-full.w-72') ||
                       document.querySelector('aside.left-sidebar');

    if (open && leftSidebar) {
      leftSidebar.classList.add('blur-md', 'pointer-events-none');
    } else if (leftSidebar) {
      leftSidebar.classList.remove('blur-md', 'pointer-events-none');
    }

    return () => {
      if (leftSidebar) {
        leftSidebar.classList.remove('blur-md', 'pointer-events-none');
      }
    };
  }, [open]);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  // const storedUser = getSafeItem("user");

  const effectiveUser = data && Object.keys(data).length ? data : storedUser;

  const userName =
    effectiveUser?.name?.trim() ||
    (effectiveUser?.email ? effectiveUser.email.split("@")[0] : "User");

  const displayName = userName
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  const displayEmail = effectiveUser?.email?.trim() || "No email available";
  const displayInitial = displayName.charAt(0).toUpperCase() || "U";

  return (
    <>
      {/* Profile Sidebar Backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-45 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Profile Sidebar */}
      <div
        ref={sidebarRef}
        onClick={(e) => e.stopPropagation()}
        className={`
          fixed top-0 right-0 w-72 md:w-80 h-full z-50
          bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200
          shadow-2xl shadow-blue-600/30
          transform overflow-y-auto transition-all duration-400 ease-out
          ${open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}
          flex flex-col rounded-l-2xl border-l border-blue-300/40
        `}
        role="dialog"
        aria-modal="true"
        aria-label="User Profile Sidebar"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-blue-700 hover:text-blue-900 transition-colors duration-200 z-10"
          aria-label="Close sidebar"
        >
          <i className="fa-solid fa-xmark text-2xl" />
        </button>

        <div className="px-7 py-10 border-b border-blue-300/40 bg-gradient-to-r from-blue-600/5 to-transparent">
          <div className="flex flex-col items-center text-center gap-4">
            <div
              className="w-20 h-20 rounded-full overflow-hidden shadow-lg shadow-blue-500/40 ring-2 ring-blue-400/60 transition-all duration-300 hover:ring-blue-500 hover:shadow-blue-600/50"
              style={{
                background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
              }}
            >
              {data?.profile_image ? (
                <img
                  src={data.profile_image}
                  alt={`Profile of ${displayName}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-3xl tracking-wide">
                  {displayInitial}
                </div>
              )}
            </div>

            <div>
              <p className="text-xl font-bold text-blue-900 tracking-tight">
                {displayName}
              </p>
              <p className="text-sm text-blue-700 mt-1 opacity-90 truncate max-w-[240px]">
                {displayEmail}
              </p>
            </div>
          </div>
        </div>

        {role !== "admin" && (
          <div className="px-7 py-7 border-b border-blue-300/40">
            <p className="text-xs font-semibold text-blue-600 uppercase mb-5 tracking-wider">
              Wallet Balance
            </p>
            <div className="flex items-center justify-between text-base text-blue-900 mb-2">
              <span className="font-medium">Payin Wallet</span>
              <div className="flex items-center gap-4">
                <span className={`font-bold transition-all duration-300 ${PayAmountVisible ? "text-emerald-600 scale-105" : "text-blue-800 blur-sm"}`}>
                  {PayAmountVisible ? `₹${payingAmount || "0.00"}` : "•••••••"}
                </span>
                <button
                  onClick={() => setPayAmountVisible(!PayAmountVisible)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  aria-label={PayAmountVisible ? "Hide amount" : "Show amount"}
                >
                  <i className={`fa-solid ${PayAmountVisible ? "fa-eye-slash" : "fa-eye"} text-lg`} />
                </button>
              </div>



            </div>
            <div className="flex items-center justify-between text-base text-blue-900 mb-2">
  <span>Payin Rolling</span>
  <span>{PayinRollingAmount}</span>
  </div>
  <div className="flex items-center justify-between text-base text-blue-900 mb-2">
  <span>Payin Total Chanrges</span>
  <span>{PayinTotalCharges}</span>
  </div>
          </div>
        )}

        <div className="px-7 py-8 flex flex-col gap-4 flex-grow">
          {role !== "admin" && (
            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-4 px-5 py-4 rounded-xl bg-white/60 hover:bg-white/80 border border-blue-200 hover:border-blue-400 text-blue-800 hover:text-blue-900 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <i className="fa-solid fa-user text-blue-600 text-xl" />
              <span className="font-medium">My Profile</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-auto flex items-center justify-center gap-4 px-5 py-4 rounded-xl bg-red-50/80 hover:bg-red-100 border border-red-200 hover:border-red-400 text-red-700 hover:text-red-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <i className="fa-solid fa-right-from-bracket text-red-600 text-xl" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>

        <div className="px-7 py-5 text-center text-xs text-blue-600/70 border-t border-blue-300/40 mt-auto">
          SPay Fintech Pvt Ltd Dashboard • © 2026
        </div>
      </div>

      {/* Logout Confirmation Modal - with backdrop click to close */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md transition-opacity duration-300"
          onClick={closeLogoutModal}  // ← This closes when clicking outside the modal box
        >
          {/* Stop propagation so clicking inside modal doesn't close it */}
          <div 
            className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md mx-4 shadow-2xl border border-blue-100/50 transform scale-100 transition-all duration-300 ease-out animate-in fade-in zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 mt-0.5">
                <i className="fa-solid fa-triangle-exclamation text-yellow-500 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-900 mb-1">Confirm Sign Out</h3>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Are you sure you want to log out? You'll need to sign in again to access your account.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {isLoggingOut && <i className="fa-solid fa-spinner fa-spin w-4 h-4" />}
                {isLoggingOut ? "Signing out..." : "Yes, Sign Out"}
              </button>
              <button
                onClick={closeLogoutModal}
                className="flex-1 py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-all duration-200 border border-blue-200 hover:border-blue-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};