import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import paymentGatewayBg from "../images/logo_bg.png";
import { usePost } from "../hooks/usePost";

const FloatingInput = ({
  placeholder,
  value,
  onChange,
  name,
  type = "text",
  required = false,
}) => {
  const hasValue = value && value.length > 0;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        style={{
          width: "100%",
          padding: "20px 14px 8px",
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.08)",
          outline: "none",
          fontSize: "14px",
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(10px)",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
        onFocus={(e) => {
        //   e.target.style.border = "1px solid var(--bg-color)";
          e.target.style.boxShadow =
            "0 0 0 3px rgba(0,0,0,0.05), 0 0 8px var(--bg-color)";
        }}
        onBlur={(e) => {
        //   e.target.style.border = "1px solid rgba(0,0,0,0.08)";
          e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
        }}
      />

      {/* Floating Label */}
      <label
        style={{
          position: "absolute",
          left: "12px",
          top: hasValue ? "6px" : "50%",
          transform: hasValue ? "translateY(0)" : "translateY(-50%)",
          fontSize: hasValue ? "11px" : "14px",
          fontWeight: hasValue ? "600" : "400",
          color: hasValue ? "var(--bg-color)" : "#9ca3af",
          background: "#f9fafb",
          padding: hasValue ? "0 6px" : "0",
          borderRadius: "6px",
          transition: "all 0.25s ease",
          pointerEvents: "none",
        }}
      >
        {placeholder}
      </label>
    </div>
  );
};

function Kyc_demo() {
  const navigate = useNavigate();
  const { execute: verifyAadhaarApi, loading: verifying } = usePost("/verify-aadhaar");
  const { execute: aadhaarPanLinkApi } = usePost("/aadhaar-pan-link");
const { execute: verifyPanApi, loading: verifyingPan } = usePost("/verify-pan");

const { execute: verifyGstApi, loading: verifyingGst } = usePost("/verify-gst");

const { execute: verifyBankApi, loading: verifyingBank } = usePost("/verify-bank");
const [bankResult, setBankResult] = useState(null);


  const { execute: executeMember } = usePost("/storeMerchant");



  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [panVerified, setPanVerified] = useState(false);

  const [gstVerified, setGstVerified] = useState(false);
  const [bankVerified, setBankVerified] = useState(false);

const handleVerifyAadhaar = async () => {
  if (formData.aadhaar.length !== 12) {
    alert("Enter valid Aadhaar");
    return;
  }

  try {
    // 🔴 MOCK RESPONSE (REMOVE THIS WHEN API LIVE)
    const res = {
      data: {
        status: "success_aadhaar",
        state: "Gujarat",
        masked_mobile_number: "*******947",
      },
    };

    // const res = await verifyAadhaarApi({ aadhaar: formData.aadhaar }); // ✅ UNCOMMENT IN PROD

    if (res?.data?.status !== "success_aadhaar") {
      alert("Aadhaar verification failed");
      return;
    }

    setAadhaarVerified(true);

    // ✅ Autofill from Aadhaar
    setFormData((prev) => ({
      ...prev,
      state: res.data.state,
      mobile: res.data.masked_mobile_number,
      email:res.data.email,
      address:res.data.address_line_1,
      pincode:res.data.pincode,
       Dob:res.data.dob
    }));

    // ✅ STEP 2: Aadhaar → PAN Link
    const linkRes = {
      data: {
        pan_no: "MBPPK1234N",
      },
    };

    // const linkRes = await aadhaarPanLinkApi({ aadhaar: formData.aadhaar }); // ✅ UNCOMMENT IN PROD

    if (linkRes?.data?.pan_no) {
      const pan = linkRes.data.pan_no;

      setFormData((prev) => ({
        ...prev,
        pan: pan,
      }));

      handleVerifyPan(pan);
    }

  } catch (err) {
    console.error(err);
  }
};


const handleVerifyPan = async (panValue) => {
  const pan = panValue || formData.pan;

  if (!pan || pan.length !== 10) return;

  try {
    // 🔴 MOCK RESPONSE (REMOVE THIS WHEN API LIVE)
    const res = {
      data: {
        pan_number: "ABCDE1234G",
        full_name: "MONA LISA",
        dist: "ABCD",
        state: "ABCD",
        mobile_no: "98XXXXXX99",
        email: "ab*************k2@gmail.com",
        address_line_1: "ABCD",
        address_line_2: "ABCD",
        address_line_3: "ABCD",
        pincode: "400001",
        dob:"12-3-1999"
      },
      status: "success",
    };

    // const res = await verifyPanApi({ id_number: pan }); // ✅ UNCOMMENT IN PROD

    if (res?.status === "success") {
      setPanVerified(true);

      setFormData((prev) => ({
        ...prev,

        // ✅ BASIC
        pan: res.data.pan_number || prev.pan,
        name: res.data.full_name || prev.name,
        email: res.data.email || prev.email,
        mobile: res.data.mobile_no || prev.mobile,

        // ✅ ADDRESS
        address:
          [
            res.data.address_line_1,
            res.data.address_line_2,
            res.data.address_line_3,
            res.data.address_line_4,
          ]
            .filter(Boolean)
            .join(", ") || prev.address,

        // ✅ LOCATION
        city: res.data.dist || prev.city,
        district: res.data.dist || prev.district,
        state: res.data.state || prev.state,
        pincode: res.data.pincode || prev.pincode,
         Dob: res.data.dob || prev.dob,
      }));
    } else {
      alert("PAN verification failed");
    }
  } catch (err) {
    console.error(err);
  }
};


const handleVerifyGst = async () => {
  if (!formData.gst || formData.gst.length !== 15) {
    alert("Enter valid GST number");
    return;
  }

  try {
    // 🔴 MOCK RESPONSE (REMOVE THIS WHEN API LIVE)
    const res = {
      status: "success",
      data: {
        gstin: "22ABCDE1234F1Z5",
        legal_name: "ABC PRIVATE LIMITED",
        trade_name: "ABC Pvt Ltd",
        state: "Gujarat",
        district: "Ahmedabad",
        address: "123 Business Park, SG Highway",
        pincode: "380015",
      },
    };

    // const res = await verifyGstApi({ gst: formData.gst }); // ✅ UNCOMMENT IN PROD

   if (res?.status === "success") {
  setGstVerified(true);

  setFormData((prev) => ({
    ...prev,

    // ✅ GST is source of truth
    pan: res.data.pan_number || prev.pan,
    name: res.data.legal_name || prev.name,

    // optional (agar chahiye)
    // business_name: res.data.business_name,

    // address
    address: res.data.address || prev.address,

    // ⚡ agar address se split karna ho later kar sakte hai
 
  }));
} else {
      alert("GST verification failed");
    }

  } catch (err) {
    console.error(err);
  }
};

const handleVerifyBank = async () => {
  if (!formData.bank_account || !formData.bank_ifsc) {
    alert("Enter account number & IFSC");
    return;
  }

  try {
    // 🔴 MOCK RESPONSE
    const res = {
      status: "success",
      data: {
        account_exists: true,
        full_name: "MONA LISA",
      },
    };

    // const res = await verifyBankApi({
    //   account_number: formData.bank_account,
    //   ifsc: formData.bank_ifsc,
    // });

    if (res?.status === "success" && res.data.account_exists) {
      setBankVerified(true);
      setBankResult(res.data);
    } else {
      setBankVerified(false);
      setBankResult({ error: "Account not found" });
    }

  } catch (err) {
    console.error(err);
  }
};

  const [formData, setFormData] = useState({
    aadhaar: "",
    pan: "",
    name: "",
    email: "",
    mobile: "",
    address: "",
    state: "",
    city: "",
    country: "",
    pincode: "",
     district: "",
     Dob: "",
     gst:"",
     bank_account:"",
     bank_ifsc:"",

  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const payload = {
      aadhaar: formData.aadhaar,
      pan: formData.pan,
      name: formData.name,
      email: formData.email,
      mobile_no: formData.mobile,
      address: formData.address,
      state: formData.state,
      city: formData.city,
      district: formData.district,
      pincode: formData.pincode,
      gst: formData.gst,
      bank_account: formData.bank_account,
      bank_ifsc: formData.bank_ifsc,
    };

    const res = await executeMember(payload);

    if (res?.status === "success") {
    //   alert("✅ KYC Submitted Successfully!");
      navigate("/");
    } else {
      alert("❌ KYC Submission Failed");
    }

  } catch (err) {
    console.error(err);
    alert("❌ Something went wrong");
  }
};

  return (
    <div style={{ display: "flex", height: "100vh", margin: 0, padding: 0 }}>
      
      {/* LEFT SIDE (25%) */}
      <div
        style={{
          flex: "0 0 40%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-color)"
        }}
      >
        <img
          src={paymentGatewayBg}
          alt="banner"
          style={{ width: "90%", objectFit: "contain" }}
        />
      </div>

      {/* RIGHT SIDE (75%) */}
      <div
        style={{
          flex: "0 0 60%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
        //    border:"2px solid black",
        }}
      >
        <div
          style={{
            width: "100%",
             height:"100%",
            // maxWidth: "700px",
            background: "#f9fafb",
            // border:"2px solid black",
            padding: "30px",
            // borderRadius: "12px",
            // boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "5px"}} className="uppercase font-bold text-[var(--bg-color)] text-xl">
            onboard with us
          </h2>
          <p className="text-[var(--bg-gradient)]" style={{ textAlign: "center", marginBottom: "20px" }}>
  Create your account and verify your identity to access all features
</p>

          {/* FORM */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

            {/* 2 COLUMN GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
<div style={{ position: "relative", width: "100%" }}>
  
  <FloatingInput
    placeholder="Aadhaar Number"
    name="aadhaar"
    value={formData.aadhaar}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, "").slice(0, 12);
      setFormData({ ...formData, aadhaar: value });
      setAadhaarVerified(false);
      setPanVerified(false);
    }}
    required
  />

  {/* VERIFY BUTTON INSIDE INPUT */}
  {!aadhaarVerified && formData.aadhaar.length === 12 && (
    <button
      type="button"
      onClick={handleVerifyAadhaar}
      disabled={verifying}
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        padding: "6px 10px",
        fontSize: "12px",
        borderRadius: "8px",
        border: "none",
        background: "var(--bg-gradient)",
        color: "#fff",
        cursor: "pointer",
        zIndex: 2,
      }}
    >
      {verifying ? "..." : "Verify"}
    </button>
  )}

  {/* VERIFIED ICON INSIDE INPUT */}
  {aadhaarVerified && (
    <span
      style={{
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "12px",
        color: "green",
        fontWeight: "600",
      }}
    >
      ✔
    </span>
  )}
</div>

<div style={{ position: "relative" }}>
  <FloatingInput
    placeholder="PAN Number"
    name="pan"
    value={formData.pan}
    onChange={(e) => {
      const value = e.target.value.toUpperCase();
      setFormData({ ...formData, pan: value });
      setPanVerified(false);
    }}
    required
  />

  {verifyingPan && <span>Verifying PAN...</span>}

  {panVerified && (
    <span style={{ color: "green", fontSize: "12px" }}>
      ✔ PAN Verified
    </span>
  )}
</div>
<div style={{ position: "relative" }}>
  <FloatingInput
    placeholder="GST Number"
    name="gst"
    value={formData.gst}
    onChange={(e) => {
      const value = e.target.value.toUpperCase().slice(0, 15);
      setFormData({ ...formData, gst: value });
      setGstVerified(false);
    }}
    required
  />

  {/* VERIFY BUTTON */}
  {!gstVerified && formData.gst.length === 15 && (
    <button
      type="button"
      onClick={handleVerifyGst}
      disabled={verifyingGst}
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        padding: "6px 10px",
        fontSize: "12px",
        borderRadius: "8px",
        border: "none",
        background: "var(--bg-gradient)",
        color: "#fff",
        cursor: "pointer",
      }}
    >
      {verifyingGst ? "..." : "Verify"}
    </button>
  )}

  {/* VERIFIED ICON */}
  {gstVerified && (
    <span
      style={{
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "12px",
        color: "green",
        fontWeight: "600",
      }}
    >
      ✔
    </span>
  )}
</div>
<FloatingInput
  placeholder="Full Name"
  name="name"
  value={formData.name}
  onChange={handleChange}
  required
  disabled={panVerified}
/>        
 
     <FloatingInput placeholder="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />

              <FloatingInput placeholder="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} required />
              {/* <FloatingInput placeholder="Date Of Birth" name="Dob" value={formData.Dob} onChange={handleChange} required /> */}

              {/* <FloatingInput placeholder="PAN Number" name="pan" value={formData.pan} onChange={handleChange} required /> */}
              {/* <FloatingInput placeholder="State" name="state" value={formData.state} onChange={handleChange} required /> */}

              {/* <FloatingInput placeholder="District" name="district" value={formData.district} onChange={handleChange} required /> */}
                <FloatingInput placeholder="pincode" name="pincode" value={formData.pincode} onChange={handleChange} required />

              {/* <FloatingInput placeholder="Country" name="country" value={formData.country} onChange={handleChange} required /> */}

            <FloatingInput placeholder="Address" name="address" value={formData.address} onChange={handleChange} required />
{/*  
              <FloatingInput placeholder="Bank Account No" name="bank_account" value={formData.bank_account} onChange={handleChange} required />
              <FloatingInput placeholder="Bank IFSC" name="bank_ifsc" value={formData.bank_ifsc} onChange={handleChange} required /> */}



  {/* ACCOUNT NUMBER */}
  <FloatingInput
    placeholder="Bank Account No"
    name="bank_account"
    value={formData.bank_account}
    onChange={(e) => {
      setFormData({ ...formData, bank_account: e.target.value });
      setBankVerified(false);
      setBankResult(null);
    }}
    required
  />

  {/* IFSC */}
  <FloatingInput
    placeholder="Bank IFSC"
    name="bank_ifsc"
    value={formData.bank_ifsc}
    onChange={(e) => {
      setFormData({
        ...formData,
        bank_ifsc: e.target.value.toUpperCase(),
      });
      setBankVerified(false);
      setBankResult(null);
    }}
    required
  />

  {/* VERIFY BUTTON (below inputs) */}
  {!bankVerified &&
    formData.bank_account &&
    formData.bank_ifsc && (
      <button
        type="button"
        onClick={handleVerifyBank}
        disabled={verifyingBank}
        style={{
          marginTop: "8px",
          padding: "8px 12px",
          fontSize: "13px",
          borderRadius: "8px",
          border: "none",
          background: "var(--bg-gradient)",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        {verifyingBank ? "Verifying..." : "Verify Bank"}
      </button>
    )}

  {/* RESULT BELOW */}
  {bankResult && (
    <div style={{ marginTop: "8px", fontSize: "13px" }}>
      {bankVerified ? (
        <span style={{ color: "green" }}>
          ✔ Account Verified - {bankResult.full_name}
        </span>
      ) : (
        <span style={{ color: "red" }}>
          ❌ {bankResult.error}
        </span>
      )}
    </div>
  )}


</div>
 <button
  type="submit"
  style={{
    background: "var(--bg-gradient)",
    color: "#fff",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
  }}
  onMouseOver={(e) => {
    e.target.style.transform = "translateY(-2px) scale(1.01)";
  }}
  onMouseOut={(e) => {
    e.target.style.transform = "translateY(0)";
  }}
>
  Submit KYC
</button>
          
          </form>
        </div>
      </div>
    </div>
  );
}

export default Kyc_demo;