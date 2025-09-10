'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const SubscriptionAssigned = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found');
          setLoading(false);
          return;
        }
        const decoded = jwtDecode(token);
        const adminId = decoded.id;

        const url = `http://localhost:5000/api/superAdmin/sub_plans/subscriptions/${adminId}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Subscription response:', response.data);
        // Assuming response.data is an array, take the first item or handle as needed
        const subscriptionData = Array.isArray(response.data) ? response.data[0] : response.data;
        setSubscription(subscriptionData);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="badge bg-success d-inline-flex align-items-center">
            <FaCheckCircle className="me-1" />
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="badge bg-warning d-inline-flex align-items-center">
            <FaTimesCircle className="me-1" />
            Inactive
          </span>
        );
      case 'Expired':
        return (
          <span className="badge bg-danger d-inline-flex align-items-center">
            <FaTimesCircle className="me-1" />
            Expired
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary d-inline-flex align-items-center">
            <FaClock className="me-1" />
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <FaSpinner className="spin" size={30} />
        <p>Loading subscription details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-5 text-center" role="alert">
        {error}
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="alert alert-warning my-5 text-center" role="alert">
        No subscription data available.
      </div>
    );
  }

  const { createdAt, updatedAt, plan, isActive, startDate, endDate, paymentStatus } = subscription;

  // Map isActive to status string
  const status = isActive ? 'Active' : 'Inactive';

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-header  text-white text-center py-4">
              <h3 className="mb-0 fw-bold">My Subscription Plan</h3>
              <p className="mb-0 ">Current active subscription</p>
            </div>
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="text-primary fw-bold mb-3">{plan?.planName || 'N/A'}</h2>
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <div className="pricing-section  px-4 py-2 me-3">
                    <span className="">Monthly:</span>
                    <span className="fs-4 fw-bold text-success ms-2">${plan?.monthlyPrice || 'N/A'}</span>
                  </div>
                  <div className="pricing-section  px-4 py-2">
                    <span className="">Annual:</span>
                    <span className="fs-4 fw-bold text-success ms-2">${plan?.annualPrice || 'N/A'}</span>
                  </div>
                </div>
                <div className="mb-4">
                  {getStatusBadge(status)}
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="feature-card p-3 bg-light rounded-3 text-center h-100">
                    <h6 className=" mb-2">Subscription Period</h6>
                    <div className="d-flex justify-content-between">
                      <div>
                        <small className="">Start</small>
                        <p className="mb-0 fw-semibold">{startDate ? new Date(startDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <small className="">End</small>
                        <p className="mb-0 fw-semibold">{endDate ? new Date(endDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="feature-card p-3 bg-light rounded-3 text-center h-100">
                    <h6 className=" mb-2">Payment Details</h6>
                    <p className="mb-1"><strong>Status:</strong> {paymentStatus || 'N/A'}</p>
                    <small className="">Auto-renewal enabled</small>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="feature-card p-3 text-center h-100">
                    <h6 className=" mb-2">Created</h6>
                    <p className="mb-0 fw-semibold">{createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}</p>
                    <small className="">{createdAt ? new Date(createdAt).toLocaleTimeString() : ''}</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="feature-card p-3  text-center h-100">
                    <h6 className=" mb-2">Last Updated</h6>
                    <p className="mb-0 fw-semibold">{updatedAt ? new Date(updatedAt).toLocaleDateString() : 'N/A'}</p>
                    <small className="">{updatedAt ? new Date(updatedAt).toLocaleTimeString() : ''}</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer  text-center py-3">
              <p className="mb-0 ">Need to change your plan? Contact support for assistance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionAssigned;
