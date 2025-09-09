'use client';
import React, { useEffect } from 'react'
import UsersWidgets from '../../Components/Main_Dashboard/Users/UsersWidgets'
import UsersList from '../../Components/Main_Dashboard/Users/UsersList'
import Navbar from '../../Components/Main_Dashboard/Dashboard_Page_Components/Navbar';
import Sidebar from '../../Components/Main_Dashboard/Dashboard_Page_Components/Sidebar';
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
  

<>
    
      <div className="content-wrapper">
            <div className="container-xxl flex-grow-1 container-p-y">
             <UsersWidgets/>
             <UsersList/>
                </div>
                </div>
       {/* <Dashboard_Content/> */}
  <div className="layout-overlay layout-menu-toggle"></div>
  </>
  )
}

export default Page
