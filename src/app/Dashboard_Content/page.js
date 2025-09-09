"use client"
import React, { useEffect } from 'react'
import Dashboard_Content from '../Components/Main_Dashboard/Dashboard_Page_Components/Dashboard_Content'

const Page = () => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/');
    }
  }, []);
  
  return (
    <div>
      <Dashboard_Content/>
    </div>
  )
}

export default Page
