'use client';
import React, { useEffect } from 'react'
import Section1 from '../../Components/Main_Dashboard/Change_Landing_Page_Components/Section1';
import Section2 from '../../Components/Main_Dashboard/Change_Landing_Page_Components/Section2';
import Section3 from '../../Components/Main_Dashboard/Change_Landing_Page_Components/Section3';
import Section4 from '../../Components/Main_Dashboard/Change_Landing_Page_Components/Section4';
import Section5 from '../../Components/Main_Dashboard/Change_Landing_Page_Components/Section5';
import Section6 from '../../Components/Main_Dashboard/Change_Landing_Page_Components/Section6';
import Section7 from '../../Components/Main_Dashboard/Change_Landing_Page_Components/Section7';
import 'font-awesome/css/font-awesome.min.css';
import { useRouter } from 'next/navigation';

// import Sidebar from '../../Components/Main_Dashboard/Dashboard_Page_Components/Sidebar';
// import Navbar from '../../Components/Main_Dashboard/Dashboard_Page_Components/Navbar';

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
      <Section1/>
      <Section2/>
      <Section3/>
      <Section4/>
      <Section5/>
      <Section6/>
      <Section7/>
      </div>
    </div>
                <div className="layout-overlay layout-menu-toggle"></div>
    
               
                <div className="layout-overlay layout-menu-toggle"></div>
            </>
        
  )
}

export default Page
