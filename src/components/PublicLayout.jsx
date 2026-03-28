import React from 'react'
import { Outlet } from 'react-router-dom'
import paymentGatewayBg from "../images/login-background.jpg";

const PublicLayout = () => {
  return (
<div
  className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-6"
  // style={{ backgroundImage: `url(${paymentGatewayBg})` }}
>

      <div className="rounded-lg shadow-lg overflow-hidden"
      >
        <Outlet />
      </div>
    </div>
  )
}

export default PublicLayout