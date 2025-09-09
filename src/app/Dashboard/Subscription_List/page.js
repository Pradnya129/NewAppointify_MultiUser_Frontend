'use client';
import React, { useEffect } from 'react'
import Sub_Widgets from '../../Components/Main_Dashboard/Subscription/Sub_widgets';
import Sub_List from '../../Components/Main_Dashboard/Subscription/Sub_List';
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
   
            <div className="container-xxl flex-grow-1 container-p-y">
             <Sub_Widgets/>
            <Sub_List/>
            </div>
                    
  )
}

export default Page
