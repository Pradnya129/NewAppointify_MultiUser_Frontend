"use client";
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation';
import CalendarComponent from '../../Components/Main_Dashboard/Calendar/CalendarComponent'
const Page = () => {
    const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/');
    }
  }, []);
  
  return (
    <div className='mx-5 ' style={{backgroundColor:"white"}}>
      <CalendarComponent />
    </div>
  )
}

export default Page
