"use client";
import React, { useEffect } from "react";
import BillingForm from "../../Components/Main_Dashboard/Account/BillingForm";
import Billing_History from "../../Components/Main_Dashboard/Account/Billing_History";
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


                  
          <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row">
         

          <BillingForm />
          <Billing_History />
        </div>
      </div>
             
     
  );
};

export default Page;
