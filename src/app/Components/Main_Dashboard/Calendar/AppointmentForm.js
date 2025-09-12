// src/components/AppointmentForm.jsx
'use client';
import React, { useEffect, useState } from 'react';
import validator from 'validator';
import { api } from '../../../../api';
import { jwtDecode } from "jwt-decode";


export default function AppointmentForm({
  plans,
  addAppointment,
  selectedAppointment,
  shiftStart,             // Date object (or null)
  shiftEnd,               // Date object (or null)
  setSlotStartTime,       // setter from parent
  setSlotEndTime,         // setter from parent
  bufferInMinutes,
  setBufferInMinutes,
  setSelectedShiftId,
  selectedPlanId,
  setSelectedPlanId,
  refreshAppointments,
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

  const [bookedTimeSlots, setBookedTimeSlots] = useState([]); // expected array of booked slots for chosen date
  const [errors, setErrors] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);

  // load selected appointment into form if viewing/editing
  useEffect(() => {
    if (!addAppointment && selectedAppointment) {
      // map API fields into our formModel
      setFormData({
        firstName: selectedAppointment.firstName || '',
        lastName: selectedAppointment.lastName || '',
        email: selectedAppointment.email || '',
        phoneNumber: selectedAppointment.phoneNumber || '',
        details: selectedAppointment.details || '',
        appointmentDate: selectedAppointment.appointmentDate || '',
        appointmentTime: selectedAppointment.appointmentTime || '',
        plan: selectedAppointment.plan || '',
        amount: selectedAppointment.amount || '',
        duration: selectedAppointment.duration || '',
      });
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
      setTimeSlots([]);
      setBookedTimeSlots([]);
    }
  }, [selectedAppointment, addAppointment]);

  // Helper: parse "3:35 AM" -> Date (today) with that hour/minute
  const parseTimeToDate = (timeStr, baseDate = new Date()) => {
    if (!timeStr) return null;
    const [timePart, ampm] = timeStr.split(' ');
    const [hStr, mStr] = timePart.split(':');
    let hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    const d = new Date(baseDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  // parse "HH:mm" or "HH:mm:ss" to Date (today)
  const parse24ToDate = (time24, baseDate = new Date()) => {
    if (!time24) return null;
    const [hStr, mStr] = time24.split(':');
    const d = new Date(baseDate);
    d.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);
    return d;
  };

  const format12 = (date) => {
    if (!date) return '';
    let h = date.getHours();
    const m = String(date.getMinutes()).padStart(2, '0');
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${period}`;
  };

  const format24 = (date) => {
    if (!date) return '';
    return date.toTimeString().slice(0, 5);
  };

  const isOverlapping = (s1, e1, s2, e2) => s1 < e2 && s2 < e1;

  // generate time slots between shiftStart and shiftEnd using duration (minutes) and buffer
  const generateTimeSlots = (startDate, endDate, durationMin, bufferMin) => {
    if (!startDate || !endDate || !durationMin || durationMin <= 0) return [];
    const slots = [];
    let cur = new Date(startDate);

    while (true) {
      const slotEnd = new Date(cur.getTime() + durationMin * 60000);
      if (slotEnd > endDate) break;

      slots.push({
        label: `${format12(cur)} - ${format12(slotEnd)}`,
        value: `${format12(cur)} - ${format12(slotEnd)}`,
        start: format24(cur),
        end: format24(slotEnd),
      });

      // move cur by duration + buffer
      cur = new Date(slotEnd.getTime() + (bufferMin || 0) * 60000);
    }
    return slots;
  };

  // Recompute slots whenever shiftStart/shiftEnd/duration/buffer/booked change
 useEffect(() => {
  if (!formData.duration || isNaN(Number(formData.duration))) {
    setTimeSlots([]);
    return;
  }
  if (!shiftStart || !shiftEnd) {
    setTimeSlots([]);
    return;
  }

  const duration = Number(formData.duration);
  const buffer = Number(formData.bufferInMinutes || 0);

  const slots = generateTimeSlots(shiftStart, shiftEnd, duration, buffer);
  setTimeSlots(slots);
}, [formData.duration, formData.bufferInMinutes, shiftStart, shiftEnd, bookedTimeSlots]);

  // When plan is selected -> fetch plan-shift-rule, set buffer & shift, update form data amount/duration
const handlePlanChange = async (e) => {
  const planName = e.target.value;
  const selectedPlan = plans.find(p => p.planName === planName);

  if (!selectedPlan) {
    setFormData(prev => ({ ...prev, plan: planName }));
    return;
  }

  setFormData(prev => ({
    ...prev,
    plan: selectedPlan.planName,
    amount: selectedPlan.planPrice,
    duration: selectedPlan.planDuration,
    appointmentTime: ""
  }));

  try {
    // 🔹 fetch all rules
    const rulesResp = await api.getPlanShiftRules(selectedPlan.planId);
    const rules = rulesResp.rules ?? [];

    // 🔹 find rule for this planId
    const rule = rules.find(r => r.planId === selectedPlan.planId);

    if (!rule) {
      setFormData(prev => ({ ...prev, bufferInMinutes: 0 }));
      setBufferInMinutes(0);
      setSelectedShiftId(null);
    } else {
      setFormData(prev => ({
        ...prev,
        bufferInMinutes: rule.bufferInMinutes ?? 0
      }));
      setBufferInMinutes(rule.bufferInMinutes ?? 0);
      setSelectedShiftId(rule.shiftId);
    }

    // 🔹 fetch shifts and match the one from this rule
    const shiftsArray = await api.getShifts();
    const shift = (Array.isArray(shiftsArray) ? shiftsArray : []).find(
      s => s.id === rule?.shiftId
    );

    if (shift) {
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];

      const startDate = new Date(`${dateStr}T${shift.startTime}`);
      let endDate = new Date(`${dateStr}T${shift.endTime}`);
      if (endDate <= startDate) endDate.setDate(endDate.getDate() + 1);

      if (typeof setSlotStartTime === "function") setSlotStartTime(startDate);
      if (typeof setSlotEndTime === "function") setSlotEndTime(endDate);
      if (typeof setSelectedPlanId === "function")
        setSelectedPlanId(selectedPlan.planId);
    }
  } catch (err) {
    console.error("Error while selecting plan:", err);
  }
};


  // Handle date selection -> load booked slots for that date
  const handleDateSelect = (e) => {
    const selectedDate = e.target.value;
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate < todayStr) {
      alert('Please select a future date.');
      return;
    }
    setFormData(prev => ({ ...prev, appointmentDate: selectedDate, appointmentTime: '' }));

    // fetch booked slots for this date (include planId if available)
    (async () => {
      try {
        const res = await api.getBookedSlotsByDate(selectedDate, selectedPlanId);
        // the API should return an array (you showed no exact shape — we assume [{startTime:'HH:mm:ss', endTime:'HH:mm:ss', status:'Scheduled'}])
        setBookedTimeSlots(Array.isArray(res) ? res : (res.data ?? []));
      } catch (err) {
        console.error('Failed to fetch booked slots', err);
        setBookedTimeSlots([]);
      }
    })();
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

  const handleTimeSelect = (value) => {
    setFormData(prev => ({ ...prev, appointmentTime: value }));
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  try {
    // ✅ decode adminId from token
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Cannot book appointment.");
      return;
    }
    const decoded = jwtDecode(token);
    const adminId = decoded.id;

    // ✅ now include adminId in request body
    const body = {
      adminId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      details: formData.details,
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      plan: formData.plan,
      amount: formData.amount,
      duration: formData.duration
    };

    const res = await api.postAppointmentFree(body);

    if (typeof refreshAppointments === "function") refreshAppointments();

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      details: "",
      appointmentDate: "",
      appointmentTime: "",
      plan: "",
      amount: "",
      duration: "",
    });

    try {
      new window.bootstrap.Modal(document.getElementById("successModal")).show();
    } catch {}
  } catch (err) {
    console.error("Booking failed", err);
    try {
      new window.bootstrap.Modal(document.getElementById("failureModal")).show();
    } catch {}
  }
};


const isSlotBooked = (slot) => {
  if (!bookedTimeSlots || bookedTimeSlots.length === 0) return false;

  const baseDate = new Date();

  // slot.start & slot.end are "HH:mm" 24hr format
  const s1 = parse24ToDate(slot.start, baseDate);
  const e1 = parse24ToDate(slot.end, baseDate);

  for (const b of bookedTimeSlots) {
    let s2, e2;

    if (/AM|PM/i.test(b.startTime)) {
      // case: "10:00 AM"
      s2 = parseTimeToDate(b.startTime, baseDate);
      e2 = parseTimeToDate(b.endTime, baseDate);
    } else {
      // case: "10:00" or "10:00:00"
      s2 = parse24ToDate(b.startTime, baseDate);
      e2 = parse24ToDate(b.endTime, baseDate);
    }

    const status = (b.status || '').toString().toLowerCase();
    const shouldBlock =
      !status ||
      status === 'scheduled' ||
      status === 'rescheduled' ||
      status === 'pending';

    const overlap = isOverlapping(s1, e1, s2, e2);
    console.log(
      "🔍 Checking slot:",
      slot.label,
      "against booked:",
      b.startTime,
      "-",
      b.endTime,
      "→ overlap:",
      overlap,
      "shouldBlock:",
      shouldBlock
    );

    if (shouldBlock && overlap) return true;
  }
  return false;
};


  return (
    <>
      <form onSubmit={handleSubmit} className="container py-3" style={{ maxWidth: 600 }}>
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

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input name="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} value={formData.email} onChange={handleInputChange} />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input name="phoneNumber" className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`} value={formData.phoneNumber} onChange={handleInputChange} />
          {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Plan</label>
          <select name="plan" className={`form-select ${errors.plan ? 'is-invalid' : ''}`} value={formData.plan} onChange={handlePlanChange}>
            <option value="">Select a Plan</option>
            {plans.map((p, i) => <option key={p.planId || i} value={p.planName}>{p.planName}</option>)}
          </select>
          {errors.plan && <div className="invalid-feedback">{errors.plan}</div>}
        </div>

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

        <div className="mb-3">
          <label className="form-label">Appointment Date</label>
          <input type="date" name="appointmentDate" className={`form-control ${errors.appointmentDate ? 'is-invalid' : ''}`} value={formData.appointmentDate} onChange={handleDateSelect} min={new Date().toISOString().split('T')[0]} />
          {errors.appointmentDate && <div className="invalid-feedback">{errors.appointmentDate}</div>}
        </div>

        {addAppointment && formData.appointmentDate && (
          <div className="mb-3">
<label className="form-label">
  Available Time Slots (Buffer: {formData.bufferInMinutes || 0} min)
</label>
            <div className="d-flex flex-wrap gap-2">
              {timeSlots.length === 0 && <div className="text-muted">No slots available — check shift or duration.</div>}
              {timeSlots.map((slot, idx) => {
                const booked = isSlotBooked(slot);
                const selected = formData.appointmentTime === slot.value;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`btn btn-sm ${booked ? 'btn-danger' : selected ? 'btn-primary' : 'btn-outline-primary'}`}
                    disabled={booked}
                    onClick={() => handleTimeSelect(slot.value)}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
            {errors.appointmentTime && <div className="text-danger mt-1">{errors.appointmentTime}</div>}
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Additional Details</label>
          <textarea name="details" className="form-control" rows="3" value={formData.details} onChange={handleInputChange}></textarea>
        </div>

        {addAppointment && <button type="submit" className="btn btn-success w-100">Add Appointment</button>}
      </form>

      {/* modals (same markup as you had) */}
      <div className="modal fade" id="successModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center">
            <div className="modal-header"><h5 className="modal-title w-100">Appointment Booked</h5><button className="btn-close" data-bs-dismiss="modal"></button></div>
            <div className="modal-body">Your appointment has been successfully booked.</div>
            <div className="modal-footer justify-content-center"><button className="btn btn-success" data-bs-dismiss="modal">OK</button></div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="failureModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center">
            <div className="modal-header"><h5 className="modal-title w-100">Booking Failed</h5><button className="btn-close" data-bs-dismiss="modal"></button></div>
            <div className="modal-body">Something went wrong while booking the appointment.</div>
            <div className="modal-footer justify-content-center"><button className="btn btn-danger" data-bs-dismiss="modal">Try Again</button></div>
          </div>
        </div>
      </div>
    </>
  );
}
