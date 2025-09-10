import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { jwtDecode } from "jwt-decode";

import './Appointments.css'

export const appointmentStatusMap = {
  Scheduled: 'Scheduled',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  Rescheduled: 'Rescheduled',
  Pending: 'Pending'
};

export const paymentStatusMap = {
  Pending: 'Pending',
  Paid: 'Paid',
  Failed: 'Failed',
  Refunded: 'Refunded'
};

const AppointmentList = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);
    const adminId = decoded.id;

    axios.get(`http://localhost:5000/api/customer-appointments/admin/${adminId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(response => {
      const sortedAppointments = [...response.data.data].sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
      setAppointments(sortedAppointments);
    })
    .catch(error => {
      console.error('Error fetching appointments:', error);
    });
  }, [appointments]);

  function downloadPdf(base64Pdf) {
    const byteCharacters = atob(base64Pdf);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Appointment-Receipt.pdf`;
    link.click();
  }

  const handleEdit = (appt) => {
    setSelectedAppt({ ...appt });
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedAppt(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSelectedAppt((prevState) => ({
      ...prevState,
      [name]: value // keep string values
    }));
  };

  const handleDelete = (id) => {
    const updatedAppointments = appointments.filter((appt) => appt.id !== id);
    setAppointments(updatedAppointments);

    axios.delete(`http://localhost:5000/api/customer-appointments/delete/${id}`)
      .then(() => console.log(`Appointment ${id} deleted successfully.`))
      .catch(error => {
        console.error("Error deleting appointment:", error.response || error.message);
        setAppointments(appointments);  // Rollback on failure
      });
  };

  const handleSaveChanges = () => {
    const token = localStorage.getItem('token');
    axios.patch(
      `http://localhost:5000/api/customer-appointments/update/${selectedAppt.id}`,
      { ...selectedAppt },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    )
    .then((response) => {
       const updatedAppointments = appointments.map((appt) =>
    appt.id === selectedAppt.id
      ? { ...appt, ...selectedAppt } // keep original keys, update changed values
      : appt
      );
      setAppointments(updatedAppointments);
      setShowModal(false);
      setSelectedAppt(null);
     
    })
    .catch((error) => {
      console.error('Error updating appointment:', error.response?.data || error.message);
      alert('Failed to update appointment');
    });
  };

  const handleViewInvoice = async (apptId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(` https://appointify.coinagesoft.com/api/CustomerAppointment/GetInvoice`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { id: apptId },
      });

      if (response.data?.base64Pdf) downloadPdf(response.data.base64Pdf);
      else alert("Invalid or missing invoice data.");
    } catch (error) {
      console.error("Failed to fetch invoice PDF:", error.response?.data || error.message);
      alert("Could not load invoice. Please try again.");
    }
  };

  const getPaymentBadgeColor = (status) => {
    return status === "Pending" ? 'secondary' :
           status === "Paid" ? 'success' :
           status === "Failed" ? 'danger' :
           status === "Refunded" ? 'warning' : 'dark';
  };

  const getAppointmentBadgeColor = (status) => {
    return status === "Scheduled" ? 'secondary' :
           status === "Completed" ? 'success' :
           status === "Cancelled" ? 'danger' :
           status === "Rescheduled" ? 'warning' :
           status === "Pending" ? 'danger' : 'dark';
  };

  return (
    <>
      <div className="card p-3 rounded-4 mt-5">
        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
          <div className="d-block d-md-none mx-auto mb-3">
            <h5 className="mb-0">Appointments</h5>
          </div>
          <div className="d-none d-md-block mb-3">
            <h5 className="mb-0">Appointments</h5>
          </div>
        </div>

        <div className="table-responsive">
          <div className="table-responsive d-none d-md-block">
            <table className="table align-middle table-bordered table-hover mb-0 text-nowrap">
              <thead className="table-light">
                <tr>
                  <th>Sr. No</th>
                  <th>Client Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Duration</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Time</th>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th>Payment ID</th>
                  <th>Payment Status</th>
                  <th>Appointment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt, index) => (
                  <tr key={appt.id || index}>
                    <td>{index + 1}</td>
                    <td>{appt.firstName} {appt.lastName}</td>
                    <td>{appt.email}</td>
                    <td>{appt.phoneNumber}</td>
                    <td>{appt.duration}</td>
                    <td>{appt.plan}</td>
                    <td>{appt.amount}</td>
                    <td>{appt.appointmentTime}</td>
                    <td>{appt.appointmentDate}</td>
                    <td>{appt.paymentMethod}</td>
                    <td>{appt.paymentId || "None"}</td>
                    <td>
                      <span className={`badge bg-${getPaymentBadgeColor(appt.paymentStatus)}`}>
                        {appt.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${getAppointmentBadgeColor(appt.appointmentStatus)}`}>
                        {appt.appointmentStatus}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(appt)}>
                          <FaEdit />
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(appt.id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modal for editing appointment */}
{showModal && selectedAppt && (
  <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content rounded-4">
        <div className="modal-header">
          <h5 className="modal-title">Edit Appointment</h5>
          <button type="button" className="btn-close" onClick={handleClose}></button>
        </div>
        <div className="modal-body">
          <form>
            {/* First Name */}
            <div className="mb-3">
              <label className="form-label">First Name</label>
              <input type="text" className="form-control" name="firstName" value={selectedAppt.firstName} onChange={handleInputChange} />
            </div>

            {/* Last Name */}
            <div className="mb-3">
              <label className="form-label">Last Name</label>
              <input type="text" className="form-control" name="lastName" value={selectedAppt.lastName} onChange={handleInputChange} />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" name="email" value={selectedAppt.email} onChange={handleInputChange} />
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input type="text" className="form-control" name="phoneNumber" value={selectedAppt.phoneNumber} onChange={handleInputChange} />
            </div>

            {/* Duration */}
            <div className="mb-3">
              <label className="form-label">Duration</label>
              <input type="text" className="form-control" name="duration" value={selectedAppt.duration} onChange={handleInputChange} />
            </div>

            {/* Plan */}
            <div className="mb-3">
              <label className="form-label">Plan</label>
              <input type="text" className="form-control" name="plan" value={selectedAppt.plan} onChange={handleInputChange} />
            </div>

            {/* Amount */}
            <div className="mb-3">
              <label className="form-label">Amount</label>
              <input type="number" className="form-control" name="amount" value={selectedAppt.amount} onChange={handleInputChange} />
            </div>

            {/* Time */}
            <div className="mb-3">
              <label className="form-label">Time</label>
              <input type="text" className="form-control" name="appointmentTime" value={selectedAppt.appointmentTime} onChange={handleInputChange} />
            </div>

            {/* Date */}
            <div className="mb-3">
              <label className="form-label">Date</label>
              <input type="date" className="form-control" name="appointmentDate" value={selectedAppt.appointmentDate} onChange={handleInputChange} />
            </div>

            {/* Payment Method */}
            <div className="mb-3">
              <label className="form-label">Payment Method</label>
              <select className="form-select" name="paymentMethod" value={selectedAppt.paymentMethod || 'None'} onChange={handleInputChange}>
                <option value="">Select Payment Method</option>
                <option value="Cash">Cash</option>
                <option value="Gpay/Online">Gpay/Online</option>
              </select>
            </div>

            {/* Payment Status */}
            <div className="mb-3">
              <label className="form-label">Payment Status</label>
              <select className="form-select" name="paymentStatus" value={selectedAppt.paymentStatus} onChange={handleInputChange}>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            {/* Appointment Status */}
            <div className="mb-3">
              <label className="form-label">Appointment Status</label>
              <select className="form-select" name="appointmentStatus" value={selectedAppt.appointmentStatus} onChange={handleInputChange}>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Payment ID */}
            <div className="mb-3">
              <label className="form-label">Payment ID</label>
              <input type="text" className="form-control" name="paymentId" readOnly value={selectedAppt.paymentId || 'None'} onChange={handleInputChange} />
            </div>

            {/* Save Button */}
            <div className="text-center mt-3">
              <button type="button" className="btn btn-primary" onClick={()=>{handleSaveChanges(),handleClose()}} >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Modal code stays the same */}
    </>
  );
};

export default AppointmentList;
