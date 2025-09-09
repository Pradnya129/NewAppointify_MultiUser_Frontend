"use client";
import React, { useEffect } from "react";
import AppointmentList from "../../Components/Main_Dashboard/Appointments/AppointmentList";
import AppointmentsWidgets from "../../Components/Main_Dashboard/Appointments/AppointmentWidgets";
import Sidebar from "../../Components/Main_Dashboard/Dashboard_Page_Components/Sidebar";
import Navbar from "../../Components/Main_Dashboard/Dashboard_Page_Components/Navbar";
import { useRouter } from "next/navigation";

const Page = () => {
    const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/');
    }
  }, []);
  
  return (
  <>
        
        <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <AppointmentsWidgets />
        <AppointmentList />
      </div>
    </div>
      <div className="layout-overlay layout-menu-toggle"></div>
      </>
     
  );
};

export default Page;
