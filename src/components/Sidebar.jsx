import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/sidebar.css";
import Logo from "../images/logo.png";

export const Sidebar = ({ open, setOpen }) => {
  const role = atob(localStorage.getItem("role")); // admin / user / crypto
  const [activeDropdown, setActiveDropdown] = useState(null);

  const location = useLocation();
  const currentPath = location.pathname;

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  // MENU CONFIG - unchanged
  const menu = [
    { label: "Dashboard", icon: "fa-chart-pie", link: "/dashboard" },

    ...(role === "admin"
      ? [
          {
            label: "Scheme Manager",
            icon: "fa-money-check",
            dropdown: "scheme",
            items: [{ label: "Scheme", link: "/scheme" }],
          },
          {
            label: "Member",
            icon: "fa-user-group",
            dropdown: "member",
            items: [{ label: "Merchant Onboarding", link: "/member-list" }],
          },
          {
            label: "Fund",
            icon: "fa-piggy-bank",
            dropdown: "fund",
            items: [
              { label: "Load Wallet", link: "/load-wallet" },
              { label: "Payin Settlement", link: "/payin-settlement" },
            ],
          },
          {
            label: "Onboard Bank",
            icon: "fa-building-columns",
            dropdown: "bank",
            items: [{ label: "Bank", link: "/onboard-bank" }],
          },
          {
            label: "Transaction History",
            icon: "fa-clock-rotate-left",
            dropdown: "txn",
            items: [
              { label: "UPI Statement", link: "/upi-statement" },
              { label: "Payout Statement", link: "/payout-statement" },
            ],
          },
          {
            label: "Account Statement",
            icon: "fa-layer-group",
            dropdown: "account",
            items: [
              { label: "Topup Statement", link: "/topup-statement" },
              { label: "Settlement Payin Statement", link: "/settlement-payin-statement" },
            ],
          },
          {
            label: "VPA",
            icon: "fa-money-bill-transfer",
            dropdown: "payment1",
            items: [{ label: "Request1", link: "/vpa" }],
          },
        ]
      : []),

    ...(role === "user"
      ? [
          {
            label: "Payout",
            icon: "fa-credit-card",
            dropdown: "payout",
            items: [{ label: "Request", link: "/payout-request" }],
          },
          {
            label: "Payin",
            icon: "fa-money-bill-transfer",
            dropdown: "payin",
            items: [{ label: "Request", link: "/payin-request" }],
          },
          {
            label: "Transaction History",
            icon: "fa-clock-rotate-left",
            dropdown: "txn",
            items: [
              { label: "UPI Statement", link: "/upi-statement" },
              { label: "Payout Statement", link: "/payout-statement" },
            ],
          },
          {
            label: "Account Statement",
            icon: "fa-layer-group",
            dropdown: "account",
            items: [
              { label: "Topup Statement", link: "/topup-statement" },
              { label: "Settlement Payin Statement", link: "/settlement-payin-statement" },
            ],
          },
          {
            label: "Api Settings",
            icon: "fa-gears",
            dropdown: "api",
            items: [{ label: "Callback & Token", link: "/api-settings" }],
          },
          {
            label: "API Documents",
            icon: "fa-money-check",
            dropdown: "apidoc",
            items: [
              { label: "Payin Documents", link: "/payin-doc" },
              { label: "Payout Documents", link: "/payout-doc" },
            ],
          },
        ]
      : []),
           { 
            label: "Chargeback Statement", 
            icon: "fa-chart-pie", 
            link: "/Chargeback" 
          },
    ...(role === "crypto"
      ? [
          {
            label: "Transaction History",
            icon: "fa-clock-rotate-left",
            dropdown: "txn",
            items: [{ label: "Crypto Statement", link: "/crypto-statement" }],
          },
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

      {/* Sidebar - Light blue theme */}
      <div
        className={`fixed top-0 left-0 h-full w-64 md:w-72 flex flex-col
          bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200
          shadow-2xl shadow-blue-600/20 border-r border-blue-200/60
          z-40 transform transition-transform duration-400 ease-out
          md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"} scrollbar-hide`}
      >
        {/* Mobile Close Button */}
        <button
          className="absolute top-5 right-5 text-blue-700 hover:text-blue-900 transition-colors md:hidden z-10"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <i className="fa-solid fa-xmark text-2xl" />
        </button>

        {/* Logo - Larger size restored */}
        <div className="flex-shrink-0 py-6 px-6 flex justify-center border-b border-blue-200/50">
          <Link to="/dashboard">
            <img
              src={Logo}
              className="w-25 md:w-30 h-auto drop-shadow-md hover:scale-105 transition-transform duration-300"
              alt="Spay Logo"
            />
          </Link>
        </div>

        {/* Menu Items */}
        <ul className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-hide">
          {menu.map((item, i) => {
            const isParentActive =
              item.items?.some((sub) => sub.link === currentPath) ?? false;

            return (
              <li key={i}>
                {/* Simple Menu Item */}
                {!item.dropdown ? (
                  <Link
                    to={item.link}
                    className={`group flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                      ${
                        currentPath === item.link
                          ? "bg-blue-600/10 text-blue-900 font-semibold shadow-sm border-l-4 border-blue-600"
                          : "text-blue-800 hover:bg-blue-100/70 hover:text-blue-900 hover:shadow-md hover:border-l-4 hover:border-blue-500"
                      }`}
                  >
                    <i
                      className={`fa-solid ${item.icon} w-6 text-center text-blue-600 group-hover:text-blue-700 transition-colors`}
                    />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ) : (
                  <>
                    {/* Dropdown Toggle Button */}
                    <button
                      className={`group flex items-center gap-3.5 w-full px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                        ${
                          isParentActive || activeDropdown === item.dropdown
                            ? "bg-blue-600/8 text-blue-900 font-medium shadow-sm border-l-4 border-blue-500"
                            : "text-blue-800 hover:bg-blue-100/70 hover:text-blue-900 hover:shadow-md hover:border-l-4 hover:border-blue-500"
                        }`}
                      onClick={() => toggleDropdown(item.dropdown)}
                    >
                      <i
                        className={`fa-solid ${item.icon} w-6 text-center text-blue-600 group-hover:text-blue-700 transition-colors`}
                      />
                      <span className="flex-1 text-left text-sm">{item.label}</span>

                      <svg
                        className={`w-3 h-3 transition-transform duration-300 ${
                          activeDropdown === item.dropdown ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    </button>

                    {/* Dropdown Content */}
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden
                        ${activeDropdown === item.dropdown ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0 mt-0"} scrollbar-hide`}
                    >
                      <div className="space-y-1 py-1 pl-2">
                        {item.items.map((sub, j) => {
                          const isActive = currentPath === sub.link;

                          return (
                            <Link key={j} to={sub.link}>
                              <div
                                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer
                                  ${
                                    isActive
                                      ? "bg-blue-50 text-blue-900 font-medium border-l-4 border-blue-500"
                                      : "text-blue-700 hover:bg-blue-100/80 hover:text-blue-900 hover:border-l-4 hover:border-blue-500"
                                  }`}
                              >
                                <i
                                  className={`fa-solid fa-circle text-[7px] ${
                                    isActive ? "text-blue-600" : "text-blue-300"
                                  }`}
                                />
                                {sub.label}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="px-4 py-3 text-xs text-blue-600/70 text-center border-t border-blue-200/50">
          SPay Fintech Pvt Ltd Dashboard • {new Date().getFullYear()}
        </div>
      </div>
    </>
  );
};