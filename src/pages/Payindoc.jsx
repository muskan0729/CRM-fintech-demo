import React, { useState, useEffect } from "react";

const PayinDoc = () => {
  const [activeTab, setActiveTab] = useState("request");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const TABS = {
    request: {
      title: "Create Payin Request",
      endpoint: `${import.meta.env.VITE_API_URL}/payin/upi/request`,
      headers: "Content-Type: application/json",
      parameters: [
        { field: "mid", desc: "mid share by crownpe " },
        { field: "orderid", desc: "Unique transaction ID" },
        { field: "amount", desc: "Amount in INR" },
        { field: "email", desc: "Customer email" },
        { field: "phone", desc: "Customer mobile" },
      ],
      request: `curl --location '${import.meta.env.VITE_API_URL}/payin/upi/request'
      --form 'mid="XXXXX"
      --form 'orderid="TESTXXXX3117xX"
      --form 'amount="10.00"
      --form 'email="tXXX@gmail.com"
      --form 'phone="1122XXXXX"`,

      response: `{
          "status_code": "200",
          "status": "success",
          "data": {
          "qrcode_string": "upi://pay?
          pa=XXXXXXX@XXXXXX=f59d23ac19020c989cd8566a4ea16646ad4e02f67516cedc3bd7d833
          efdaXXXx&cu=INR&tn=Pay+to+f59d23ac19020c9XXXXXea16646ad4e02f67516cedc3bd7d833
          efda516e&am=10.00&mam=10.00&mc=5999&mode=04&tr=XXXX 377960382&ver=1"
          "txnid": "XXX2025101711XXXX45"
          }`,

    errors: [
      {
        code: "400",
        message: "Missing required fields: name, mobile, etc",
        cause: "Required fields are not included"
      },
      {
        code: "403",
        message: "Your PayIN account is deactivated. Please contact the administrator.",
        cause: "Payin deactivated by crownpe"
      },
      {
        code: "409",
        message: "Transaction ID already exists",
        cause: "Duplicate apitxnid used"
      },
      {
        code: "401",
        message: "Unauthorized",
        cause: "Invalid mid"
      },
      {
        code: "422",
        message: "Amount must be a positive numeric value",
        cause: "Invalid or zero amount"
      },
      {
        code: "500",
        message: "Internal Server Error",
        cause: "Unexpected server-side error"
      }
    ]
  },



    status: {
      title: "Check Payment Status",
      endpoint: `${import.meta.env.VITE_API_URL}/payin/status`,
      headers: "multipart/form-data",
      parameters: [
        { field: "mid", desc: "mid" },
        { field: "orderid", desc: "Transaction ID" },
      ],
      request: `curl --location '${import.meta.env.VITE_API_URL}/payin/status'
      --form mid="XXXMWw"
      --form orderid="xi2TpoHXXXX0mSQU"`,
successResponse: `{
  "message": "Transaction Successfully done",
  "success": true,
  "status": "success",
  "amount": "1.00",
  "txnid": "5101XXXXXXX"
}`,

failedResponse: `{
  "message": "Transaction Failed",
  "success": false,
  "status": "failed",
  "amount": "1.00",
  "txnid": "5101XXXXXXX"
}`
    },

callback: {
  title: "Payment Callback (Webhook)",
  endpoint: "Your Callback URL (provided by you)",
  headers: "Content-Type: application/json",

  successResponse: `{
  "status": "success",
  "txnid": "SPAYXXX0004",
  "clienttxnid": "YUVXXXXX",
  "amount": "1.00",
  "transactionid": "6408204XXX",
  "timestamp": "2025-XX-XX 15:27:47"
}`,

  failedResponse: `{
  "status": "failed",
  "txnid": "SPAY2025XXXX",
  "clienttxnid": "TXN0XXX59",
  "amount": "1.00",
  "transactionid": "6544XXX39",
  "timestamp": "2025-XX-XX 15:27:47"
}`,

  note: `This callback will be sent to your server whenever payment status is updated. 
Make sure your API is publicly accessible and responds with HTTP 200.`
}
  };

  const activeApi = TABS[activeTab];

  return (
    <div style={{
      fontFamily: "Inter, Arial",
      padding: isMobile ? "15px" : "30px", // 👈 mobile padding only
      background: "#f9fafb",
      minHeight: "100vh"
    }}>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "25px",
        flexWrap: isMobile ? "wrap" : "nowrap" // 👈 wrap on mobile
      }}>
        {["request", "status","callback"].map(tab => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 18px",
              cursor: "pointer",
              borderRadius: "8px",
              background: activeTab === tab ? "var(--bg-button)" : "#e5e7eb",
              color: activeTab === tab ? "#fff" : "#111",
              fontWeight: 500,
              transition: "0.2s",
              flex: isMobile ? "1 1 45%" : "unset", // 👈 responsive tabs
              textAlign: "center"
            }}
          >
            {tab === "request" ? "Create Request" : tab === "status" ? "Check Status":"callback"}
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{
        background: "#fff",
        padding: isMobile ? "15px" : "25px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
      }}>

        <h2 style={{
          marginBottom: "15px",
          fontSize: isMobile ? "18px" : "22px"
        }}>
          {activeApi.title}
        </h2>

        {/* Endpoint */}
        <div style={{ marginBottom: "15px" }}>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>ENDPOINT</div>
          <div style={{
            background: "#f3f4f6",
            padding: "10px",
            borderRadius: "6px",
            fontFamily: "monospace",
            wordBreak: "break-all" // 👈 prevent overflow
          }}>
            {activeApi.endpoint}
          </div>
        </div>

        {/* Headers */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>HEADERS</div>
          <div style={{
            background: "#f3f4f6",
            padding: "10px",
            borderRadius: "6px",
            fontFamily: "monospace"
          }}>
            {activeApi.headers}
          </div>
        </div>

        {/* Parameters */}
        <h4 style={{ marginBottom: "10px" }}>Parameters</h4>
        <div style={{
          border: "1px solid #eee",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "20px"
        }}>
  {activeApi.parameters && activeApi.parameters.length > 0 && (
  <>
    <h4 style={{ marginBottom: "10px" }}>Parameters</h4>

    <div style={{
      border: "1px solid #eee",
      borderRadius: "8px",
      overflow: "hidden",
      marginBottom: "20px"
    }}>
      {activeApi.parameters.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            padding: "10px 15px",
            gap: isMobile ? "4px" : "0",
            borderBottom:
              i !== activeApi.parameters.length - 1
                ? "1px solid #eee"
                : "none"
          }}
        >
          <span style={{ fontWeight: 600 }}>{p.field}</span>
          <span style={{ color: "#6b7280" }}>{p.desc}</span>
        </div>
      ))}
    </div>
  </>
)}
        </div>

        {/* Request */}
        {(activeTab === "request" || activeTab === "status") && (
          <>
        <h4>Request</h4>
        <pre style={{
          background: "var(--bg-submit)",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          overflowX: "auto",
          fontSize: isMobile ? "12px" : "15px" // 👈 responsive font
        }}>
          {activeApi.request}
        </pre>
        </>
        )}

        {/* Response */}
        {activeTab === "request" && (
          <>
        <h4 style={{ marginTop: "20px" }}>Response</h4>
        <pre style={{
          background: "var(--bg-color)",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          fontSize: isMobile ? "12px" : "15px",
          overflowX: "auto"
        }}>
          {activeApi.response}
        </pre>
        </>
        )}
 {/* ✅ For STATUS tab */}
{(activeTab === "status" || activeTab === "callback")&&  (
  <>
    {/* Success */}
    <div style={{ marginTop: "10px" }}>
      <div style={{ marginBottom: "5px", fontWeight: 600, color: "#16a34a" }}>
        ✅ Success Response
      </div>
      <pre style={{
        background: "var(--bg-color)",
        color: "white",
        padding: "15px",
        borderRadius: "8px",
        fontSize: isMobile ? "12px" : "15px",
        overflowX: "auto"
      }}>
        {activeApi.successResponse}
      </pre>
    </div>

    {/* Failed */}
    <div style={{ marginTop: "15px" }}>
      <div style={{ marginBottom: "5px", fontWeight: 600, color: "#dc2626" }}>
        ❌ Failed Response
      </div>
      <pre style={{
        background: "#7f1d1d",
        color: "white",
        padding: "15px",
        borderRadius: "8px",
        fontSize: isMobile ? "12px" : "15px",
        overflowX: "auto"
      }}>
        {activeApi.failedResponse}
      </pre>
    </div>
  </>
)}       
{activeTab === "callback" && (
  <div style={{
    background: "#fef3c7",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontSize: isMobile ? "12px" : "14px",
    color: "#92400e"
  }}>
    ⚠️ <strong>Note:</strong> {activeApi.note}
  </div>
)}
{/* Error Codes */}
{activeApi.errors && (
  <>
    <h4 style={{ marginTop: "20px" }}>Error Response Examples</h4>

    <div style={{
      border: "1px solid #eee",
      borderRadius: "8px",
      overflow: "hidden",
      marginTop: "10px"
    }}>
      
      {/* Header */}
      <div style={{
        display: "flex",
        background: "#fee2e2",
        padding: "10px 15px",
        fontWeight: "600",
        fontSize: isMobile ? "12px" : "14px"
      }}>
        <div style={{ flex: 1 }}>ERROR CODE</div>
        <div style={{ flex: 2 }}>MESSAGE</div>
        <div style={{ flex: 2 }}>CAUSE</div>
      </div>

      {/* Rows */}
      {activeApi.errors.map((err, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            padding: "10px 15px",
            borderTop: "1px solid #eee",
            gap: isMobile ? "5px" : "0"
          }}
        >
          <div style={{ flex: 1, fontWeight: 600, color: "#dc2626" }}>
            {err.code}
          </div>
          <div style={{ flex: 2 }}>{err.message}</div>
          <div style={{ flex: 2, color: "#6b7280" }}>
            {err.cause}
          </div>
        </div>
      ))}
    </div>
  </>
)}
         

      </div>
    </div>
  );
};

export default PayinDoc;