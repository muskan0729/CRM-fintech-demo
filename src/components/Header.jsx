import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";

export const Header = ({ onMenuClick }) => {
  const location = useLocation();

  const role = atob(localStorage.getItem("role"));
  const email = localStorage.getItem("email");

  return (
    <nav  className=" h-15 flex items-center justify-between w-full px-4 py-3 bg-white shadow-lg shadow-indigo-500/50">
      
 

    </nav>
  );
};