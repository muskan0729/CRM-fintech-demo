import { useState,useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/sidebar.css";
import Logo from "../images/logo.png";

export const Sidebar = ({ open, setOpen,openProfile }) => {
  const role = atob(localStorage.getItem("role")); // admin / user / crypto
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
const [openMenu, setOpenMenu] = useState(null);

  const location = useLocation();
  const currentPath = location.pathname;


  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };


  // MENU CONFIG - unchanged
const menu = [
  { label: "Home", icon: "fa-chart-pie", link: "/dashboard" },

  ...(role === "admin"
    ? [
        { label: "Scheme", icon: "fa-file-invoice-dollar", link: "/scheme" },
        { label: "Merchant Onboarding", icon: "fa-user-plus", link: "/member-list" },
        { label: "Wallet Settlement", icon: "fa-wallet", link: "/load-wallet" },
        // { label: "Payin Settlement", icon: "fa-money-bill-transfer", link: "/payin-settlement" },
        { label: "Bank", icon: "fa-building-columns", link: "/onboard-bank" },
        // { label: "VPA", icon: "fa-at", link: "/vpa" },
      ]
    : []),

  ...(role === "user"
    ? [
        {
          label: "Payin Request",
          icon: "fa-arrow-down", // money coming in
          link: "/payin-request",
        },
        {
          label: "Payout Request",
          icon: "fa-arrow-up", // money going out
           link: "/payout-request",
          // children: [
          //   { label: "Payout Request", link: "/payout-request" },
          // ],
        },
      ]
    : []),

  // ✅ COMMON FOR BOTH
  {
    label: "Transaction History",
    icon: "fa-clock-rotate-left", // history icon
    children: [
      { label: "Payin Statement", icon: "fa-arrow-down", link: "/upi-statement" },
      { label: "Payout Statement", icon: "fa-arrow-up", link: "/payout-statement" },
      { label: "Recharge History", icon: "fa-wallet", link: "/topup-statement" },
      { label: "Payment Settlement", icon: "fa-money-check-dollar", link: "/settlement-payin-statement" },
    ],
  },

  ...(role === "user"
    ? [
        { label: "Webhook Config", icon: "fa-gears", link: "/api-settings" },
        { label: "Payin Documents", icon: "fa-file-lines", link: "/payin-doc" },
        { label: "Payout Documents", icon: "fa-file-lines", link: "/payout-doc" },
      ]
    : []),
];

  return (
    <>
      <style >{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari, and Opera */
        }
      `}</style>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar Toggle Button */}
{/* Sidebar Toggle Button */}
<button
  onClick={() => setOpen(!open)}
className={`fixed top-5 left-5 z-50 p-3 rounded-lg transition-all duration-300
    ${open 
      ? "bg-[var(--bg-color)] text-white shadow-lg" 
      : "bg-transparent text-[var(--bg-color)] shadow-none"}
  `}>
  <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"} text-lg`} />
</button>

      {/* Sidebar - Light blue theme */}
   <div
  className={`fixed top-0 left-0 h-full w-64 md:w-72 flex flex-col
    bg-[var(--bg-color)] text-slate-200
    shadow-xl border-r border-[var(--primary-color)]
    z-40 transform transition-transform duration-300 ease-out
    ${open ? "translate-x-0" : "-translate-x-full"}`}
>
        {/* Mobile Close Button */}
        {/* <button
          className="absolute top-5 right-5 text-white hover:text-gray-300 transition-colors md:hidden z-10"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <i className="fa-solid fa-xmark text-2xl" />
        </button> */}

        {/* Logo - Larger size restored */}
<div className="flex-shrink-0 py-6 px-6 flex justify-center border-b border-[var(--bg-color)]/20">
  <Link to="/dashboard">
    <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
      <img
        // src={Logo}
        src="data:image/png;base64,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"
        className="w-20 md:w-14 object-cover"
        alt="company Logo"
      />
    </div>
  </Link>
</div>

        {/* Menu Items */}
<ul className="flex-1 overflow-y-auto py-4 px-3 space-y-2 scrollbar-hide">
  {menu.map((item, i) => {
    const isOpen = openMenu === i;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <li key={i}>
        
        {/* ✅ IF HAS CHILDREN → DROPDOWN */}
        {hasChildren ? (
          <>
            <div
              onClick={() => setOpenMenu(isOpen ? null : i)}
              className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer text-slate-300 hover:bg-[var(--primary-color)] hover:text-white"
            >
              <div className="flex items-center gap-3.5">
                <i className={`fa-solid ${item.icon} w-6 text-center`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>

              <i className={`fa-solid fa-chevron-${isOpen ? "up" : "down"} text-xs`} />
            </div>

            {isOpen && (
              <ul className="ml-6 mt-2 space-y-1">
                {item.children.map((child, idx) => {
                  const isActive = currentPath === child.link;

                  return (
                    <li key={idx}>
                      <Link
                        to={child.link}
                        className={`block px-3 py-2 rounded-lg text-sm transition
                          ${
                            isActive
                              ? "bg-[#0F4C5C] text-white font-semibold"
                              : "text-slate-400 hover:bg-[var(--primary-color)] hover:text-white"
                          }`}
                      >
                        {child.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : (
          /* ✅ IF NO CHILDREN → DIRECT LINK */
          <Link
            to={item.link}
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-300 hover:bg-[#03535F] hover:text-white"
          >
            <i className={`fa-solid ${item.icon} w-6 text-center`} />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        )}
      </li>
    );
  })}
</ul>

  <div className="px-2 pb-3 border-t border-blue-200/20">
  <button
    onClick={() => {
      setOpen(false);
      openProfile();
    }}
    className="group flex items-center gap-3.5 w-full px-4 py-3 mt-2 rounded-xl
               text-slate-300 hover:bg-[#03535F] hover:text-white 
               transition-all duration-200"
  >
    <i className="fa-solid fa-user w-6 text-center text-slate-300 group-hover:text-white transition-colors" />

    <span className="text-sm font-semibold">
      Profile
    </span>
  </button>

  <div className="text-center text-xs text-slate-400 mt-2">
    Company name • {new Date().getFullYear()}
  </div>
</div>
      </div>
      
    </>
  );
};