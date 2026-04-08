import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { ProfileSidebar } from "./ProfileSidebar";
import { useGet } from "../hooks/useGet";
import useAutoFetch from "../hooks/useAutoFetch";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: merchantData } = useGet("/show-merchant");
 const { data } = useAutoFetch("/collection-cashfree");
 const Payoutwallet = data?.payout_balance ?? "0.00";
const payingAmount = merchantData?.data?.payin_wallet ?? "0.00";
// const Payoutwallet = merchantData?.payout_wallet ?? "0.00";
const PayinRollingAmount = merchantData?.data?.rolling_amount ?? "0.00";
const PayinTotalCharges = merchantData?.data?.total_charges ?? "0.00";
  const [role, setRole] = useState(atob(localStorage.getItem("role"))); // admin / user / crypto
const mid = merchantData?.data?.mid ?? "N/A";

const openProfile = () => {
  setProfileOpen(true);
};

  return (
    <div className="">
      {/* Sidebar — visible fixed on desktop, overlay on mobile */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}    openProfile={openProfile}  />
     <ProfileSidebar
  open={profileOpen}
  onClose={() => setProfileOpen(false)}
    data={merchantData?.data}
  role={role}
  payingAmount={payingAmount}
  Payoutwallet={Payoutwallet}   // ✅ IMPORTANT
  PayinRollingAmount={PayinRollingAmount}
  PayinTotalCharges={PayinTotalCharges}
  mid={mid}
/>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 
        ${sidebarOpen ? "md:ml-64" : "md:ml-0"}
        ${profileOpen ? "md:mr-64" : "mr-0"}`}
        
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white">
          <Header onMenuClick={() => setSidebarOpen(prev => !prev)} 
            onProfileClick={() => setProfileOpen(true)}
            onProfileClose={() => setProfileOpen(false)}
            />
        </div>
        


        {/* Main Body */}
        <main className="flex-1 px-6 py-6  md:relative top-[80px] w-full h-[calc(100vh-80px)] md:h-auto md:static md:overflow-y-visible overflow-y-auto overflow-x-hidden md:overflow-x-visible">
          <div className="
          // bg-[#d5f5f2] 
          bg-white
          shadow-md  rounded-lg w-full px-2">
            <Outlet />
          </div>
        </main>
      </div>
        {/* <ProfileSidebar open={profileOpen} setOpen={setProfileOpen} /> */}
        
    </div>
  );
};

export default Layout;
