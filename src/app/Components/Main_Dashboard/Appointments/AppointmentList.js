import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { jwtDecode } from "jwt-decode";

import './Appointments.css'
export const appointmentStatusMap = {
  0: 'Scheduled',
  1: 'Completed',
  2: 'Cancelled',
  3: 'Rescheduled',
  4:'Pending'
};

export const paymentStatusMap = {
  0: 'Pending',
  1: 'Paid',
  2: 'Failed',
  3: 'Refunded'
};
const API_URL = process.env.REACT_APP_API_URL;
const AppointmentList = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

  if (!token) return;

  const decoded = jwtDecode(token);
  const adminId = decoded.id; // ✅ decode adminId
    axios.get(`http://localhost:5000/api/customer-appointments/admin/${adminId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        console.log("appo",response,adminId)
        const sortedAppointments = [...response.data.data].sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
          setAppointments(sortedAppointments);

        // setAppointments(response.data);
        
      })
      .catch(error => {
        console.error('Error fetching appointments:', error);
      });
  }, []);

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

    const numericFields = ['paymentStatus', 'appointmentStatus'];

    setSelectedAppt((prevState) => ({
      ...prevState,
      [name]: numericFields.includes(name) ? parseInt(value) : value
    }));
  };

  const handleDelete = (id) => {
    const updatedAppointments = appointments.filter((appt) => appt.id !== id);
    setAppointments(updatedAppointments);

    axios.delete(`http://localhost:5000/api/customer-appointments/delete/${id}`)
      .then(() => {
        console.log(`Appointment ${id} deleted successfully.`);
      })
      .catch(error => {
        console.error("Error deleting appointment:", error.response || error.message);
        setAppointments(appointments);  // Rollback on failure
      });
  };

  const handleSaveChanges = () => {
    const token = localStorage.getItem('token');
    console.log("Selected appointment before update:", selectedAppt);
    axios.patch(
      `http://localhost:5000/api/customer-appointments/update/${selectedAppt.id}`,
      {
        
        firstName: selectedAppt.firstName,
        lastName: selectedAppt.lastName,
        email: selectedAppt.email,
        phoneNumber: selectedAppt.phoneNumber,
        duration: selectedAppt.duration,
        plan: selectedAppt.plan,
        amount: selectedAppt.amount,
        appointmentTime: selectedAppt.appointmentTime,
        appointmentDate: selectedAppt.appointmentDate,
        paymentMethod: selectedAppt.paymentMethod,
        appointmentStatus: selectedAppt.appointmentStatus,
        paymentStatus: selectedAppt.paymentStatus,
        paymentId: selectedAppt.paymentId

      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
      .then((response) => {

   
        const updatedAppointments = appointments.map((appt) =>
          appt.id === selectedAppt.id ? response.data : appt
        );
        console.log("selectedAppt", selectedAppt)
        console.log("updatedAppointments", updatedAppointments)
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        id: apptId, // 👈 use params instead of string concat
      },
    });


    if (response.data?.base64Pdf) {
      downloadPdf(response.data.base64Pdf);
    } else {
      alert("Invalid or missing invoice data.");
    }
  } catch (error) {
    console.error("Failed to fetch invoice PDF:", error.response?.data || error.message);
    alert("Could not load invoice. Please try again.");
  }
};

const getPaymentBadgeColor = (status) => {
  return status === 0 ? 'secondary' :
         status === 1 ? 'success' :
         status === 2 ? 'danger' :
         status === 3 ? 'warning' : 'dark';
};

const getAppointmentBadgeColor = (status) => {
  return status === 0 ? 'secondary' :
         status === 1 ? 'success' :
         status === 2 ? 'danger' :
         status === 3 ? 'warning' :
         status === 4 ? 'danger' : 'dark';
};


  return (
    <>
      <div className="card p-3 rounded-4 mt-5">
        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
{/* Mobile (centered) */}
<div className="d-block d-md-none mx-auto mb-3">
  <h5 className="mb-0">Appointments</h5>
</div>

{/* Desktop (left aligned) */}
<div className="d-none d-md-block mb-3">
  <h5 className="mb-0">Appointments</h5>
</div>

        </div>
        <div className="table-responsive">
         {/* Table for medium and large screens */}
<div className="table-responsive d-none d-md-block">
  <table className="table align-middle table-bordered  table-hover mb-0 text-nowrap">
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
            <span className={`badge bg-${appt.paymentStatus === 0 ? 'primary' :
                appt.paymentStatus === 1 ? 'success' :
                appt.paymentStatus === 2 ? 'danger' :
                appt.paymentStatus === 3 ? 'warning' : 'secondary'}`}>
              {paymentStatusMap[appt.paymentStatus]}
            </span>
          </td>
          <td>
            <span className={`badge bg-${appt.appointmentStatus === 0 ? 'primary' :
                appt.appointmentStatus === 1 ? 'success' :
                appt.appointmentStatus === 2 ? 'danger' :
                appt.appointmentStatus === 3 ? 'warning' :
                appt.appointmentStatus === 4 ? 'danger' : 'secondary'}`}>
              {appointmentStatusMap[appt.appointmentStatus]}
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

{/* Cards for mobile screens */}

<div className="d-block d-md-none">
  {appointments.map((appt, index) => (
    <div
      className="card mb-4 shadow-sm border border-secondary rounded-lg"
      key={appt.id || index}
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="card-header bg-primary text-white py-2 px-3 rounded-top">
        <strong>#{index + 1} - {appt.firstName} {appt.lastName}</strong>
      </div>

      <div className="card-body py-3 px-3">
       <div className="mb-3">
  {[
    ["Email", appt.email],
    ["Phone", appt.phoneNumber],
    ["Date", appt.appointmentDate],
    ["Time", appt.appointmentTime],
    ["Duration", appt.duration],
    ["Plan", appt.plan],
    ["Amount", `₹${appt.amount}`],
    ["Payment Mode", appt.paymentMethod],
    ["Payment ID", appt.paymentId || 'N/A']
  ].map(([label, value], i) => (
    <div className="row mb-2" key={i}>
      <div className="col-5 fw-medium text-secondary small">{label}</div>
      <div className="col-7 fw-semibold text-dark text-break small">{value}</div>
    </div>
  ))}
</div>


        {/* Status Badges */}
        <div className="mb-3 d-flex justify-content-between">
          <span className={`badge badge-pill badge-${getPaymentBadgeColor(appt.paymentStatus)}`}>
            {paymentStatusMap[appt.paymentStatus]}
          </span>
          <span className={`badge badge-pill badge-${getAppointmentBadgeColor(appt.appointmentStatus)}`}>
            {appointmentStatusMap[appt.appointmentStatus]}
          </span>
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-between">
          <button className="btn btn-sm btn-outline-primary w-48" onClick={() => handleEdit(appt)}>
            <FaEdit className="mr-1" /> Edit
          </button>
          <button className="btn btn-sm btn-outline-danger w-48" onClick={() => handleDelete(appt.id)}>
            <FaTrash className="mr-1" /> Delete
          </button>
        </div>
      </div>
    </div>
  ))}
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
                  {/* Patient Name */}
                  <div className="mb-3">
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-control" name="firstName" value={selectedAppt.firstName} onChange={handleInputChange} />
                  </div>
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
                    <select className="form-select" name="paymentMethod" value={selectedAppt.paymentMethod || ''} onChange={handleInputChange}>
                      <option value="">Select Payment Method</option>
                      <option value="Cash">Cash</option>
                      <option value="Gpay/Online">Gpay/Online</option>
                    </select>
                  </div>



                  {/* Payment Status */}
                  <div className="mb-3">
                    <label className="form-label">Payment Status</label>
                    <select className="form-select" name="paymentStatus" value={selectedAppt.paymentStatus} onChange={handleInputChange}>
                      <option value={"Pending"}>Pending</option>
                      <option value={"Paid"}>Paid</option>
                      <option value={"Failed"}>Failed</option>
                      <option value={"Refunded"}>Refunded</option>
                    </select>
                  </div>

                  {/* Appointment Status */}
                  <div className="mb-3">
                    <label className="form-label">Appointment Status</label>
                    <select className="form-select" name="appointmentStatus" value={selectedAppt.appointmentStatus} onChange={handleInputChange}>
                      <option value={0}>Scheduled</option>
                      <option value={1}>Completed</option>
                      <option value={2}>Cancelled</option>
                      <option value={3}>Rescheduled</option>
                       <option value={4}>Pending</option>
                    </select>

                  </div>
                  <div className="mb-3">
                    <label className="form-label">PaymentId</label>
                    <input type="text" className="form-control" name="paymentId" value={selectedAppt.paymentId} onChange={handleInputChange} />
                  </div>

                  <div className="text-center mt-3">
                    <button type="button" className="btn btn-primary" onClick={handleSaveChanges}>
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentList;
