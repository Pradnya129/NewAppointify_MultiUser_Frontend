'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaSpinner, FaCrown, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';

const SubscriptionAssigned = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        if (!token) {
          setError('No authentication token found.');
          return;
        }
        const decoded = jwtDecode(token);
        const adminId = decoded.id;
        const res = await axios.get(`http://localhost:5000/api/superAdmin/sub_plans/subscriptions/${adminId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSubscription(res.data);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Failed to load subscription details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSubscription();
    } else {
      setLoading(false);
      setError('No authentication token found.');
    }
  }, [token]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <FaSpinner className="fa-spin text-primary mb-3" style={{ fontSize: '2rem' }} />
          <h5 className="text-muted">Loading subscription details...</h5>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center py-4">
        {error}
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="alert alert-warning text-center py-4">
        No subscription assigned.
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <FaCrown className="me-2 text-warning" />
            My Assigned Subscription
          </h2>
          <p className="text-muted mb-0">View the subscription plan assigned by the superadmin</p>
        </div>
      </div>

      {/* Subscription Details Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <FaCrown className="me-2" />
            Subscription Details
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-4">
            {/* Plan Information */}
            <div className="col-md-6">
              <h6 className="text-muted mb-3">Plan Information</h6>
              <div className="mb-3">
                <strong>Plan Name:</strong> {subscription.plan?.planName || 'N/A'}
              </div>
              <div className="mb-3">
                <strong>Monthly Price:</strong> <span className="text-success fw-bold">${subscription.plan?.monthlyPrice || 'N/A'}</span>
              </div>
              <div className="mb-3">
                <strong>Annual Price:</strong> <span className="text-success fw-bold">${subscription.plan?.annualPrice || 'N/A'}</span>
              </div>
            </div>

            {/* Subscription Dates */}
            <div className="col-md-6">
              <h6 className="text-muted mb-3">Subscription Period</h6>
              <div className="mb-3">
                <strong>Created At:</strong> {new Date(subscription.createdAt).toLocaleDateString()}
              </div>
              <div className="mb-3">
                <strong>Updated At:</strong> {new Date(subscription.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-3 border-top">
            <h6 className="text-muted mb-3">Additional Information</h6>
            <p className="text-muted">
              This subscription was assigned by the superadmin. If you have any questions or need to make changes, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionAssigned;
