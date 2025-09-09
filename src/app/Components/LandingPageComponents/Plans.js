'use client';
import axios from 'axios';
import React, { forwardRef, useEffect, useState } from 'react';
import './Plans.css'

const API_URL = process.env.REACT_APP_API_URL;

const Plans = React.forwardRef((props, ref) => {
  const [formData, setFormData] = useState({
    tagline: '',
    mainDescription: '',
    mainHeading: '',
  });

  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`https://appointify.coinagesoft.com/api/Section5`);
        setFormData(res.data);
      } catch (error) {
        console.error("Error fetching section5 data:", error);
      }
    };

    const fetchPlans = async () => {
      try {
        const response = await fetch(`https://appointify.coinagesoft.com/api/ConsultationPlan/get-all`);

        if (!response.ok) {
          throw new Error('Failed to fetch plans');
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setPlans(data);
        } else {
          console.error('Expected an array for plans, but got:', data);
          setPlans([]);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlans([]);
      }
    };

    fetchData();
    fetchPlans();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <div
        className="position-relative bg-img-start"
        style={{ backgroundImage: 'url(dist/assets/svg/components/card-11.svg)' }}
      >
        {/* after checking this in swagger getting 404. need to check backend */}
        {/* <div className="container ">
          <div className="w-md-75 w-lg-70 text-center mx-auto mb-9" id="target-plans" ref={ref} >
            <h2>{formData.tagline}</h2>
            <p>{formData.mainDescription}</p>
           
          </div>
        </div> */}
      </div>

      {/* Plan Cards */}
      <div className="container py-5"> {/* Section spacing */}
        {/* <div className="text-center mb-5">
          <h2 className="fw-bold">Our Consultation Plans</h2>
          <p className="text-muted">Choose the plan that fits your needs</p>
        </div> */}

        <div className="container ">
          <div className="w-md-75 w-lg-70 text-center mx-auto mb-9" id="target-plans" ref={ref} >
            <h2>{formData.tagline}</h2>
            <p>{formData.mainDescription}</p>
            {/* <h3 className="mt-9 mb-0">{formData.mainHeading}</h3> */}
          </div>
        </div>

      <div className="row justify-content-center">
  {plans.map((plan) => (
    <div className="col-md-6 col-lg-4 mb-4" key={plan.planId}>
      <div className="card h-100 bg-primary text-white shadow-sm border-0 d-flex flex-column position-relative">

        {/* Minutes Badge at Top Center */}
        <div className="text-center pt-4">
          <span
            className="bg-white text-primary fw-bold px-3 py-1 rounded-pill shadow-sm"
            style={{ fontSize: '0.95rem' }}
          >
            ⏱ {plan.planDuration} minutes
          </span>
        </div>

        {/* Card Body */}
        <div className="card-body d-flex flex-column pt-3 px-4">
          {/* Plan Name */}
          <h5 className="fw-bold mb-2 text-white text-center">{plan.planName}</h5>

          {/* Plan Description */}
          <p className="text-white-75 small mb-3 text-center">{plan.planDescription}</p>

          {/* Plan Features */}
          <div
            className="plan-features px-2 mb-4"
            dangerouslySetInnerHTML={{ __html: plan.planFeatures }}
          />

          <div className="flex-grow-1"></div>
        </div>

        {/* Card Footer */}
        <div className="card-footer bg-transparent border-0 text-center pb-4">
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            {/* Price */}
            <div className="bg-white text-primary fw-bold rounded px-4 py-2 fs-5 shadow-sm">
              ₹{plan.planPrice}
            </div>

            {/* Book Now Button */}
            <button
              type="button"
              className="btn fw-semibold text-white px-4 py-2 rounded shadow"
              style={{
                backgroundColor: '#7d85f9',
                border: 'none',
                boxShadow: '0 0 12px rgba(125,133,249,0.5)',
                transition: 'all 0.3s ease-in-out',
              }}
              onClick={() =>
                props.scrollToSection({
                  planName: plan.planName,
                  planPrice: plan.planPrice,
                  planDuration: plan.planDuration,
                })
              }
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>


      </div>

    </div>
  );
});

Plans.displayName = "Plans";
export default Plans;
