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
      endpoint: `${import.meta.env.VITE_API_URL}/payout/request`,
      headers: "Content-Type: application/json",
      parameters: [
        { field: "token", desc: "API key" },
        { field: "orderid", desc: "Unique transaction ID" },
        { field: "beneficiary_name", desc: "Account holder name" },
        { field: "beneficiary_email", desc: "Email" },
        { field: "beneficiary_phone", desc: "Mobile number" },
        { field: "amount", desc: "Amount in INR" },
        { field: "beneficiary_account_number", desc: "Bank account number" },
        { field: "beneficiary_ifsc", desc: "IFSC code" },
      ],
      request: `curl --location '${import.meta.env.VITE_API_URL}/payout/request'`,
      response: `{
  "status": "pending",
  "message": "Transfer Initiated",
  "amount": "100.00"
}`
    },
    status: {
      title: "Check Payout Status",
      endpoint: `${import.meta.env.VITE_API_URL}/payout/status`,
      headers: "Content-Type: application/json",
      parameters: [
        { field: "token", desc: "API key" },
        { field: "orderid", desc: "Transaction ID" },
      ],
      request: `curl --location '${import.meta.env.VITE_API_URL}/payout/status'`,
      response: `{
  "status": "success",
  "amount": "100.00",
  "rrn": "123456789"
}`
    },
    callback: {
      title: "Callback Response",
      endpoint: `https://yourdomain.com/payout/callback`,
      headers: "-",
      parameters: [],
      request: "",
      response: `{
  "status": "success",
  "txnid": "SPAY12345",
  "amount": "100.00",
  "utr": "XXXXXXXX"
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

        {/* Headers */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "13px", color: "#6b7280" }}>HEADERS</div>
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
        {activeApi.parameters.length > 0 && (
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
                    flexDirection: isMobile ? "column" : "row", // 👈 key change
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
        <h4 style={{ marginTop: "20px" }}>Response</h4>
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

      </div>
    </div>
  );
};

export default PayoutDoc;