"use client";

import React from 'react';
import { FaEye, FaDownload } from 'react-icons/fa';

const BillingHistory = () => {
  const dummyData = [
    {
      id: 'INV-001',
      number: 1,
      client: 'John Doe Enterprises',
      total: '$1,200.00',
      issuedDate: '2024-12-15',
      balance: '$0.00',
      status: 'Paid',
    },
    {
      id: 'INV-002',
      number: 2,
      client: 'Tech Solutions Ltd.',
      total: '$2,300.00',
      issuedDate: '2025-01-10',
      balance: '$500.00',
      status: 'Partial',
    },
    {
      id: 'INV-003',
      number: 3,
      client: 'Creative Minds',
      total: '$3,000.00',
      issuedDate: '2025-02-05',
      balance: '$3,000.00',
      status: 'Unpaid',
    },
  ];

  const handleView = (invoice) => {
    alert(`Viewing Invoice: ${invoice.id}\nClient: ${invoice.client}\nTotal: ${invoice.total}`);
  };

  const handleDownload = (invoice) => {
    const blob = new Blob([`Invoice ID: ${invoice.id}\nClient: ${invoice.client}\nTotal: ${invoice.total}`], {
      type: 'text/plain',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="card my-4">
      <h5 className="card-header text-center text-md-start pb-0">Billing History</h5>
      <div className="card-datatable table-responsive px-3 py-2">
        <table className="table table-bordered table-hover align-middle text-nowrap">
          <thead className="table-light">
            <tr>
              <th style={{ minWidth: '120px' }}>Invoice ID</th>
              <th style={{ minWidth: '60px' }}>No.</th>
              <th style={{ minWidth: '220px' }}>Client</th>
              <th style={{ minWidth: '130px' }}>Total</th>
              <th style={{ minWidth: '150px' }}>Issued Date</th>
              <th style={{ minWidth: '130px' }}>Balance</th>
              <th style={{ minWidth: '150px' }}>Invoice Status</th>
              <th style={{ minWidth: '160px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dummyData.map((invoice, index) => (
              <tr key={index}>
                <td>{invoice.id}</td>
                <td>{invoice.number}</td>
                <td>{invoice.client}</td>
                <td>{invoice.total}</td>
                <td>{invoice.issuedDate}</td>
                <td>{invoice.balance}</td>
                <td>
                  <span
                    className={`badge ${
                      invoice.status === 'Paid'
                        ? 'bg-success'
                        : invoice.status === 'Partial'
                        ? 'bg-warning'
                        : 'bg-danger'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      title="View Invoice"
                      onClick={() => handleView(invoice)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-success"
                      title="Download Invoice"
                      onClick={() => handleDownload(invoice)}
                    >
                      <FaDownload />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillingHistory;
