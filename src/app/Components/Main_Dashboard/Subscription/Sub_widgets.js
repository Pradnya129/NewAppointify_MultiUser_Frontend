"use client";
import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Sub_Widgets = () => {
  // These values can later come from backend API
  const stats = [
    {
      value: 24,
      label: 'Clients',
      icon: 'fas fa-user',
    },
    {
      value: 165,
      label: 'Invoices',
      icon: 'fas fa-file-invoice',
    },
    {
      value: '$2.46k',
      label: 'Paid',
      icon: 'fas fa-wallet',
    },
    {
      value: '$876',
      label: 'Unpaid',
      icon: 'fas fa-money-bill-wave',
    },
  ];

  return (
    <div className="card mb-5">
      <div className="card-body">
        <div className="row gy-4 gy-sm-1">
          {stats.map((stat, index) => (
            <div className="col-sm-6 col-lg-3" key={index}>
              <div className={`d-flex justify-content-between align-items-start ${index !== 3 ? 'border-end' : ''} pb-4 pb-sm-0`}>
                <div>
                  <h4 className="mb-0">{stat.value}</h4>
                  <p className="mb-0">{stat.label}</p>
                </div>
                <div className="avatar">
                  <span className="avatar-initial rounded-3">
                    <i className={`${stat.icon} text-primary fs-4`}></i>
                  </span>
                </div>
              </div>
              {index !== 3 && (
                <hr className={`d-none d-sm-block ${index === 0 || index === 1 ? 'd-lg-none' : ''}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sub_Widgets;
