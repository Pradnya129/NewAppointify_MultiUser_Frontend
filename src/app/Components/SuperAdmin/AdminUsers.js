"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [errors, setErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/superadmin/manageAdmins/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setAlertMessage({ type: 'error', text: 'Failed to load users. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser({ ...user });
    setShowModal(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;
    const token = localStorage.getItem('token');

    // Validate form fields
    const validationErrors = {};
    if (!selectedUser.firstName || selectedUser.firstName.trim() === '') {
      validationErrors.firstName = 'First name is required';
    }
    if (!selectedUser.lastName || selectedUser.lastName.trim() === '') {
      validationErrors.lastName = 'Last name is required';
    }
    if (!selectedUser.email || selectedUser.email.trim() === '') {
      validationErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(selectedUser.email)) {
      validationErrors.email = 'Email is invalid';
    }
    if (!selectedUser.phoneNumber || selectedUser.phoneNumber.trim() === '') {
      validationErrors.phoneNumber = 'Phone number is required';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setUpdating(true);
    try {
      const res = await axios.put(
        `http://localhost:5000/api/superadmin/manageAdmins/${selectedUser.id}`,
        selectedUser,
        { headers: 
          { Authorization: `Bearer ${token}`,
        
        } }
      );
setUsers(users.map((u) => (u.id === selectedUser.id ? res.data.admin : u)));
      setShowModal(false);
      setSelectedUser(null);
      setAlertMessage({ type: 'success', text: 'User updated successfully' });
    } catch (err) {
      console.error('Error updating user:', err);
      setAlertMessage({ type: 'error', text: 'Failed to update user' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setDeleting(id);
    try {
      await axios.delete(`http://localhost:5000/api/superadmin/manageAdmins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u.id !== id));
      setAlertMessage({ type: 'success', text: 'User deleted successfully' });
    } catch (err) {
      console.error('Error deleting user:', err);
      setAlertMessage({ type: 'error', text: 'Failed to delete user' });
    } finally {
      setDeleting(null);
    }
  };

  // Auto-hide alert messages after 5 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  return (
    <div className="card p-3 rounded-4 mt-5">
      <div className="card-header border-bottom mb-3">
        <h5 className="mb-0"> Total Users</h5>
      </div>

      {/* Alert Messages */}
      {alertMessage && (
        <div className={`alert alert-${alertMessage.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show mb-3`} role="alert">
          {alertMessage.text}
          <button type="button" className="btn-close" onClick={() => setAlertMessage(null)}></button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <FaSpinner className="fa-spin me-2" />
          Loading users...
        </div>
      )}

      {/* No Users Message */}
      {!loading && users.length === 0 && (
        <div className="text-center py-4 text-muted">
          No users found.
        </div>
      )}

      {/* Table for larger screens */}
      <div className="table-responsive d-none d-md-block">
        <table className="table table-bordered table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Sr. No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Business</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id || index}>
                <td>{index + 1}</td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.businessName}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(user)}
                      disabled={updating || deleting === user.id}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(user.id)}
                      disabled={updating || deleting === user.id}
                    >
                      {deleting === user.id ? <FaSpinner className="fa-spin" /> : <FaTrash />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards for mobile screens */}
      <div className="d-block d-md-none">
        {users.map((user, index) => (
          <div key={user.id || index} className="card mb-3 shadow-sm border rounded-lg p-3">
            <h6 className="fw-bold mb-2">
              #{index + 1} - {user.firstName} {user.lastName}
            </h6>
            <p className="mb-1"><strong>Email:</strong> {user.email}</p>
            <p className="mb-1"><strong>Phone:</strong> {user.phoneNumber}</p>
            <p className="mb-1"><strong>Business:</strong> {user.businessName}</p>
            <div className="d-flex gap-2 mt-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleEdit(user)}
                disabled={updating || deleting === user.id}
              >
                <FaEdit /> Edit
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(user.id)}
                disabled={updating || deleting === user.id}
              >
                {deleting === user.id ? <FaSpinner className="fa-spin me-1" /> : <FaTrash />} Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for editing */}
      {showModal && selectedUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                      value={selectedUser.firstName}
                      onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                    />
                    {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                      value={selectedUser.lastName}
                      onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                    />
                    {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                      value={selectedUser.phoneNumber}
                      onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                    />
                    {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
                  </div>

                  <div className="text-center mt-3">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSaveChanges}
                      disabled={updating}
                    >
                      {updating ? <><FaSpinner className="fa-spin me-2" />Saving...</> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
