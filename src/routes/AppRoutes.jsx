import { Routes, Route } from "react-router-dom";

import Scheme from "../pages/Scheme";
import Loadwallet from "../pages/LoadWallet";
import Payinsettlement from "../pages/PayinSettlement";
import Payoutrequest from "../pages/Payoutrequest";
import LoginForm from "../pages/LoginForm";
import { MemberOnboardForm } from "../pages/MemberOnboardForm";
import { Member } from "../pages/Member";
import { Dashboard } from "../pages/Dashboard";
import UpiStatement from "../pages/UpiStatement";
import CryptoStatement from "../pages/CryptoStatement";
import PayoutStatement from "../pages/PayoutStatement";
import { ViewComplain } from "../pages/ViewComplain";
import OnboardBank from "../pages/OnboardBank";
import { PayinRequest } from "../pages/PayinRequest";
import Payindoc from "../pages/payindoc";
import Acc_upi_setlement from "../pages/Acc_upi_setlement";
import Acc_topup_settlement from "../pages/Acc_topup_settlement";
import PayoutDoc from "../pages/PayoutDoc";
import ApiSetting from "../pages/ApiSetting";
import FileUpload from "../pages/FileUpload";
import { Profile } from "../pages/Profile";
import Layout from "../components/Layout";
import PrivateRoute from "../components/PrivateRoute";
import MerchantDetails from "../pages/MerchantDetails";
import PublicLayout from "../components/PublicLayout";
import Register from "../pages/Register";
import { Kyc } from "../pages/Kyc";
import { VerifyMerchant } from "../pages/VerifyMerchant";
import { PendingVerificationModal } from "../components/PendingVerificationModal";
import Chargeback from "../pages/Chargeback";
import VpaToIntent from "../pages/vpa_to_intent";    


const AppRoutes = () => {
    return(
        
        <Routes>
 
<Route element={<PublicLayout />}>
    <Route 
      path="/register" 
      element={<Register  />} 
    />

  </Route>
    <Route 
      path="/kyc" 
      element={<Kyc  />} 
    />
        <Route 
      path="/PendingVerificationModal" 
      element={<PendingVerificationModal  />} 
    />
                 {/* <Route
                    path="/member-create"
                    element={
                        <MemberOnboardForm />
                    }
                />  */}

            <Route path="/" element={<LoginForm />} />
            <Route element={<Layout />}>
             {/* <Route 
                path="/kyc" 
                element={
                 
                            <Kyc  />          
                } 
                /> */}
           

                <Route 
                    path="/profile" 
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />
                <Route 
                    path="/dashboard" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                 <Route path="/Chargeback" element={  <PrivateRoute><Chargeback/></PrivateRoute>}/>
                <Route
                    path="/payout-request"
                    element={
                        <PrivateRoute>
                            <Payoutrequest />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/payin-request"
                    element={
                        <PrivateRoute>
                            <PayinRequest />
                        </PrivateRoute>
                    }
                />

  
                <Route 
                    path="/scheme"
                    element={
                        <PrivateRoute role={"admin"}>
                            <Scheme />
                        </PrivateRoute>
                    } 
                />
               
                <Route
                    path="/load-wallet"
                    element={
                    <PrivateRoute role={"admin"}>
                        <Loadwallet />
                    </PrivateRoute>
                    }
                />

                
                <Route
                    path="/payin-settlement"
                    element={
                    <PrivateRoute role={"admin"}>
                        <Payinsettlement />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/member-list"
                    element={
                    <PrivateRoute role={"admin"}>
                        <Member />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/member-create"
                    element={
                    <PrivateRoute role={"admin"}>
                        <MemberOnboardForm />
                    </PrivateRoute>
                    }
                />
              
                <Route
                path = "/MerchantDetails/:id"
                element = {
                    <PrivateRoute role = {"admin"}>
                        <MerchantDetails />
                    </PrivateRoute>
                }
                />
                                <Route
                path = "/VerifyMerchant/:id"
                element = {
                    <PrivateRoute role = {"admin"}>
                        <VerifyMerchant />
                    </PrivateRoute>
                }
                />
                <Route
                    path="/upi-statement"
                    element={
                    <PrivateRoute>
                        <UpiStatement />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/payout-statement"
                    element={
                    <PrivateRoute>
                        <PayoutStatement />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/crypto-statement"
                    element={
                    <PrivateRoute>
                        <CryptoStatement />
                    </PrivateRoute>
                    }
                />
                <Route
  path="/file-upload"
  element={
    <PrivateRoute>
      <FileUpload />
    </PrivateRoute>
  }
/>
                <Route
                    path="/view-complain"
                    element={
                    <PrivateRoute>
                        <ViewComplain />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/onboard-bank"
                    element={
                    <PrivateRoute role={"admin"}>
                        <OnboardBank />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/payin-doc"
                    element={
                    <PrivateRoute role={"user"}>
                        <Payindoc />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/payout-doc"
                    element={
                    <PrivateRoute role={"user"}>
                        <PayoutDoc />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/topup-statement"
                    element={
                    <PrivateRoute>
                        <Acc_topup_settlement />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/settlement-payin-statement"
                    element={
                    <PrivateRoute>
                        <Acc_upi_setlement />
                    </PrivateRoute>
                    }
                />
                <Route
                    path="/api-settings"
                    element={
                    <PrivateRoute>
                        <ApiSetting />
                    </PrivateRoute>
                    }
                /> 
            </Route>

                          <Route
                    path="/vpa"
                    element={
                        // <PrivateRoute>
                            <VpaToIntent />
                        // </PrivateRoute>
                    }
                />
        </Routes>
        
    )
}

export default AppRoutes;