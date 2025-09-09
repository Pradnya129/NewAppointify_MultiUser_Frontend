'use client'
import Sidebar from '../Dashboard_Page_Components/Sidebar'
import Navbar from '../Dashboard_Page_Components/Navbar'
import Dashboard_Content from '../Dashboard_Page_Components/Dashboard_Content'
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from 'react';
const Dashboard = () => {
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
   const [userRole, setUserRole] = useState(null);
  
     useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role); // ✅ set role in state
      }
    }, []);
  return (
      <div className="layout-wrapper layout-content-navbar">
              <div className="layout-container">
                 <Sidebar
        mobileSidebarVisible={mobileSidebarVisible}
        setMobileSidebarVisible={setMobileSidebarVisible}
      />
                <div className="layout-page">
                      <Navbar onToggleSidebar={() => setMobileSidebarVisible(prev => !prev)} />

                  {userRole === 'admin' && (
                  <Dashboard_Content/>)
                    }
                     {/* <Dashboard_Content/> */}
                </div>
                <div className="layout-overlay layout-menu-toggle"></div>
              </div>
            </div>
  )
};


export default withAuth(Dashboard);
