'use client';
import React, { useEffect } from 'react';
import Add_Plan from '../../Components/Main_Dashboard/Plans/Add_Plan';
// import Sidebar from '../../Components/Main_Dashboard/Dashboard_Page_Components/Sidebar';
// import Navbar from '../../Components/Main_Dashboard/Dashboard_Page_Components/Navbar';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useRouter } from 'next/navigation';

const Page = () => {
    const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/');
    }
  }, []);
  
  return (

     <Add_Plan/> 

  );
};

export default Page;
