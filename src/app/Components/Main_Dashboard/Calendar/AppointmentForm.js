'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import validator from 'validator';

export default function AppointmentForm({
  plans,
  startHour,
  startMinute,
  startPeriod,
  endHour,
  endMinute,
  endPeriod,
  selectedAppointment,
  addAppointment,
  setAddAppointment,
  shiftStart,
  shiftEnd,
  bufferInMinutes,
  setBufferInMinutes,
  setSelectedShiftId,
   selectedPlanId,             // ✅ new
  setSelectedPlanId  
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    details: '',
    appointmentDate: '',
    appointmentTime: '',
    plan: '',
    amount: '',
    duration: '',
  });

  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
  const [errors, setErrors] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    if (!addAppointment && selectedAppointment) {
      setFormData({ ...selectedAppointment });
    } else if (addAppointment) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        details: '',
        appointmentDate: '',
        appointmentTime: '',
        plan: '',
        amount: '',
        duration: '',
      });
    }
  }, [selectedAppointment, addAppointment]);

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const isOverlapping = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
  };
 console.log("🟢 Triggering Slot Generation with: ");
console.log("Duration:", formData.duration);
console.log("Shift Start:", shiftStart);
console.log("Shift End:", shiftEnd);
console.log("Buffer:", bufferInMinutes);
const generateTimeSlots = (startTime, endTime, duration, buffer) => {



  if (!startTime || !endTime || isNaN(duration)) {
    console.warn("❌ Invalid shift time or duration. Cannot generate slots.");
    return [];
  }

  const slots = [];
  const cur = new Date(startTime);

  while (true) {
    const slotEnd = new Date(cur.getTime() + duration * 60000);
    if (slotEnd > endTime) break;

    slots.push({
      label: `${formatTime(cur)} - ${formatTime(slotEnd)}`,
      value: `${formatTime(cur)} - ${formatTime(slotEnd)}`,
      start: format24Hr(cur),
      end: format24Hr(slotEnd),
    });

    cur.setTime(slotEnd.getTime() + buffer * 60000);
  }

  console.log("✅ Generated slots:", slots);
  return slots;
};


  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const format24Hr = (date) => {
    return date.toTimeString().slice(0, 5);
  };

useEffect(() => {
  if (
    !formData.duration || 
    isNaN(formData.duration) || 
    !shiftStart || 
    !shiftEnd || 
    shiftStart.toString() === shiftEnd.toString()
  ) return;

  const duration = Number(formData.duration);
  if (shiftStart?.toString() === shiftEnd?.toString()) {
  console.warn("❌ shiftStart and shiftEnd are equal. Skipping slot generation.");
}

  const slots = generateTimeSlots(shiftStart, shiftEnd, duration, bufferInMinutes);
  setTimeSlots(slots);
}, [formData.duration, shiftStart, shiftEnd, bufferInMinutes, bookedTimeSlots]);


const handlePlanChange = async (e) => {
  const selectedPlan = plans.find(p => p.planName === e.target.value);
  if (!selectedPlan) return;

  const token = localStorage.getItem('token');



  try {
    const res = await axios.get(`http://localhost:5000/api/plan-shift-buffer-rule/all`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        planId: selectedPlan.planId,
      }
    });

    const buffer = res.data.bufferInMinutes;
    const shiftId = res.data.shiftId;

    setSelectedShiftId(shiftId); // Update if it changed
    setBufferInMinutes(buffer);
  } catch (error) {
    console.error("❌ Failed to fetch buffer/shift:", error);
  }

  setFormData(prev => ({
    ...prev,
    plan: selectedPlan.planName,
    amount: selectedPlan.planPrice,
    duration: selectedPlan.planDuration,
    appointmentTime: ''
  }));
  console.log("selectedPlanId",selectedPlanId)
  setSelectedPlanId(selectedPlan.planId);  
};




  const handleDateSelect = (e) => {
    const selectedDate = e.target.value;
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate < today) {
      alert("Please select a future date.");
      return;
    }
    setFormData(prev => ({ ...prev, appointmentDate: selectedDate, appointmentTime: '' }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!validator.isEmail(formData.email)) errs.email = 'Invalid email';
    if (!formData.phoneNumber.trim()) errs.phoneNumber = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phoneNumber)) errs.phoneNumber = 'Must be 10 digits';
    if (!formData.plan) errs.plan = 'Plan is required';
    if (!formData.amount) errs.amount = 'Amount is required';
    if (!formData.duration) errs.duration = 'Duration is required';
    if (!formData.appointmentDate) errs.appointmentDate = 'Date is required';
    if (!formData.appointmentTime) errs.appointmentTime = 'Time is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    console.log("Submitting data:", formData);


    try {
      const res = await fetch(`http://localhost:5000/api/customer-appointments/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        new bootstrap.Modal(document.getElementById('failureModal')).show();
        return;
      }

      const newAppointment = await res.json();
      setAppointments(prev => [...prev, newAppointment]);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        details: '',
        appointmentDate: '',
        appointmentTime: '',
        plan: '',
        amount: '',
        duration: '',
      });
      new bootstrap.Modal(document.getElementById('successModal')).show();
    } catch (err) {
      console.error('Error:', err);
      new bootstrap.Modal(document.getElementById('failureModal')).show();
    }
  };

  useEffect(() => {
    if (formData.appointmentDate && formData.plan) {
      fetch(`http://localhost:5000/api/customer-appointments/booked-slots/${formData.appointmentDate}`)
        .then(res => res.json())
        .then(data => setBookedTimeSlots(data))
        .catch(err => console.error("Error fetching booked slots:", err));
    }
  }, [formData.appointmentDate, formData.plan]);

  const handleTimeSelect = (value) => {
  setFormData(prev => ({
    ...prev,
    appointmentTime: value
  }));
};

  return (
    <>
      <form onSubmit={handleSubmit} className="container py-3" style={{ maxWidth: 600 }}>
        {/* First Name + Last Name */}
        <div className="row mb-3">
          <div className="col-sm-6">
            <label className="form-label">First Name</label>
            <input name="firstName" className={`form-control ${errors.firstName ? 'is-invalid' : ''}`} value={formData.firstName} onChange={handleInputChange} />
            {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
          </div>
          <div className="col-sm-6">
            <label className="form-label">Last Name</label>
            <input name="lastName" className={`form-control ${errors.lastName ? 'is-invalid' : ''}`} value={formData.lastName} onChange={handleInputChange} />
            {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
          </div>
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input name="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} value={formData.email} onChange={handleInputChange} />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        {/* Phone Number */}
        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input name="phoneNumber" className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`} value={formData.phoneNumber} onChange={handleInputChange} />
          {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
        </div>

        {/* Plan Dropdown */}
        <div className="mb-3">
          <label className="form-label">Plan</label>
          <select name="plan" className={`form-select ${errors.plan ? 'is-invalid' : ''}`} value={formData.plan} onChange={handlePlanChange}>
            <option value="">Select a Plan</option>
            {plans.map((p, i) => (
              <option key={i} value={p.planName}>{p.planName}</option>
            ))}
          </select>
          {errors.plan && <div className="invalid-feedback">{errors.plan}</div>}
        </div>

        {/* Amount and Duration */}
        <div className="mb-3">
          <label className="form-label">Amount</label>
          <input name="amount" className={`form-control ${errors.amount ? 'is-invalid' : ''}`} value={formData.amount} readOnly />
          {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Duration (minutes)</label>
          <input name="duration" className={`form-control ${errors.duration ? 'is-invalid' : ''}`} value={formData.duration} readOnly />
          {errors.duration && <div className="invalid-feedback">{errors.duration}</div>}
        </div>

        {/* Date Picker */}
        <div className="mb-3">
          <label className="form-label">Appointment Date</label>
          <input type="date" name="appointmentDate" className={`form-control ${errors.appointmentDate ? 'is-invalid' : ''}`} value={formData.appointmentDate} onChange={handleDateSelect} min={new Date().toISOString().split('T')[0]} />
          {errors.appointmentDate && <div className="invalid-feedback">{errors.appointmentDate}</div>}
        </div>

        {/* Time Slots */}
        {addAppointment && formData.appointmentDate && (
          <div className="mb-3">
            <label className="form-label">Available Time Slots</label>
            <div className="d-flex flex-wrap gap-2">
              {timeSlots.map(({ value }, index) => {
                const [startStr, endStr] = value.split('-').map(s => s.trim());
                const start = parseTime(startStr);
                const end = parseTime(endStr);
                const isBooked = bookedTimeSlots.some(slot => {
                  const [bStartH, bStartM, bStartS] = slot.startTime.split(':').map(Number);
                  const bookedStart = new Date();
                  bookedStart.setHours(bStartH, bStartM, bStartS, 0);

                  const [bEndH, bEndM, bEndS] = slot.endTime.split(':').map(Number);
                  const bookedEnd = new Date();
                  bookedEnd.setHours(bEndH, bEndM, bEndS, 0);

                  return isOverlapping(start, end, bookedStart, bookedEnd) && slot.status === "Scheduled";
                });

                const isSelected = formData.appointmentTime === value;
                return (
                  <button key={index} type="button" className={`btn btn-sm ${isBooked ? 'btn-danger' : isSelected ? 'btn-primary' : 'btn-outline-primary'}`} disabled={isBooked} onClick={() => handleTimeSelect(value)}>
                    {value}
                  </button>
                );
              })}
            </div>
            {errors.appointmentTime && <div className="text-danger mt-1">{errors.appointmentTime}</div>}
          </div>
        )}

        {/* Notes */}
        <div className="mb-3">
          <label className="form-label">Additional Details</label>
          <textarea name="details" className="form-control" rows="3" value={formData.details} onChange={handleInputChange}></textarea>
        </div>

        {/* Submit */}
        {addAppointment && (
          <button type="submit" className="btn btn-success w-100">Add Appointment</button>
        )}
      </form>

      {/* Modals */}
      <div className="modal fade" id="successModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center">
            <div className="modal-header">
              <h5 className="modal-title w-100">Appointment Booked</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">Your appointment has been successfully booked.</div>
            <div className="modal-footer justify-content-center">
              <button className="btn btn-success" data-bs-dismiss="modal">OK</button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="failureModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center">
            <div className="modal-header">
              <h5 className="modal-title w-100">Booking Failed</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">Something went wrong while booking the appointment.</div>
            <div className="modal-footer justify-content-center">
              <button className="btn btn-danger" data-bs-dismiss="modal">Try Again</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
