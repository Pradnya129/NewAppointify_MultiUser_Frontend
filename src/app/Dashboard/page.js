"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "../Dashboard/WithAuth/withAuth";
import { jwtDecode } from "jwt-decode";
import Dashboard_Content from "../Components/Main_Dashboard/Dashboard_Page_Components/Dashboard_Content";
import AdminUsers from "../Dashboard/AdminUsers/page.js"
const DashboardPage = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);
    } catch (err) {
      console.error("Invalid token", err);
      router.replace("/");
    }
  }, []);

  return (
    <>
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        {userRole === "admin" && <Dashboard_Content />}
        {userRole === "superadmin" && (
          <AdminUsers/>
        )}
        </div>
        </div>
        </>
  );
};

export default withAuth(DashboardPage);
