"use client";
import React, { useEffect } from 'react'
import Profile from '../../Components/Main_Dashboard/Account/Profile'
import { useRouter } from 'next/navigation'

const Page = () => {
    const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/');
    }
  }, []);
  
  return (
  
        
        <Profile/>
    
  )
}

export default Page
