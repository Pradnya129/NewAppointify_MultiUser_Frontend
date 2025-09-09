'use client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { jwtDecode } from "jwt-decode";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Calendar.css';
import AppointmentForm from './AppointmentForm';
import ShiftManager from './ShiftManager';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function CalendarComponent() {
  const offcanvasRef = useRef(null);
  const [plans, setPlans] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [slotStartTime, setSlotStartTime] = useState(new Date());
  const [slotEndTime, setSlotEndTime] = useState(new Date());
  const [bufferInMinutes, setBufferInMinutes] = useState(0);

  const getColorClass = (index) => {
   const colors = [
  'form-check-primary',
  'form-check-success',
  'form-check-warning',
  'form-check-danger',
  'form-check-info',
  // 'form-check-secondary',
  'form-check-dark',
  'form-check-light',
  'form-check-muted',
  'form-check-teal'
];

    return colors[index % colors.length];
  };



const fetchAppointments = () => {
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
    .then((response) => {
      let data = response.data;

      // Handle if API returns { appointments: [...] }
      if (data && !Array.isArray(data) && data.appointments) {
        data = data.appointments;
      }

      // Ensure it's always an array
      const appointmentsArray = Array.isArray(data) ? data : [];

      const sortedAppointments = appointmentsArray.sort(
        (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
      );
 console.log("sorted",sortedAppointments)
      setAppointments(sortedAppointments);
    })
    .catch((error) => {
      console.error("❌ Error fetching appointments:", error);
      setAppointments([]);
    });
};


  useEffect(() => {
    const offcanvasElement = offcanvasRef.current;
    const handleOffcanvasHidden = () => {
      setSelectedAppointment(null);
      fetchAppointments();
    };
    if (offcanvasElement) {
      offcanvasElement.addEventListener('hidden.bs.offcanvas', handleOffcanvasHidden);
    }
    return () => {
      if (offcanvasElement) {
        offcanvasElement.removeEventListener('hidden.bs.offcanvas', handleOffcanvasHidden);
      }
    };
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/admin/plans/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setPlans(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlans([]);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    setSelectedPlans(plans.map((p) => p.planName?.toLowerCase()));
  }, [plans]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!selectedPlanId) return;

    axios
      .get(`http://localhost:5000/api/admin/shift`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setShifts(res.data))
      .catch((err) => {
        console.error('❌ Error fetching shifts:', err);
        setShifts([]);
      });

    axios
      .get(`http://localhost:5000/api/plan-shift-buffer-rule/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { planId: selectedPlanId },
      })
      .then((res) => setBufferInMinutes(res.data.bufferInMinutes))
      .catch(() => setBufferInMinutes(0));
  }, [selectedPlanId]);

  useEffect(() => {
    if (!shifts.length || !selectedShiftId) return;
    const shift = shifts.find((s) => s.id === selectedShiftId);
    if (!shift) return;

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const start = new Date(`${dateStr}T${shift.startTime}`);
    let end = new Date(`${dateStr}T${shift.endTime}`);
    if (end <= start) end.setDate(end.getDate() + 1);

    setSlotStartTime(start);
    setSlotEndTime(end);
  }, [shifts, selectedShiftId]);

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  };

  const scheduledAppointments = appointments
    .filter(
      (a) =>
        selectedPlans.includes(a.plan?.toLowerCase()) &&
        (a.appointmentStatus === 0 || a.appointmentStatus === 3) // Only Scheduled or Rescheduled
    )
   .map((a) => {
  if (!a.appointmentTime || !a.appointmentDate) return null;

  const [startTime, endTime] = a.appointmentTime.split(" - ");
  if (!startTime || !endTime) return null;

  const start = `${a.appointmentDate}T${parseTime(startTime)}`;
  const end = `${a.appointmentDate}T${parseTime(endTime)}`;


  return {
    id: a.id,
    title: `${a.firstName} ${a.lastName}`,
    start,
    end,
    className: getColorClass(
          plans.findIndex(p => p.planName?.toLowerCase() === a.plan?.toLowerCase())
        ),
    extendedProps: {
      planName: a.plan?.toLowerCase(),
      status: a.appointmentStatus,
      appointmentTime: a.appointmentTime,
      id: a.id,
    },
  };
})
.filter(Boolean);


  const handleEventClick = (info) => {
    const { title, start, extendedProps } = info.event;
    const match = appointments.find(
      (a) =>
        `${a.firstName} ${a.lastName}` === title &&
        a.appointmentDate === start.toISOString().slice(0, 10) &&
        a.appointmentTime === extendedProps.appointmentTime
    );
    if (match) {
      setSelectedAppointment(match);
      const offcanvasEl = document.getElementById('addEventSidebar');
      const bsOffcanvas = new bootstrap.Offcanvas(offcanvasEl);
      bsOffcanvas.show();
    }
  };

  useEffect(() => {
    console.log("📅 Final Events Passed to Calendar:", scheduledAppointments);
    console.log("✅ Raw Appointments from API:", appointments);

  }, [scheduledAppointments, appointments]);

  return (
    <div className="container-xxl flex-grow-1 container-p-y" style={{ backgroundColor: 'white' }}>
      <div className="card app-calendar-wrapper">
        <div className="row g-0">
          <div className="col app-calendar-sidebar border-end" id="app-calendar-sidebar">
            <div className="p-4 border-bottom">
              <button className="btn btn-primary w-100" data-bs-toggle="offcanvas" data-bs-target="#addEventSidebar" aria-controls="addEventSidebar">
                + Add Appointment
              </button>
            </div>
              <div className="px-4">

                {/* <DatePicker
                  inline

                /> */}

                <hr className="mb-5 mx-n4 mt-3" />
                <div className="mb-4 ms-1">
                  <h5>Event Filters</h5>
                </div>
                <div className="form-check form-check-secondary mb-5 ms-3">
                  <input
                    className="form-check-input select-all"
                    type="checkbox"
                    id="selectAll"
                    checked={selectedPlans.length === plans.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlans(plans.map(p => p.planName?.toLowerCase()));
                      } else {
                        setSelectedPlans([]);
                      }
                    }}
                  />

                  <label className="form-check-label" htmlFor="selectAll">View All</label>
                </div>

                <div className="app-calendar-events-filter text-heading">
                  {plans.map((plan, index) => (
                    <div className={`form-check ${getColorClass(index)} mb-3 ms-3`} key={index}>
                      <input
                        className="form-check-input input-filter"
                        type="checkbox"
                        id={`select-${plan.planName?.toLowerCase() || 'unknown'}`}
                        data-value={plan.planName?.toLowerCase() || 'unknown'}
                        checked={selectedPlans.includes(plan.planName?.toLowerCase())}


                        onChange={(e) => {
                          const planValue = plan.planName?.toLowerCase();
                          if (e.target.checked) {
                            setSelectedPlans(prev => [...prev, planValue]);
                          } else {
                            setSelectedPlans(prev => prev.filter(p => p !== planValue));
                          }
                          console.log("Changed Plan:", planValue);
                          console.log("Selected Plans:", selectedPlans);
                        }}

                      />

                      <label
                        className="form-check-label"
                        htmlFor={`select-${plan.planName?.toLowerCase() || 'unknown'}`}
                      >
                        {plan.planName || 'Unnamed Plan'}
                      </label>
                    </div>
                  ))}

                </div>


              </div>
          </div>

          <div className="col app-calendar-content overflow-auto ">
            <div className=" border-0">
              <div className=" ps-0 pb-0 ">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={scheduledAppointments}
                  eventClick={handleEventClick}
                  headerToolbar={{
                    left: 'prev,next',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                  }}
                  buttonText={{
                    // today: 'Today',
                    month: 'Month',
                    week: 'Week',
                    day: 'Day',
                    list: 'List'
                  }}
                  eventContent={(info) => {
                    return {
                        html: `<div class="custom-event ${info.event.classNames.join(' ')}">
               ${info.event.title}
             </div>`
                      };
                  }}
                />
              </div>
            </div>
            <div ref={offcanvasRef} className="offcanvas offcanvas-end" id="addEventSidebar">
              <div className="offcanvas-header border-bottom">
                <h5 className="offcanvas-title">{selectedAppointment ? 'View Appointment' : 'Add Appointment'}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" onClick={() => setSelectedAppointment(null)}></button>
              </div>
              <div className="offcanvas-body">
                <AppointmentForm
                  plans={plans}
                  slotStartTime={slotStartTime}
                  slotEndTime={slotEndTime}
                  setSlotStartTime={setSlotStartTime}
                  setSlotEndTime={setSlotEndTime}
                  addAppointment={!selectedAppointment}
                  selectedAppointment={selectedAppointment}
                  setAddAppointment={() => { }}
                  shiftStart={slotStartTime}
                  shiftEnd={slotEndTime}
                  bufferInMinutes={bufferInMinutes}
                  refreshAppointments={fetchAppointments}
                  setSelectedShiftId={setSelectedShiftId}
                  setBufferInMinutes={setBufferInMinutes}
                  selectedPlanId={selectedPlanId}
                  setSelectedPlanId={setSelectedPlanId}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-4 p-4">
        <ShiftManager planId={selectedPlanId} />
      </div>
    </div>
  );
}