import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // ✅ add useLocation
import { usePost } from "../hooks/usePost";
import useAutoFetch from "../hooks/useAutoFetch";
import { useGet } from "../hooks/useGet";
import { ProfileSidebar } from "./ProfileSidebar";

export const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ get current route
  const { execute: logout } = usePost("/logout");
  const { data } = useAutoFetch("/collection-cashfree");
  const { data: merchantData } = useGet("/show-merchant");

  // console.log("payin data : ", merchantData);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [activeStat, setActiveStat] = useState(null);

  // payin wallet

  const payingAmount = merchantData?.data?.payin_wallet ?? "0.00";
  const Payoutwallet = merchantData?.payout_wallet ?? "0.00";
   const PayinRollingAmount = merchantData?.data?.rolling_amount ?? "0.00";
    const PayinTotalCharges = merchantData?.data?.total_charges ?? "0.00";
// console.log(PayinRollingAmount);
  // State for role
  const [role, setRole] = useState(atob(localStorage.getItem("role"))); // admin / user / crypto
  const email = localStorage.getItem("email");

  // ✅ Show button only for specific email AND only on dashboard page
  const showButton =
    email === "saad.sayyed@example.com" && location.pathname === "/dashboard";

  const userStats = [
    {
      id: 1,
      icon: "fa-solid fa-arrow-trend-up text-green-400",
      label: "Payin Rolling Amount",
      value: `${Number(data?.PayinRollingAmount ?? 0).toFixed(2)}`,
    },
    {
      id: 2,
      icon: "fa-solid fa-arrow-trend-up text-green-400",
      label: "Payin Total Charges",
      value: `${Number(data?.PayinProfitAmount ?? 0).toFixed(2)}`,
    },
    {
      id: 3,
      icon: "fa-solid fa-wallet text-red-400",
      label: "Payout Wallet",
      value: `${Number(data?.payout_wallet ?? 0).toFixed(2)}`,
    },
    {
      id: 4,
      icon: "fa-solid fa-wallet text-green-400",
      label: "Payin Wallet",
      value: `${Number(data?.PayingAmount ?? 0).toFixed(2)}`,
    },
  ];


  return (
    <nav className="flex items-center justify-between w-full px-4 py-3 bg-white shadow-lg shadow-indigo-500/50">
      {/* left side buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-2xl text-blue-600"
        >
          ☰
        </button>

          {/* {role === "user" && (
    <div className="hidden lg:flex items-center gap-6 ml-6">
      {userStats.map((stat) => (
        <div
          key={stat.id}
          className="flex items-center gap-2 text-sm font-medium text-gray-700"
        >
          <i className={stat.icon}></i>
          <span>{stat.label}:</span>
          <span className="font-semibold text-gray-900">
            ₹{stat.value}
          </span>
        </div>
      ))}
    </div>
  )} */}
      </div>

      {/* right side */}
      

    
      <div className="flex items-center justify-end gap-4">
        {/* {role === "admin" && ( */}
        <div className="text-gray-800 font-semibold flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2m14 0v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9h14z"
            />
          </svg>

          <span>Payout Wallet:</span>

          <span>
            ₹
            {Number(
              role === "admin" ? data?.payout_balance : data?.payout_balance
            ).toFixed(2)}
          </span>
        </div>
{/* )} */}
        {/* Profile Icon */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center focus:outline-none"
          >
            <img
              className="w-10 h-10 rounded-full border"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRduYoJopcD2_WmDjt978P3pjTLl-oQX-ZsTOaof805POhNgFzpYEy5LnA&s"
              alt="profile"
            />
          </button>
        </div>
      </div>
  
      {/* Profile Sidebar */}
      <ProfileSidebar
        open={open}
        onClose={() => setOpen(false)}
        data={merchantData?.data}
        role={role}
        payingAmount={payingAmount}
        PayinRollingAmount = {PayinRollingAmount}
        PayinTotalCharges = {PayinTotalCharges}
      />
    </nav>
  );
};
