import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { ProfileSidebar } from "./ProfileSidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="">
      {/* Sidebar — visible fixed on desktop, overlay on mobile */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
     

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 
        ${sidebarOpen ? "md:ml-64" : "ml-0 md:ml-64"}
        ${profileOpen ? "md:mr-64" : "mr-0"}`}
        
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white">
          <Header onMenuClick={() => setSidebarOpen(true)} 
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
