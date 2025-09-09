'use client';
import React, { useEffect } from 'react'
import Security from '../../Components/Main_Dashboard/Account/Security'
import Sidebar from '../../Components/Main_Dashboard/Dashboard_Page_Components/Sidebar';
import Navbar from '../../Components/Main_Dashboard/Dashboard_Page_Components/Navbar';
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
  
        <Security/>
      
  )
}

export default Page
