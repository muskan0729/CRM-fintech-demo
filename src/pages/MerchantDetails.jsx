import React, { useEffect, useState } from 'react'
import { usePost } from '../hooks/usePost'
import { useParams } from 'react-router-dom'
import { useGet } from '../hooks/useGet'
import useAutoFetch from '../hooks/useAutoFetch'

import Chart from "react-apexcharts";
import MyBarChart from '../components/MyBarChart';


const MerchantDetails = () => {
  const { id } = useParams();
  const [chartKey, setChartKey] = useState(0);

useEffect(() => {
  const handleResize = () => {
    setChartKey(prev => prev + 1);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

const { data: getMerchant } = useGet(
  id ? `/show-merchant/${id}` : null
);
 const {data:record} = useGet(id ? `/Merchant-Collection?merchant_id=${id}`: null);
// console.log("records data: ",record);
//  const {data:getMerchant} = useGet(`/show-merchant/${id}`);


  const merchant = getMerchant?.data;
//  console.log("show merchnant",getMerchant);


 const chartCount  =record?.transactionStatusCounts || {};
 const [filter,setFilter] =  useState('payin');
 const {data:Bank_payin} = useGet("/payinbanks-List");
const bankList = Bank_payin?.data?.data || [];
const payinBankName =
  bankList.find((bank) => bank.id == merchant?.payin_bank)?.onboard_payin_bank || "N/A";
// console.log(bankList);

const MerchantTable = ({ merchant }) => {
  const schemeId = merchant?.scheme_id;
  const { data: schemeData } = useGet(
    schemeId ? `/show-scheme/${schemeId}` : null
  );
  const scheme = schemeData?.data;  
  if (!merchant) return <p>Loading...</p>;

return (
  <div className="w-full shadow-md rounded-lg bg-white ">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
      {[
        ["Merchant Name", merchant.name],
        ["Email", merchant.email],
        ["Mobile", merchant.mobile_no],
        ["Address", merchant.address],
        ["Account Holder", merchant.account_holder_name],
        ["Bank Account", merchant.bank_account_no],
        ["Bank IFSC", merchant.ifsc_code],
        ["Company Pan Number", merchant.company_pan_no],
        ["Company GST Number", merchant.company_gst_no],
        ["Company CIN Number", merchant.cin_llpin],
        ["Date of Incorporation", merchant.date_of_incorporation],
        ["Website URL", merchant.website_url],
        ["Onboarded Payin Bank", payinBankName],
        ["Onboarded Payout Bank", merchant.payout_at_onboard],
        ["Scheme Name", scheme?.name ?? "null"],
        ["payin scheme", scheme?.payin_commision_amount || "00"], 
        ["payout scheme Below 700", scheme?.payout_commision_amount_below || "00"], 
        ["payout scheme above 700", scheme?.payout_commision_amount_above|| "00"], 
        ["Rolling Payin Amount", scheme?.rolling_payin_amount || "00"], 
        ["Rolling Fixed Amount", scheme?.rolling_fixed_amount || "00"], 
        ["GST", scheme?.gst_amount || "00"], 

      ].map(([label, value], index) => (
        <div
          key={index}
          className="border border-gray-300 flex items-center"
        >
          <div className="w-1/2 bg-gray-50 px-3 py-2 font-semibold text-gray-700 border-r border-gray-300">
            {label}
          </div>
          <div className="w-1/2 px-3 py-2 text-gray-800">
            {value}
          </div>
        </div>
      ))}
    </div>
  </div>
);


};


// const chartSeries = chartCount
//   ? [
//       chartCount.pending ?? 0,
//       chartCount.success ?? 0,
//       chartCount.initiated ?? 0,
//     ]
//   : [0, 0, 0];


const chartSeries = filter === 'payin'
  ? [
      record?.payinTransactionStatusCounts?.failed ?? 0,
      record?.payinTransactionStatusCounts?.success ?? 0,
      record?. payinTransactionStatusCounts ?.initiated ?? 0,
    ]
  : [
      record?.payoutTransactionStatusCounts?.pending ?? 0,
      record?.payoutTransactionStatusCounts?.success ?? 0,
      record?.payoutTransactionStatusCounts?.initiated ?? 0,
    ];



const chartLabels = ["failed", "Success", "Initiated"];

const pieOptions = {
  chart: {
    type: 'donut',
    background: '#ffffff', // light theme
    dropShadow: {
      enabled: true,
      top: 5,
      left: 0,
      blur: 8,
      opacity: 0.2,
    },
  },
  labels: ["Failed", "Success", "Initiated"],
  colors: ['#E57373', '#a18acaff', '#b9a358ff'], // Success = dark green (#006400)
  // colors: ['#0947ccff', '#124612ff', '#EF9A9A'],

  legend: {
    position: "bottom",
    labels: {
      colors: '#555',
    },
  },
  plotOptions: {
    pie: {
      startAngle: -90,
      endAngle: 270, // tilt for 3D effect
      donut: {
        size: '65%',
        background: 'transparent',
        labels: {
          show: true,
          name: { show: true, color: '#333' },
          value: { show: true, color: '#333' },
        },
      },
    },
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.9,
      gradientToColors: ['#cc9e09ff', '#032f68ff','#EF9A9A'], 
      // gradientToColors: ['#0947ccff', '#124612ff', '#EF9A9A'],

      // Success gradient = dark green (#004d00)
      inverseColors: false,
      // opacityFrom: 0.9,
      // opacityTo: 0.7,
      stops: [0, 100],
    },
  },
  tooltip: {
    theme: 'light',
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: { width: 300 },
        legend: { position: "bottom" },
      },
    },
  ],
};



//  console.log("record data",record);



  return (
   <div className="p-4">
      <div className="flex items-center justify-between py-6">

      <h1 className="text-xl"><span className="text-xl font-bold">Merchant Details: </span><span className="text-xm"></span> </h1>
       
<div className="flex items-center gap-4 ">
  {filter === 'payout' && (
    <div class="">
      <div className="text-gray-600 text-xl font-medium mb-1 bg-blue-100 px-3 py-2 rounded-lg">
        Payout Wallet :<span className="font-bold text-xl">₹ {record?.payout_wallet ?? 0}</span> 
      </div>
 
    </div>
  )}
  <div className="relative inline-flex items-center bg-gray-100 rounded-full p-1 w-64">
    <div
      className={`absolute top-1 bottom-1 left-1 w-1/2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-transform duration-500
        ${filter === 'payout' ? 'translate-x-full' : 'translate-x-0'}`}
    />

    {['payin', 'payout'].map((type) => (
      <button
        key={type}
        onClick={() => setFilter(type)}
        className="relative z-10 w-1/2 py-3 text-center font-medium capitalize"
      >
        <span className={filter === type ? 'text-white' : 'text-gray-600'}>
          {type}
        </span>
      </button>
    ))}

  </div>



</div>
      </div>
        
      {/* Cards */}
      {record && (
        <>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
  {filter === 'payin' && (
    <>
      {/* Expected Payin */}
      <div className="bg-gradient-to-r from-blue-100 to-blue-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2"> Today's Expected Settlement</h3>
        <p className="text-3xl font-bold text-blue-600">₹ {record.todayPayingAmount}</p>
      </div>
    
      {/* Payin Wallet */}
      <div className="bg-gradient-to-r from-green-100 to-green-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Payin Wallet</h3>
        <p className="text-3xl font-bold text-green-600">₹ {record.PayingAmount}</p>
      </div>

      {/* Total Profit */}
      <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Total Profit</h3>
        <p className="text-3xl font-bold text-yellow-600">₹ {record.PayinProfitAmount}</p>
      </div>

      {/* Total Payin */}
      <div className="bg-gradient-to-r from-purple-100 to-purple-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Total Payin</h3>
        <p className="text-3xl font-bold text-purple-600">₹ {record.total_payin_amount}</p>
      </div>
    </>
  )}

  {filter === 'payout' && (
    <>
      {/* Total Payout */}
      <div className="bg-gradient-to-r from-red-100 to-red-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Total Payout</h3>
        <p className="text-3xl font-bold text-red-600">₹ {record.total_payout_amount}</p>
      </div>

      {/* Today's Payout */}
      <div className="bg-gradient-to-r from-pink-100 to-pink-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Today's Payout</h3>
        <p className="text-3xl font-bold text-pink-600">₹ {record.today_payout}</p>
      </div>

      {/* Payout Wallet */}
      <div className="bg-gradient-to-r from-purple-100 to-purple-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Todays Charges</h3>
        <p className="text-3xl font-bold text-purple-600">₹ {record.todayPayoutgAmount}</p>
      </div>

      {/* Payout Refunded */}
      <div className="bg-gradient-to-r from-orange-100 to-orange-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Total Charges</h3>
        <p className="text-3xl font-bold text-orange-600">₹ {record.total_profit}</p>
      </div>
    </>
  )}
</div>


        </>

      )}
   {record && (
  <div className="bg-white p-6 rounded-xl shadow-md flex flex-col lg:flex-row gap-6">
    {/* Pie Chart */}
    <div className="flex-1">
      <h3 className="text-lg font-semibold mb-4">Transaction Status Distribution</h3>
      {chartSeries.some(val => val > 0) ? (
        <Chart
          options={pieOptions}
          series={chartSeries}
          type="pie"
          height={300}
          key={`pie-${chartKey}-${filter}`}
        />
      ) : (
        <div className="text-center text-gray-500">
          No transaction data available yet
        </div>
      )}
    </div>

    {/* Line Chart */}
    <div className="flex-1">
      <h3 className="text-lg font-semibold mb-4">Transactions Over Time</h3>
     {/* <MyBarChart record={record} type="payin" />
    <MyBarChart record={record} type="payout" /> */}
    <MyBarChart record={record} type={filter} 
    key={`bar-${chartKey}-${filter}`} />


    </div>
  </div>
)}

  
<div className="bg-white shadow-xl/30 rounded-2xl p-6 mb-6 mt-8">

  <MerchantTable  merchant={merchant} />
</div>

    </div>

  )
}

export default MerchantDetails