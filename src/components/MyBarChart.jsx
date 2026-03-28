// MyBarChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MyBarChart = ({ record, type = 'payin' }) => {
  // Determine which data to use based on filter
  const isPayin = type === 'payin';

  // Numbers, fallback to 0 if empty
  const totalAmount = Number(isPayin ? record.total_payin_amount : record.total_payout_amount) || 0;
  const todayAmount = Number(isPayin ? record.today_payin : record.today_payout) || 0;
  const profit = Number(isPayin ? record.todayPayingAmount : 0) || 0;
  // const rolling = Number(isPayin ? record.PayinRollingAmount : 0) || 0;

  // Status counts
  const statusCounts = isPayin
    ? record.payinTransactionStatusCounts || {}
    : record.payoutTransactionStatusCounts || {};

  const todayStatusCounts = isPayin
    ? record.todayPayinStatusCounts || {}
    : record.todayPayoutStatusCounts || {};

  const data = {
    labels: ['Total', 'Today', 'Profit',  'Success', 'Pending', 'Failed'],
    datasets: [
      {
        label: isPayin ? 'Payin Summary' : 'Payout Summary',
        data: [
          totalAmount,
          todayAmount,
          profit,
          Number(todayStatusCounts.success || 0),
          Number(todayStatusCounts.pending ||  0),
          Number(todayStatusCounts.failed ||  0),
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(201, 203, 207, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 2,
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: isPayin ? 'Payin Summary' : 'Payout Summary' },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
      x: { grid: { display: false } },
    },
  };

  return <Bar data={data} options={options} />;
};

export default MyBarChart;
