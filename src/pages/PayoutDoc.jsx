import React, { useState, useEffect } from "react";

const PayoutDoc = () => {
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
      title: "Create Payout Request",
      endpoint: `https://test.co.in/api/payout/request`,
      headers: "Content-Type: application/json",
      parameters: [
        { field: "mid", desc: "mid provided by crownpe" },
        { field: "orderid", desc: "Unique transaction ID" },
        { field: "beneficiary_name", desc: "Account holder name" },
        { field: "beneficiary_email", desc: "Email" },
        { field: "beneficiary_phone", desc: "Mobile number" },
        { field: "amount", desc: "Amount in INR" },
        { field: "beneficiary_account_number", desc: "Bank account number" },
        { field: "beneficiary_ifsc", desc: "IFSC code" },
      ],
      request: `curl --location https://test.co.in/api/payout/request 
        --form 'mid="XXXXXXXXt"
        --form 'orderid="AKXXXXX"
        --form "beneficiary_email=customer / enduser mail_id"
        --form "beneficiary_phone=customer / enduser mobile no"
        --form 'amount=10XX.00'
        --form 'beneficiary_account_number="17459XXXXX"
        --form 'beneficiary_ifsc="KKBK00XXXXX"
        --form 'beneficiary_name=customer / enduser name'`,
      response: `{
                  "status": "pending",
                  "statuscode": 200,
                  "message": "✅ Payout status: Pending,
                  "data": {
                  "message": "Transfer Initiated",
                  "bene_name": "name",
                  "customer_account": "xxxxxxx7325",
                  "amount": "1.00",
                  "client_ref_no": "AK00XXXXX1",
                  "txn_date": "2025-XX-1X 16:XX:49"
                  "rrn": "null"
       }`,

   errors: [
      {
        code: "400",
        message: "Missing required fields: name, mobile, etc",
        cause: "Required fields are not included"
      },
      {
        code: "403",
        message: "Your PayOUT account is deactivated. Please contact the administrator.",
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
      title: "Check Payout Status",
      endpoint: `https://test.co.in/api/payout/status`,
      headers: "Content-Type: application/json",
      parameters: [
        { field: "mid", desc: "mid provided by crownpe" },
        { field: "orderid", desc: "Transaction ID" },
      ],
      request: `curl --location  GET 'https://test.co.in/api/payout/status
                 mid = "MWXXXXXT7i&orderid=AK0XXXX"'`,
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
    Callback: {
      title: "Callback Response",
      endpoint: `https://yourdomain.com/payout/callback`,

      request: "",
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
    }
  };

  const activeApi = TABS[activeTab];

  return (
    <div style={{
      fontFamily: "Inter, Arial",
      padding: isMobile ? "15px" : "30px", // 👈 only change for mobile
      background: "#f9fafb",
      minHeight: "100vh"
    }}>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "25px",
        flexWrap: isMobile ? "wrap" : "nowrap" // 👈 wrap only on mobile
      }}>
        {Object.keys(TABS).map(tab => (
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
            {tab.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{
        background: "#fff",
        padding: isMobile ? "15px" : "25px", // 👈 mobile padding
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
      }}>

        <h2 style={{
          marginBottom: "20px",
          fontSize: isMobile ? "18px" : "22px" // 👈 responsive text
        }}>
          {activeApi.title}
        </h2>

        {/* Endpoint */}
        <div style={{ marginBottom: "15px" }}>
          <div style={{ fontSize: "13px", color: "#6b7280" }}>ENDPOINT</div>
          <div style={{
            background: "#f3f4f6",
            padding: "10px",
            borderRadius: "6px",
            fontFamily: "monospace",
            wordBreak: "break-all" // 👈 fix overflow
          }}>
            {activeApi.endpoint}
          </div>
        </div>

{activeTab !== "Callback" && (
  <>
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
  </>
)}

        {/* Request */}
        {activeApi.request && (
          <>
            <h4>Request</h4>
            <pre style={{
              background: "var(--bg-submit)",
              color: "#fff",
              padding: "15px",
              borderRadius: "8px",
              overflowX: "auto",
              fontSize: isMobile ? "12px" : "14px" // 👈 responsive font
            }}>
              {activeApi.request}
            </pre>
          </>
        )}
        {/* Response */}
      {activeTab === "request" && (
          <>
        <h4 style={{ marginTop: "20px" }}> cURL Success Response</h4>
        <pre style={{
          background: "var(--bg-color)",
          color: "#fff",
          padding: "15px",
          borderRadius: "8px",
          fontSize: isMobile ? "12px" : "14px",
          overflowX: "auto"
        }}>
          {activeApi.response}
        </pre>
        </>
        )}

{(activeTab === "status" || activeTab === "Callback")&&  (
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

export default PayoutDoc;