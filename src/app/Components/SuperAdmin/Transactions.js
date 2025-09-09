"use client"
import React from 'react';

const Transactions = () => {
  // Static data for now
  const transactions = [
    { id: 1, date: '2024-06-01', user: 'John Doe', amount: '$100.00', status: 'Completed' },
    { id: 2, date: '2024-06-02', user: 'Jane Smith', amount: '$250.00', status: 'Pending' },
    { id: 3, date: '2024-06-03', user: 'Alice Johnson', amount: '$75.00', status: 'Failed' },
  ];

  return (
    <div className="card p-3 rounded-4 mt-5">
      <div className="card-header border-bottom mb-3">
        <h5 className="mb-0">Transactions</h5>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>User</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.date}</td>
                <td>{tx.user}</td>
                <td>{tx.amount}</td>
                <td>{tx.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
