'use client';
import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InvoicePreview = () => {
  const invoice = {
    invoiceNumber: '86423',
    dateIssued: 'April 25, 2021',
    dateDue: 'May 25, 2021',
    consultant: {
      name: 'Thomas Shelby',
      address: 'Shelby Company Limited, Small Heath, B10 0HF, UK',
      contact: '718-986-6062',
      email: 'peakyFBlinders@gmail.com'
    },
    billing: {
      totalDue: 'Rs.12,110.55',
      bankName: 'American Bank',
      country: 'United States',
      iban: 'ETD95476213874685',
      swiftCode: 'BR91905'
    },
    plans: [
      {
        id: '001',
        name: 'Basic Consultation Plan',
        price: 'Rs.2500',
        description: 'Access to standard features',
        duration: '45 minutes'
      },
      {
        id: '002',
        name: 'Premium Plan',
        price: 'Rs.4000',
        description: 'Comprehensive Therapy Plan',
        duration: '60 minutes'
      },
      {
        id: '003',
        name: 'Enterprise Plan',
        price: 'Rs.6000',
        description: 'Intensive Mental Wellness Plan',
        duration: '90 minutes'
      }
    ],
    summary: {
      subtotal: '$154.25',
      discount: '$00.00',
      tax: '$50.00',
      total: '$204.25'
    }
  };



  return (
    <div className="container mt-4">
      <div className="card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5>Invoice #{invoice.invoiceNumber}</h5>
            <p>Date Issued: {invoice.dateIssued}</p>
            <p>Date Due: {invoice.dateDue}</p>
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-md-6">
            <h6>Consultant Details</h6>
            <p><strong>Name:</strong> {invoice.consultant.name}</p>
            <p><strong>Address:</strong> {invoice.consultant.address}</p>
            <p><strong>Contact:</strong> {invoice.consultant.contact}</p>
            <p><strong>Email:</strong> {invoice.consultant.email}</p>
          </div>
          <div className="col-md-6">
            <h6>Bill To</h6>
            <p><strong>Total Due:</strong> {invoice.billing.totalDue}</p>
            <p><strong>Bank Name:</strong> {invoice.billing.bankName}</p>
            <p><strong>Country:</strong> {invoice.billing.country}</p>
            <p><strong>IBAN:</strong> {invoice.billing.iban}</p>
            <p><strong>SWIFT Code:</strong> {invoice.billing.swiftCode}</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#ID</th>
                <th>Plan Name</th>
                <th>Price</th>
                <th>Description</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {invoice.plans.map(plan => (
                <tr key={plan.id}>
                  <td>{plan.id}</td>
                  <td>{plan.name}</td>
                  <td>{plan.price}</td>
                  <td>{plan.description}</td>
                  <td>{plan.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-end mt-4">
          <div className="text-end">
            <p><strong>Subtotal:</strong> {invoice.summary.subtotal}</p>
            <p><strong>Discount:</strong> {invoice.summary.discount}</p>
            <p><strong>Tax:</strong> {invoice.summary.tax}</p>
            <p><strong>Total:</strong> {invoice.summary.total}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;