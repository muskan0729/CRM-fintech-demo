import React, { useState } from "react";

const PayinDoc = () => {
  const [activeTab, setActiveTab] = useState("request");

  const TABS = {
    request: {
      title: "Create Payin Request",
      endpoint: `${import.meta.env.VITE_API_URL}/payin/upi/request`,
      headers: "Content-Type: application/json",
      parameters: [
        { field: "token", desc: "API key" },
        { field: "orderid", desc: "Unique transaction ID" },
        { field: "amount", desc: "Amount in INR" },
        { field: "email", desc: "Customer email" },
        { field: "phone", desc: "Customer mobile" },
      ],
      request: `curl --location '${import.meta.env.VITE_API_URL}/payin/upi/request'`,
      response: `{
  "status": "success",
  "txnid": "SPAYXXXXX"
}`
    },

    status: {
      title: "Check Payment Status",
      endpoint: `${import.meta.env.VITE_API_URL}/payin/status`,
      headers: "multipart/form-data",
      parameters: [
        { field: "token", desc: "API key" },
        { field: "orderid", desc: "Transaction ID" },
      ],
      request: `curl --location '${import.meta.env.VITE_API_URL}/payin/status'`,
      response: `{
  "status": "success",
  "amount": "1.00"
}`
    }
  };

  const activeApi = TABS[activeTab];

  return (
    <div style={{
      fontFamily: "Inter, Arial",
      padding: "30px",
      background: "#f9fafb",
      minHeight: "100vh"
    }}>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "25px"
      }}>
        {["request", "status"].map(tab => (
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
              transition: "0.2s"
            }}
          >
            {tab === "request" ? "Create Request" : "Check Status"}
          </div>
        ))}
      </div>

      {/* Card Container */}
      <div style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
      }}>

        <h2 style={{ marginBottom: "15px" }}>{activeApi.title}</h2>

        {/* Endpoint */}
        <div style={{ marginBottom: "15px" }}>
          <div style={{ fontSize: "14px", color: "#6b7280" }}>ENDPOINT</div>
          <div style={{
            background: "#f3f4f6",
            padding: "10px",
            borderRadius: "6px",
            fontFamily: "monospace"
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
          {activeApi.parameters.map((p, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 15px",
              borderBottom: i !== activeApi.parameters.length - 1 ? "1px solid #eee" : "none"
            }}>
              <span style={{ fontWeight: 600 }}>{p.field}</span>
              <span style={{ color: "#6b7280" }}>{p.desc}</span>
            </div>
          ))}
        </div>

        {/* Request */}
        <h4>Request</h4>
        <pre style={{
          background: "var(--bg-submit)",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          overflowX: "auto",
          fontSize: "15px"
        }}>
          {activeApi.request}
        </pre>

        {/* Response */}
        <h4 style={{ marginTop: "20px" }}>Response</h4>
        <pre style={{
          background: "var(--bg-color)",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          fontSize: "15px"
        }}>
          {activeApi.response}
        </pre>

      </div>
    </div>
  );
};

export default PayinDoc;