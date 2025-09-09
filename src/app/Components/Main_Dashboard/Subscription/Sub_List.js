"use client";
import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Sub_List.css';

const initialData = [
  {
    id: 1,
    name: 'Ananya Sharma',
    total: '₹1500',
    mobile: '9876543210',
    plan: 'Intensive Wellness',
    expiryDate: '2025-04-15',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Rohan Verma',
    total: '₹500',
    mobile: '9123456789',
    plan: 'Basic Consultation',
    expiryDate: '2025-04-10',
    status: 'Expired',
  },
  {
    id: 3,
    name: 'Meera Kapoor',
    total: '₹1000',
    mobile: '9988776655',
    plan: 'Comprehensive Therapy',
    expiryDate: '2025-04-20',
    status: 'Active',
  },
];

const Sub_List = () => {
  const [clients, setClients] = useState(initialData);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const handleEditClick = (client) => {
    setEditingClient({ ...client }); // clone to avoid direct mutation
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setClients((prev) =>
      prev.map((c) => (c.id === editingClient.id ? editingClient : c))
    );
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients((prev) => prev.filter((client) => client.id !== id));
    }
  };

  return (
    <>
      <div className="card shadow-lg rounded-4">
        <div className="card-body p-4 table-responsive">
          <table className="table table-bordered table-hover align-middle text-nowrap">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Total</th>
                <th>Mob No</th>
                <th>Plan</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => (
                <tr key={client.id}>
                  <td>{index + 1}</td>
                  <td>{client.name}</td>
                  <td>{client.total}</td>
                  <td>{client.mobile}</td>
                  <td>{client.plan}</td>
                  <td>{client.expiryDate}</td>
                  <td>
                    <span className={`badge ${client.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      title="Edit"
                      onClick={() => handleEditClick(client)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Delete"
                      onClick={() => handleDelete(client.id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bootstrap Modal */}
      {showModal && editingClient && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 shadow">
              <div className="modal-header">
                <h5 className="modal-title">Edit Client</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={editingClient.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mobile</label>
                    <input
                      type="text"
                      name="mobile"
                      className="form-control"
                      value={editingClient.mobile}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Plan</label>
                    <input
                      type="text"
                      name="plan"
                      className="form-control"
                      value={editingClient.plan}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Total</label>
                    <input
                      type="text"
                      name="total"
                      className="form-control"
                      value={editingClient.total}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      className="form-control"
                      value={editingClient.expiryDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={editingClient.status}
                      onChange={handleInputChange}
                    >
                      <option>Active</option>
                      <option>Expired</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
  );
};

export default Sub_List;
