'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Chart,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PieController,
  BarController,
  LineController,
} from 'chart.js';

Chart.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PieController,
  BarController,
  LineController
);
import { jwtDecode } from "jwt-decode";
import axios from 'axios';


const ChartComponent = () => {
  const revenueChartRef = useRef(null);
  const revenueBarChartRef = useRef(null);
  const growthChartRef = useRef(null);

  const revenueChartInstance = useRef(null);
  const revenueBarChartInstance = useRef(null);
  const growthChartInstance = useRef(null);

  const [appointments, setAppointments] = useState([]);
  const [planNames, setPlanNames] = useState([]);
  const [revenueByPlan, setRevenueByPlan] = useState({});
  const [range, setRange] = useState("6m");

 useEffect(() => {
  async function fetchData() {
    try {
       const token = localStorage.getItem("token");
  
    if (!token) return;
  
    const decoded = jwtDecode(token);
    const adminId = decoded.id; 
      const [appointmentsRes, plansRes] = await Promise.all([
           
  axios.get(`http://localhost:5000/api/customer-appointments/admin/${adminId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }),
        fetch(`http://localhost:5000/api/admin/plans/all`, {
          headers: {
            // If your endpoint requires auth
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      const plansJson = await plansRes.json();

      // appointmentsJson is probably { success, data: [...] }
      const appointments = appointmentsRes?.data || [];
      const plans = plansJson?.data || [];

      setAppointments(appointments);
      setPlanNames(plans.map(plan => plan.planName.trim()));
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  }

  fetchData();
}, []);

  useEffect(() => {
    if (!appointments.length || !planNames.length) return;

    // Destroy existing charts
    revenueChartInstance.current?.destroy();
    revenueBarChartInstance.current?.destroy();
    growthChartInstance.current?.destroy();

    // === PIE CHART ===
const revenueMap = {};
planNames.forEach(plan => revenueMap[plan] = 0);

// ✅ Normalize function to handle whitespace
const normalizePlan = (plan) => plan?.trim() || '';

// ✅ Today's date (used to filter past appointments)
const today = new Date().toISOString().split('T')[0];

// ✅ Filter only past and completed appointments
const pastCompletedAppointments = appointments.data.filter(appt => {
  const isPaid = appt.paymentStatus === 1;
  return isPaid ;
});



console.log("Past Completed Appointments:", pastCompletedAppointments);

// ✅ Sum revenue by normalized plan name
pastCompletedAppointments.forEach(appt => {
  const plan = normalizePlan(appt.plan);
  const amount = parseFloat(appt.amount) || 0;

  if (!planNames.includes(plan)) {
    console.warn(`Skipping unknown plan: "${plan}"`);
    return;
  }

  revenueMap[plan] += amount;
  console.log(`Adding ₹${amount} to ${plan}`);
});

// ✅ Set state for chart rendering
setRevenueByPlan(revenueMap);

// ✅ Prepare chart data
const pieLabels = Object.keys(revenueMap);
const pieData = Object.values(revenueMap);
const pieColors = pieLabels.map((_, i) => colorPalette[i % colorPalette.length]);

// ✅ Destroy previous chart instance (if any)
if (revenueChartInstance.current) {
  revenueChartInstance.current.destroy();
}

// ✅ Create Chart.js pie chart
revenueChartInstance.current = new Chart(revenueChartRef.current, {
  type: 'pie',
  data: {
    labels: pieLabels,
    datasets: [{
      label: 'Revenue by Plan (Past Completed)',
      data: pieData,
      backgroundColor: pieColors,
    }]
  },
  options: {
    responsive: true,
      maintainAspectRatio: false, 
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.label}: ₹${ctx.parsed.toLocaleString('en-IN')}`
        }
      },
      legend: { display: false }
    }
  }
});


    // === BAR CHART ===
    const monthCount = range === "12m" ? 12 : 6;
    const now = new Date();
    const monthlyRevenueMap = {};

    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyRevenueMap[key] = { total: 0, date: d };
    }

    appointments.forEach(appt => {
     const d = new Date(appt.createdDate); // ✅ use payment timestamp
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthlyRevenueMap[key]) {
        monthlyRevenueMap[key].total += appt.amount;
      }
    });

    const sorted = Object.values(monthlyRevenueMap).sort((a, b) => a.date - b.date);
    const barLabels = sorted.map(obj => obj.date.toLocaleString('default', { month: 'short', year: 'numeric' }));
    const barData = sorted.map(obj => obj.total);

    revenueBarChartInstance.current = new Chart(revenueBarChartRef.current, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: [{
          label: 'Monthly Revenue',
          data: barData,
          backgroundColor: 'rgba(108, 99, 255, 0.8)',
          borderRadius: 8,
          barThickness: 30,
        }]
      },
      options: {
        responsive: true,
          maintainAspectRatio: false, 
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `₹${ctx.raw.toLocaleString('en-IN')}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Revenue (₹)' }
          },
          x: {
            title: { display: true, text: 'Month' }
          }
        }
      }
    });

    // === LINE CHART ===
    const weeks = [0, 0, 0, 0, 0];
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    appointments.forEach(appt => {
      const d = new Date(appt.createdDate);
      if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
        const week = Math.floor((d.getDate() - 1) / 7);
        if (week >= 0 && week < 5) weeks[week]++;
      }
    });

    growthChartInstance.current = new Chart(growthChartRef.current, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
        datasets: [{
          label: 'Appointments This Week',
          data: weeks,
          borderColor: '#FF6384',
          backgroundColor: 'rgba(255,99,132,0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
          maintainAspectRatio: false, 
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Appointments' }
          },
          x: {
            title: { display: true, text: 'Weeks' }
          }
        }
      }
    });

    return () => {
      revenueChartInstance.current?.destroy();
      revenueBarChartInstance.current?.destroy();
      growthChartInstance.current?.destroy();
    };
  }, [appointments, planNames, range]);

  const colorPalette = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#C9CBCF', '#8BC34A', '#E91E63', '#00BCD4',
    '#795548', '#607D8B', '#F44336', '#3F51B5', '#009688',
    '#CDDC39', '#FFC107', '#9C27B0', '#03A9F4', '#673AB7',
  ];

return (
<>
  {/* Revenue by Plan - PIE CHART */}
  
<div className="card mb-4">
  <div className="card-body">
    <h5 className="text-center mb-4">Revenue by Plan</h5>
    <div className="row g-4">
      {/* Chart */}
      <div className="col-md-6 col-12 d-flex justify-content-center align-items-center">
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <canvas ref={revenueChartRef}></canvas>
        </div>
      </div>

      {/* Plan List */}
      <div className="col-md-6 col-12">
        <ul className="list-unstyled m-0">
          {Object.entries(revenueByPlan).map(([plan, value], index) => (
            <li
              key={index}
              className="d-flex align-items-start gap-2 mb-3"
              style={{
                borderBottom: '1px dashed #ddd',
                paddingBottom: '8px'
              }}
            >
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: colorPalette[index % colorPalette.length],
                  flexShrink: 0,
                  marginTop: '5px'
                }}
              ></span>
              <div className="flex-grow-1">
                <div className="fw-medium" style={{ wordBreak: 'break-word' }}>
                  {plan}
                </div>
                <div className="text-muted small">₹{value.toLocaleString('en-IN')}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
</div>



{/* Monthly Revenue - BAR CHART */}
<div className="card mb-4">
  <div className="card-body">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="mb-0">Monthly Revenue</h5>
      <select
        value={range}
        onChange={e => setRange(e.target.value)}
        className="form-select form-select-sm w-auto"
      >
        <option value="6m">Last 6 Months</option>
        <option value="12m">Last 12 Months</option>
      </select>
    </div>
    {/* ✅ Wrap canvas in height-fixed div */}
    <div style={{ height: '300px' }}>
      <canvas ref={revenueBarChartRef} />
    </div>
  </div>
</div>

{/* Appointments Growth - LINE CHART */}
<div className="card mb-4">
  <div className="card-body">
    <h5 className="text-center mb-3">Appointments Growth (This Month)</h5>
    {/* ✅ Wrap canvas in height-fixed div */}
    <div style={{ height: '300px' }}>
      <canvas ref={growthChartRef} />
    </div>
  </div>
</div>

</>

);

};

export default ChartComponent;
