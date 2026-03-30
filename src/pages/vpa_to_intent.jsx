import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/vpa_to_intent.css";


const vpa_to_intent = () => {
  const [data, setData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // like screenshot
  const [status, setStatus] = useState("Waiting for payment...");

  useEffect(() => {
    axios.post("${import.meta.env.VITE_API_URL}/vpa-intent", { })
      .then(res => setData(res.data.data))
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    if (!data) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus("Expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [data]);

  const openApp = (app) => {
    let link = data.upi_link;

    if (app === "gpay") link = link.replace("upi://", "tez://");
    if (app === "phonepe") link = link.replace("upi://", "phonepe://");
    if (app === "paytm") link = link.replace("upi://", "paytmmp://");

    window.location.href = link;
  };

  if (!data) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="wrapper">

      {/* Header */}
      <div className="header">
        <img src="/src/images/logo.png" alt="logo" />
        <div>
          <h2>SPAY FINTECH PRIVATE LIMITED</h2>
          <p>Secure and fast payment processing</p>
        </div>
      </div>

      {/* Timer */}
      <div className="timer">
        ⏱ Time remaining {minutes}:{seconds}
      </div>

      {/* Amount */}
      <div className="amount">₹{data.amount}</div>

      {/* Order Info */}
      <div className="order-box">
        <div>
          <span>Order ID:</span>
          <span>{data.order_id}</span>
        </div>
        <div>
          <span>Transaction Token:</span>
          <span>{data.token}</span>
        </div>
        <div>
          <span>Status:</span>
          <span>{status}</span>
        </div>
      </div>

      {/* QR */}
      <div className="qr-box">
        <h4>Scan QR Code to Pay</h4>
        <img src={data.qr} alt="QR"/>
        <p>Scan with any UPI app</p>
      </div>

      {/* Buttons */}
      <h4 className="pay-title">Pay directly with</h4>

      {/* <div className="buttons">
        <button onClick={() => openApp("gpay")}>Google Pay</button>
        <button onClick={() => openApp("phonepe")}>PhonePe</button>
        <button onClick={() => openApp("paytm")}>Paytm</button>
        <button onClick={() => window.location.href = data.upi_link}>
          Any UPI App
        </button>
      </div> */}

      <div className="buttons">
        <button onClick={() => openApp("gpay")}>
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAbCAMAAAAeYLy0AAAA8FBMVEX///9PVFqeoKM0qFNChfRMUVfqQzXH1/syfvO/wcKbnaD7uwD6+voufPOIi45TWF2oqqzg6f33xcPqPC1aXmTo6On8vwDu7+88gvTNzs+Vl5pfY2hGS1J0d3uMx5nz+fT86+rynZjsXVPpNSPoJw3tbWX1tbLwiYK0trjrTUDnAAD74eDrUkbvgXrtZVvxlZT/+eXyfwDpNDf92pX3pRb8yFH5rgDS3/xsnPYUc/P8y1/7wS/8zm6mrRfi8urp8P5TjvX+5bd+rkRvvIF6pPZOp0Ido0W43MJht3XS6NcyonM6jNIRoy7X5fBLr2Sq1bNH82TaAAAB50lEQVQ4jdWUa1/TMBTGT9am2DZrOpuSXtIOaJUo3hUVUTYFOwEv3//beJquG7hNhHc+7/ok/99zzklSgP9MO7t7VR09eHhbbr+OIsdxoqq6v/B00Cpz/4KxR1VLGfbxQe96nFMUEfFG8AkSlfN0/1kd1cvEAdExKiOEbeCeY15lutvZW3IIdlVmJFzPvXj5yqkPVv0ejGmxHny9/abaXeP3oESQhYXIM2xW665jqV049Lffmi7ebc11HQy5J3FOOSHUhVBlnak0+L5/aD7eD+8ZHbEeZIzJkKjYVQF6mlDJaDcqQVkLfjA7zxLbaDgHBScojjkgjeMRjaNq60gpBh/7/vE8EXUVzIXgPDBNpYNs4LrEw1Hl+BlQdD/6/qeTdnEyGo0mU9tOrvfYjiInlCpFhAdQ0NTMC+Cz/8U67bdMhnZytgIWosCEOONeW2UAIcKor5bVlN0ONk3s4dafYD+RFEsFyCkTufFnDZLfzgHGsws7SaawBuyC20RwecF1t1AiaTWtrObyaLQCIoHHIQvTIwAXi9trSKPm+49+t6cWYIyHwhVxlQFDE9zp/GfTmNDT8cJLw+V7wiuXZ1KGZiaZuvrQTn6VZTkbw82SasOlv0mD7ixuLUbzuwW27+JO0nrTn+Rf9Rv0SCof0N9DKQAAAABJRU5ErkJggg==" alt="GPay" />
        </button>

        <button onClick={() => openApp("phonepe")}>
          <img src="data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8yIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHZpZXdCb3g9IjAgMCAxMzIgNDgiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxzdHlsZT4uc3Qwe2ZpbGw6IzVmMjU5Zn08L3N0eWxlPjxjaXJjbGUgdHJhbnNmb3JtPSJyb3RhdGUoLTc2LjcxNCAxNy44NyAyNC4wMDEpIiBjbGFzcz0ic3QwIiBjeD0iMTcuOSIgY3k9IjI0IiByPSIxNy45Ii8+PHBhdGggY2xhc3M9InN0MCIgZD0iTTkwLjUgMzQuMnYtNi41YzAtMS42LS42LTIuNC0yLjEtMi40LS42IDAtMS4zLjEtMS43LjJWMzVjMCAuMy0uMy42LS42LjZoLTIuM2MtLjMgMC0uNi0uMy0uNi0uNlYyMy45YzAtLjQuMy0uNy42LS44IDEuNS0uNSAzLS44IDQuNi0uOCAzLjYgMCA1LjYgMS45IDUuNiA1LjR2Ny40YzAgLjMtLjMuNi0uNi42SDkyYy0uOSAwLTEuNS0uNy0xLjUtMS41em05LTMuOWwtLjEuOWMwIDEuMi44IDEuOSAyLjEgMS45IDEgMCAxLjktLjMgMi45LS44LjEgMCAuMi0uMS4zLS4xLjIgMCAuMy4xLjQuMi4xLjEuMy40LjMuNC4yLjMuNC43LjQgMSAwIC41LS4zIDEtLjcgMS4yLTEuMS42LTIuNC45LTMuOC45LTEuNiAwLTIuOS0uNC0zLjktMS4yLTEtLjktMS42LTIuMS0xLjYtMy42di0zLjljMC0zLjEgMi01IDUuNC01IDMuMyAwIDUuMiAxLjggNS4yIDV2Mi40YzAgLjMtLjMuNi0uNi42aC02LjN6bS0uMS0yLjJIMTAzLjJ2LTFjMC0xLjItLjctMi0xLjktMnMtMS45LjctMS45IDJ2MXptMjUuNSAyLjJsLS4xLjljMCAxLjIuOCAxLjkgMi4xIDEuOSAxIDAgMS45LS4zIDIuOS0uOC4xIDAgLjItLjEuMy0uMS4yIDAgLjMuMS40LjIuMS4xLjMuNC4zLjQuMi4zLjQuNy40IDEgMCAuNS0uMyAxLS43IDEuMi0xLjEuNi0yLjQuOS0zLjguOS0xLjYgMC0yLjktLjQtMy45LTEuMi0xLS45LTEuNi0yLjEtMS42LTMuNnYtMy45YzAtMy4xIDItNSA1LjQtNSAzLjMgMCA1LjIgMS44IDUuMiA1djIuNGMwIC4zLS4zLjYtLjYuNmgtNi4zem0tLjEtMi4ySDEyOC42di0xYzAtMS4yLS43LTItMS45LTJzLTEuOS43LTEuOSAydjF6TTY2IDM1LjdoMS40Yy4zIDAgLjYtLjMuNi0uNnYtNy40YzAtMy40LTEuOC01LjQtNC44LTUuNC0uOSAwLTEuOS4yLTIuNS40VjE5YzAtLjgtLjctMS41LTEuNS0xLjVoLTEuNGMtLjMgMC0uNi4zLS42LjZ2MTdjMCAuMy4zLjYuNi42aDIuM2MuMyAwIC42LS4zLjYtLjZ2LTkuNGMuNS0uMiAxLjItLjMgMS43LS4zIDEuNSAwIDIuMS43IDIuMSAyLjR2Ni41Yy4xLjcuNyAxLjQgMS41IDEuNHptMTUuMS04LjRWMzFjMCAzLjEtMi4xIDUtNS42IDUtMy40IDAtNS42LTEuOS01LjYtNXYtMy43YzAtMy4xIDIuMS01IDUuNi01IDMuNSAwIDUuNiAxLjkgNS42IDV6bS0zLjUgMGMwLTEuMi0uNy0yLTItMnMtMiAuNy0yIDJWMzFjMCAxLjIuNyAxLjkgMiAxLjlzMi0uNyAyLTEuOXYtMy43em0tMjIuMy0xLjdjMCAzLjItMi40IDUuNC01LjYgNS40LS44IDAtMS41LS4xLTIuMi0uNHY0LjVjMCAuMy0uMy42LS42LjZoLTIuM2MtLjMgMC0uNi0uMy0uNi0uNlYxOS4yYzAtLjQuMy0uNy42LS44IDEuNS0uNSAzLS44IDQuNi0uOCAzLjYgMCA2LjEgMi4yIDYuMSA1LjZ2Mi40ek01MS43IDIzYzAtMS42LTEuMS0yLjQtMi42LTIuNC0uOSAwLTEuNS4zLTEuNS4zdjYuNmMuNi4zLjkuNCAxLjYuNCAxLjUgMCAyLjYtLjkgMi42LTIuNFYyM3ptNjguMiAyLjZjMCAzLjItMi40IDUuNC01LjYgNS40LS44IDAtMS41LS4xLTIuMi0uNHY0LjVjMCAuMy0uMy42LS42LjZoLTIuM2MtLjMgMC0uNi0uMy0uNi0uNlYxOS4yYzAtLjQuMy0uNy42LS44IDEuNS0uNSAzLS44IDQuNi0uOCAzLjYgMCA2LjEgMi4yIDYuMSA1LjZ2Mi40em0tMy42LTIuNmMwLTEuNi0xLjEtMi40LTIuNi0yLjQtLjkgMC0xLjUuMy0xLjUuM3Y2LjZjLjYuMy45LjQgMS42LjQgMS41IDAgMi42LS45IDIuNi0yLjRWMjN6Ii8+PHBhdGggZD0iTTI2IDE5LjNjMC0uNy0uNi0xLjMtMS4zLTEuM2gtMi40bC01LjUtNi4zYy0uNS0uNi0xLjMtLjgtMi4xLS42bC0xLjkuNmMtLjMuMS0uNC41LS4yLjdsNiA1LjdIOS41Yy0uMyAwLS41LjItLjUuNXYxYzAgLjcuNiAxLjMgMS4zIDEuM2gxLjR2NC44YzAgMy42IDEuOSA1LjcgNS4xIDUuNyAxIDAgMS44LS4xIDIuOC0uNXYzLjJjMCAuOS43IDEuNiAxLjYgMS42aDEuNGMuMyAwIC42LS4zLjYtLjZWMjAuOGgyLjNjLjMgMCAuNS0uMi41LS41di0xem0tNi40IDguNmMtLjYuMy0xLjQuNC0yIC40LTEuNiAwLTIuNC0uOC0yLjQtMi42di00LjhoNC40djd6IiBmaWxsPSIjZmZmIi8+PC9zdmc+" alt="PhonePe" />
        </button>

        <button onClick={() => openApp("paytm")}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/250px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" />
        </button>

        <button onClick={() => openApp("bhim")}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/UPI_logo.svg/250px-UPI_logo.svg.png" alt="BHIM" />
        </button>
      </div>

      {/* Instructions */}
      <div className="instructions">
        <h4>How to pay:</h4>
        <ol>
          <li>Scan the QR code with your UPI app</li>
          <li>Or click on your preferred payment app</li>
          <li>Confirm the payment details in your app</li>
          <li>Enter your UPI PIN to complete the transaction</li>
          <li>Wait for payment confirmation</li>
        </ol>
      </div>

      {/* Footer */}
      <div className="footer">
        © 2025 Secure Payment Gateway | Terms & Conditions
      </div>
    </div>
  );
};

export default vpa_to_intent;