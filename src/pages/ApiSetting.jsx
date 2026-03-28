// import React, { useEffect, useState } from "react";
// import { usePost } from "../hooks/usePost";
// import Table from "../components/Table";
// import { useGet } from "../hooks/useGet";
// import { useToast } from "../contexts/ToastContext";
// import { MONTH_NAMES } from "../constants/Constants";

// const ApiSetting = () => {
//   const [activeTab, setActiveTab] = useState("apiToken");
//   const [apiToken, setApiToken] = useState([]);
//   const [showIpModal, setShowIpModal] = useState(false);
// const [ipAddress, setIpAddress] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const Toast = useToast();
//   const [PayinWebHook, setPayinWebHook] = useState("");
//   const [PayoutWebhook,setPayoutWebHook] = useState("");


//   const { execute } = usePost("/generate-token");
//   const endPoint = activeTab === "apiToken" ? "/get-tokens" : "";

//   const { data: apiTokensData, refetch: refetchApiTokens } = useGet(endPoint);
//   const initialDataOfTokens = apiTokensData?.data;

//   // useEffect(() => {
//   //   const formattedMerchantData = initialDataOfTokens?.map((item, index) => ({
//   //     sqno: index + 1,
//   //     id: item.id,
//   //     ip: item.ip,
//   //     token: item.token,
//   //     date:
//   //       new Date(item.created_at).getDate() +
//   //       " " +
//   //       MONTH_NAMES[new Date(item.created_at).getMonth()] +
//   //       " " +
//   //       new Date(item.created_at).getFullYear(),
//   //   }));
//   //   setApiToken(formattedMerchantData || []);
//   // }, [initialDataOfTokens]);

//   useEffect(() => {
//   const formattedMerchantData = initialDataOfTokens
//     ?.map((item, index) => ({
//       sqno: index + 1,
//       id: item.id,
//       ip: item.ip,
//       token: item.token,
//       createdAt: new Date(item.created_at), // keep raw date for sorting
//       date:
//         new Date(item.created_at).getDate() +
//         " " +
//         MONTH_NAMES[new Date(item.created_at).getMonth()] +
//         " " +
//         new Date(item.created_at).getFullYear(),
//     }))
//     ?.sort((a, b) => b.createdAt - a.createdAt); // 🔥 DESCENDING ORDER

//   setApiToken(formattedMerchantData || []);
// }, [initialDataOfTokens]);

//   const tokenTableColumns = [
//     { header: "SQNo", accessor: "sqno" },
//     { header: "IP", accessor: "ip" },
//     { header: "Token", accessor: "token" },
//     { header: "Date", accessor: "date" },
//   ];

// const isValidIP = (ip) => {
//   const ipv4Regex =
//     /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

//   const ipv6Regex =
//     /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1)$/;

//   return ipv4Regex.test(ip) || ipv6Regex.test(ip);
// };

// const handleGenerateToken = async () => {
//   if (!ipAddress) {
//     Toast.error("Please enter IP address");
//     return;
//   }

//   if (!isValidIP(ipAddress)) {
//     Toast.error("Please enter a valid IP address");
//     return;
//   }

//   setIsLoading(true);

//   try {
//     const res = await execute({
//       ip: ipAddress,
//     });

//     if (res.message === "Auth token generated successfully") {
//       Toast.success("Token Generated Successfully");
//       refetchApiTokens();
//       setShowIpModal(false);
//       setIpAddress("");
//     }
//   } catch (err) {
//     console.error("Error generating token:", err);
//     Toast.error("Failed to generate token");
//   } finally {
//     setIsLoading(false);
//   }
// };




// const {data:WebhookUrl, loading:WebHookLoading} = useGet("/show-merchant");
// console.log("show merchant data",WebhookUrl);
// useEffect(()=>{
//   if(WebhookUrl){
//     setPayinWebHook(WebhookUrl?.data?.payin_callback || " ");
//     setPayoutWebHook(WebhookUrl?.data?.payout_callback || " ");
//     // console.log(WebhookUrl?.data?.payin_callback );
//   }
// },[WebhookUrl]);
// const {execute:updateWebhook} =usePost("/update-merchant");
// const handleSaveWebhook = async () => {
//   try {
//     const res = await updateWebhook({
//       payin_callback: PayinWebHook,
//       payout_callback: PayoutWebhook,
//     });

//     if (res?.message === "Merchant updated successfully") {
//       Toast.success("Webhook updated successfully!");
//     }
//   } catch (err) {
//     console.log(err);
//     Toast.error("Failed to update webhook!");
//   }
// };




//   return (
//     <div className="p-6 mx-auto">
// {showIpModal && (
//   <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
//     <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      
//       <h3 className="text-lg font-semibold text-gray-900 mb-4">
//         Generate Token
//       </h3>

//       <div className="mb-4">
//         <label className="block mb-2 text-sm font-medium text-gray-700">
//           IP Address
//         </label>
//         <input
//           type="text"
//           placeholder="Enter IP address"
//           value={ipAddress}
//           onChange={(e) => setIpAddress(e.target.value)}
//           className="w-full p-2.5 text-sm border rounded-lg focus:ring-blue-500 focus:border-blue-500"
//         />
//       </div>

//       <div className="flex justify-end gap-3">
//         <button
//           onClick={() => setShowIpModal(false)}
//           className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
//         >
//           Cancel
//         </button>

//         <button
//           onClick={handleGenerateToken}
//           disabled={isLoading || !ipAddress}
//           className="px-4 py-2 text-sm text-white rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
//         >
//           {isLoading ? "Generating..." : "Generate"}
//         </button>
//       </div>
//     </div>
//   </div>
// )}

//       {/* Tabs */}

//       <div className="flex border-b mb-4">
//         <button
//           className={`flex items-center gap-2 px-4 py-2 font-medium transition ${
//             activeTab === "apiToken"
//               ? "border-b-2 border-blue-600 text-blue-600"
//               : "text-gray-500 hover:text-blue-600"
//           }`}
//           onClick={() => setActiveTab("apiToken")}
//         >
//           🔑 API Tokens
//         </button>

//         <button
//           className={`flex items-center gap-2 px-4 py-2 font-medium transition ${
//             activeTab === "webhookConfig"
//               ? "border-b-2 border-blue-600 text-blue-600"
//               : "text-gray-500 hover:text-blue-600"
//           }`}
//           onClick={() => setActiveTab("webhookConfig")}
//         >
//           🔁 Webhook Config
//         </button>
//       </div>

//       {/* Tab Content */}
//       <div className="mt-4">
//         {/* ---- API Token Tab ---- */}
//         {activeTab === "apiToken" && (
//           <div>
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold">Manage API Tokens</h2>

//               {/* <button
//                 onClick={handleGenerateToken}
//                 disabled={isLoading}
//                 type="button"
//                 className={`${
//                   isLoading
//                     ? "bg-blue-700 cursor-not-allowed opacity-80"
//                     : "bg-blue-600 hover:bg-blue-700"
//                 } text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center`}
//               >
//                 {isLoading && (
//                   <svg
//                     aria-hidden="true"
//                     role="status"
//                     className="inline w-4 h-4 me-3 text-white animate-spin"
//                     viewBox="0 0 100 101"
//                     fill="none"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       d="M100 50.5908C100 78.2051 77.6142 
//                       100.591 50 100.591C22.3858 100.591 0 
//                       78.2051 0 50.5908C0 22.9766 22.3858 
//                       0.59082 50 0.59082C77.6142 0.59082 100 
//                       22.9766 100 50.5908ZM9.08144 50.5908C9.08144 
//                       73.1895 27.4013 91.5094 50 91.5094C72.5987 
//                       91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 
//                       27.9921 72.5987 9.67226 50 9.67226C27.4013 
//                       9.67226 9.08144 27.9921 9.08144 50.5908Z"
//                       fill="#E5E7EB"
//                     />
//                     <path
//                       d="M93.9676 39.0409C96.393 38.4038 
//                       97.8624 35.9116 97.0079 33.5539C95.2932 
//                       28.8227 92.871 24.3692 89.8167 
//                       20.348C85.8452 15.1192 80.8826 10.7238 
//                       75.2124 7.41289C69.5422 4.10194 63.2754 
//                       1.94025 56.7698 1.05124C51.7666 0.367541 
//                       46.6976 0.446843 41.7345 1.27873C39.2613 
//                       1.69328 37.813 4.19778 38.4501 
//                       6.62326C39.0873 9.04874 41.5694 10.4717 
//                       44.0505 10.1071C47.8511 9.54855 51.7191 
//                       9.52689 55.5402 10.0491C60.8642 10.7766 
//                       65.9928 12.5457 70.6331 15.2552C75.2735 
//                       17.9648 79.3347 21.5619 82.5849 
//                       25.841C84.9175 28.9121 86.7997 32.2913 
//                       88.1811 35.8758C89.083 38.2158 91.5421 
//                       39.6781 93.9676 39.0409Z"
//                       fill="currentColor"
//                     />
//                   </svg>
//                 )}
//                 {isLoading ? "Generating..." : "Generate New Token"}
//               </button> */}
//               <button
//                   type="button"
//                   onClick={() => setShowIpModal(true)}
//                   className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5"
//                 >
//                   Generate New Token
//                 </button>

//             </div>

//             <Table
//               columns={tokenTableColumns}
//               data={apiToken}
//               endPoint="/delete-token"
//               refreshTable={refetchApiTokens}
//               showStatusFilter={false}
//               showExport={false}
//               setData={setApiToken}
//               showDateFilter={false}
//             />
//           </div>
//         )}

//         {/* ---- Webhook Config Tab ---- */}
//         {activeTab === "webhookConfig" && (
//           <div>
//             <h2 className="text-lg font-semibold mb-3">
//               Webhook Configuration
//             </h2>

//             <div className="space-y-6">
//               <div>
//                 <label className="block text-gray-700 font-medium mb-1">
//                   Payment Received Webhook URL
//                 </label>
//                 <div className="flex items-center border rounded-lg px-3">
//                   <span className="text-gray-400 mr-2">🔗</span>
//                   <input
//                     type="text"
//                     placeholder=""
//                     className="w-full p-2 outline-none"
//                     value={PayinWebHook}
//                     onChange={(e) => setPayinWebHook(e.target.value)}
//                   />
//                 </div>
//                 <p className="text-sm text-gray-500 mt-1">
//                   We'll POST payin status notifications to this URL
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-gray-700 font-medium mb-1">
//                   Payout Processed Webhook URL
//                 </label>
//                 <div className="flex items-center border rounded-lg px-3">
//                   <span className="text-gray-400 mr-2">🔗</span>
//                   <input
//                     type="text"
//                     placeholder=""
//                     className="w-full p-2 outline-none"
//                     value={PayoutWebhook}
//                     onChange={(e) => setPayoutWebHook(e.target.value)}
//                   />
//                 </div>
//                 <p className="text-sm text-gray-500 mt-1">
//                   We'll POST payout status updates to this URL
//                 </p>
//               </div>
//             </div>

//             <button 
//             onClick={handleSaveWebhook}
//             className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
//               💾 Save Webhook Settings
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
    
    
//   );
  
// };

// export default ApiSetting;
import React, { useEffect, useState } from "react";
import { usePost } from "../hooks/usePost";
import Table from "../components/Table";
import { useGet } from "../hooks/useGet";
import { useToast } from "../contexts/ToastContext";
import { MONTH_NAMES } from "../constants/Constants";

const ApiSetting = () => {
  const [activeTab, setActiveTab] = useState("apiToken");
  const [apiToken, setApiToken] = useState([]);
  const [showIpModal, setShowIpModal] = useState(false);
  const [ipAddress, setIpAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const Toast = useToast();
  const [PayinWebHook, setPayinWebHook] = useState("");
  const [PayoutWebhook, setPayoutWebHook] = useState("");

  const { execute } = usePost("/generate-token");
  const endPoint = activeTab === "apiToken" ? "/get-tokens" : "";

  const { data: apiTokensData, refetch: refetchApiTokens } = useGet(endPoint);
  const initialDataOfTokens = apiTokensData?.data;

  useEffect(() => {
    const formattedMerchantData = initialDataOfTokens
      ?.map((item, index) => ({
        sqno: index + 1,
        id: item.id,
        ip: item.ip,
        token: item.token,
        createdAt: new Date(item.created_at),
        date:
          new Date(item.created_at).getDate() +
          " " +
          MONTH_NAMES[new Date(item.created_at).getMonth()] +
          " " +
          new Date(item.created_at).getFullYear(),
      }))
      ?.sort((a, b) => b.createdAt - a.createdAt);

    setApiToken(formattedMerchantData || []);
  }, [initialDataOfTokens]);

  const tokenTableColumns = [
    { header: "SQNo", accessor: "sqno" },
    { header: "IP", accessor: "ip" },
    { header: "Token", accessor: "token" },
    { header: "Date", accessor: "date" },
  ];

  const isValidIP = (ip) => {
    const ipv4Regex =
      /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

    const ipv6Regex =
      /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1)$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  const handleGenerateToken = async () => {
    if (!ipAddress) {
      Toast.error("Please enter IP address");
      return;
    }

    if (!isValidIP(ipAddress)) {
      Toast.error("Please enter a valid IP address");
      return;
    }

    setIsLoading(true);

    try {
      const res = await execute({
        ip: ipAddress,
      });

      if (res.message === "Auth token generated successfully") {
        Toast.success("Token Generated Successfully");
        refetchApiTokens();
        setShowIpModal(false);
        setIpAddress("");
      }
    } catch (err) {
      console.error("Error generating token:", err);
      Toast.error("Failed to generate token");
    } finally {
      setIsLoading(false);
    }
  };

  const { data: WebhookUrl, loading: WebHookLoading } = useGet("/show-merchant");
  console.log("show merchant data", WebhookUrl);

  useEffect(() => {
    if (WebhookUrl) {
      setPayinWebHook(WebhookUrl?.data?.payin_callback || "");
      setPayoutWebHook(WebhookUrl?.data?.payout_callback || "");
    }
  }, [WebhookUrl]);

  const { execute: updateWebhook } = usePost("/update-merchant");

  const handleSaveWebhook = async () => {
    try {
      const res = await updateWebhook({
        payin_callback: PayinWebHook,
        payout_callback: PayoutWebhook,
      });

      if (res?.message === "Merchant updated successfully") {
        Toast.success("Webhook updated successfully!");
      }
    } catch (err) {
      console.log(err);
      Toast.error("Failed to update webhook!");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Generate Token Modal - Enhanced Card Style */}
      {showIpModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div
            className="
              bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8
              border border-blue-100 transform scale-100 transition-all duration-300
              animate-in fade-in zoom-in-95
            "
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-blue-900 flex items-center gap-3">
                <i className="fa-solid fa-key text-blue-600 text-2xl"></i>
                Generate New Token
              </h3>
              <button
                onClick={() => setShowIpModal(false)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
            </div>

            <div className="mb-8">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                IP Address
              </label>
              <input
                type="text"
                placeholder="e.g. 192.168.1.1 or 2001:db8::ff00:42:8329"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="
                  w-full px-5 py-4 text-base border border-gray-300 rounded-xl
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  outline-none transition-all shadow-sm hover:shadow-md
                  placeholder-gray-400
                "
              />
              <p className="mt-2 text-xs text-gray-500">
                Both IPv4 and IPv6 formats are supported
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowIpModal(false)}
                className="
                  px-6 py-3 text-sm font-medium text-gray-700
                  bg-gray-100 rounded-xl hover:bg-gray-200
                  transition-all duration-200
                "
              >
                Cancel
              </button>

              <button
                onClick={handleGenerateToken}
                disabled={isLoading || !ipAddress.trim()}
                className={`
                  px-8 py-3 text-sm font-medium text-white rounded-xl
                  flex items-center gap-2 transition-all duration-200
                  ${
                    isLoading || !ipAddress.trim()
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-[0.98] shadow-md"
                  }
                `}
              >
                {isLoading && <i className="fa-solid fa-spinner fa-spin"></i>}
                {isLoading ? "Generating..." : "Generate Token"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
          <button
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-5 font-semibold text-base transition-all duration-200
              ${
                activeTab === "apiToken"
                  ? "text-blue-700 bg-white border-b-4 border-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-blue-50/70 hover:text-blue-700"
              }`}
            onClick={() => setActiveTab("apiToken")}
          >
            <i className="fa-solid fa-key text-xl"></i>
            API Tokens
          </button>

          <button
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-5 font-semibold text-base transition-all duration-200
              ${
                activeTab === "webhookConfig"
                  ? "text-blue-700 bg-white border-b-4 border-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-blue-50/70 hover:text-blue-700"
              }`}
            onClick={() => setActiveTab("webhookConfig")}
          >
            <i className="fa-solid fa-link text-xl"></i>
            Webhook Configuration
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 md:p-10">
          {/* API Token Tab */}
          {activeTab === "apiToken" && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-blue-900">
                  Manage API Tokens
                </h2>

                <button
                  type="button"
                  onClick={() => setShowIpModal(true)}
                  className="
                    bg-gradient-to-r from-blue-600 to-blue-700
                    hover:from-blue-700 hover:to-blue-800
                    text-white font-medium rounded-xl text-base px-8 py-4
                    shadow-lg hover:shadow-xl active:scale-[0.98]
                    transition-all duration-200 flex items-center gap-3
                  "
                >
                  <i className="fa-solid fa-plus"></i>
                  Generate New Token
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-blue-50 overflow-hidden">
                <Table
                  columns={tokenTableColumns}
                  data={apiToken}
                  endPoint="/delete-token"
                  refreshTable={refetchApiTokens}
                  showStatusFilter={false}
                  showExport={false}
                  setData={setApiToken}
                  showDateFilter={false}
                />
              </div>
            </div>
          )}

          {/* Webhook Config Tab */}
          {activeTab === "webhookConfig" && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-10">
                Webhook Configuration
              </h2>

              <div className="grid grid-cols-1 gap-8">
                {/* Payin Webhook */}
                <div className="bg-gradient-to-br from-white to-blue-50/30 p-8 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300">
                  <label className="block text-xl font-semibold text-blue-900 mb-4">
                    Payment Received Webhook URL
                  </label>
                  <div className="
                    flex items-center border border-gray-300 rounded-xl px-5 py-4
                    focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200/50
                    transition-all duration-200 bg-white
                  ">
                    <span className="text-blue-600 mr-4 text-2xl">🔗</span>
                    <input
                      type="text"
                      placeholder="https://yourdomain.com/payin-webhook"
                      className="w-full outline-none text-lg text-gray-800 placeholder-gray-400"
                      value={PayinWebHook}
                      onChange={(e) => setPayinWebHook(e.target.value)}
                    />
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    We'll send real-time POST notifications for successful/failed payins to this endpoint.
                  </p>
                </div>

                {/* Payout Webhook */}
                <div className="bg-gradient-to-br from-white to-blue-50/30 p-8 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300">
                  <label className="block text-xl font-semibold text-blue-900 mb-4">
                    Payout Processed Webhook URL
                  </label>
                  <div className="
                    flex items-center border border-gray-300 rounded-xl px-5 py-4
                    focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200/50
                    transition-all duration-200 bg-white
                  ">
                    <span className="text-blue-600 mr-4 text-2xl">🔗</span>
                    <input
                      type="text"
                      placeholder="https://yourdomain.com/payout-webhook"
                      className="w-full outline-none text-lg text-gray-800 placeholder-gray-400"
                      value={PayoutWebhook}
                      onChange={(e) => setPayoutWebHook(e.target.value)}
                    />
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    Real-time POST updates for payout status changes will be sent here.
                  </p>
                </div>
              </div>

              {/* Save Button - Prominent Blue Theme */}
              <button
                onClick={handleSaveWebhook}
                disabled={WebHookLoading}
                className={`
                  mt-12 w-full py-5 px-8 rounded-2xl font-semibold text-lg
                  flex items-center justify-center gap-3 transition-all duration-300
                  shadow-xl hover:shadow-2xl active:scale-[0.98]
                  ${
                    WebHookLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-700 hover:to-indigo-700 text-white"
                  }
                `}
              >
                {WebHookLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk text-xl"></i>
                    Save Webhook Settings
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiSetting;