"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./MiniCalendar.css";
import axios from "axios";

const MiniCalendar = ({ selected, onDateChange, onSlotSelect, duration, bookedTimeSlots = [], selectedSlot, planId }) => {
  const [timeSlots, setTimeSlots] = useState([]);
const [bookedSlots, setBookedSlots] = useState([]);

  const isSameDay = (date1, date2) =>
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
const parseTime = (timeStr) => {
  if (!timeStr) return new Date();

  const [time, modifier] = timeStr.split(" ");
  if (!time || !modifier) return new Date();

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
  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const format24Hr = (date) => {
    return date.toTimeString().slice(0, 5);
  };

 const generateTimeSlots = (startTime, endTime, duration, buffer) => {
  if (!startTime || !endTime || isNaN(duration)) return [];

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

    // Move to next slot (consider buffer)
    cur.setTime(slotEnd.getTime() + buffer * 60000);
  }

  return slots;
};


useEffect(() => {
  const fetchShiftAndGenerateSlots = async () => {
    const token = localStorage.getItem('token');
    if (!selected || !duration || !planId) return;

    try {
      console.log("📦 Plan ID:", planId);
      console.log("📅 Selected Date:", selected);
      console.log("⏱ Duration:", duration);

      const bufferRes = await axios.get(`https://appointify.coinagesoft.com/api/PlanBufferRule`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { planId }
      });

      const bufferData = bufferRes.data;
      console.log("🟢 PlanBufferRule Response:", bufferData);

      const shiftId = bufferData.shiftId;
      const buffer = bufferData.bufferInMinutes || 0;

      if (!shiftId) {
        console.warn("⛔ No shiftId found.");
        setTimeSlots([]);
        return;
      }

      const shiftRes = await axios.get(`https://appointify.coinagesoft.com/api/ConsultantShift`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allShifts = shiftRes.data;
      console.log("🟢 All Shifts:", allShifts);

      const shift = allShifts.find(s => s.id === shiftId);

      if (!shift?.startTime || !shift?.endTime) {
        console.warn("⛔ Missing shift times.");
        setTimeSlots([]);
        return;
      }

      const shiftStart = new Date(`${selected}T${shift.startTime}`);
      const shiftEnd = new Date(`${selected}T${shift.endTime}`);

      const slots = generateTimeSlots(shiftStart, shiftEnd, Number(duration), buffer);
      console.log("⏲ Generated Slots:", slots);

      setTimeSlots(slots);

      // 🔽 Fetching booked slots
      const bookedRes = await axios.get(`https://appointify.coinagesoft.com/api/CustomerAppointment/GetBookedSlots`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: selected }
      });

      const bookedData = bookedRes.data || [];
      console.log("📕 Booked Data:", bookedData);
      // debugger;

      const bookedStartTimes = bookedData.map(item => item.startTime?.slice(0, 5));
      console.log("🕐 Booked Start Times (HH:mm):", bookedStartTimes);

      const bookedValues = slots
        .filter(slot => bookedStartTimes.includes(slot.start))
        .map(slot => slot.value);

      console.log("🔴 Booked Values (slot labels):", bookedValues);
      // debugger;

      setBookedSlots(bookedValues);
    } catch (err) {
      console.error("❌ Error fetching shift/slots:", err);
      setTimeSlots([]);
    }
  };

  fetchShiftAndGenerateSlots();
}, [selected, duration, planId]);

  return (
    <div className="mx-auto mt-5  mt-sm-0" style={{ maxWidth: "35rem" }}>
      <div className=" bg-white p-4 mt-5 mt-lg-0" style={{maxHeight: '40rem', minHeight: '30rem'  }}>
        <div className="calendar-container custom-calendar">
          <DatePicker
            inline
            selected={selected ? new Date(selected) : new Date()}
            onChange={(dateObj) => {
              if (!duration || !planId) {
                alert("Please select a plan first.");
                return;
              }
              onDateChange && onDateChange(dateObj.toISOString().split("T")[0]);
            }}
             minDate={new Date()} 
          />
{timeSlots.length > 0 && (
  <>
    <h6 className="fw-semibold mb-3  text-secondary">Available Slots</h6>
    <div className="slot-grid px-2 px-sm-0">
      {timeSlots.map(({ value }, index) => {
        const [startStr, endStr] = value.split("-").map((s) => s.trim());
        const start = parseTime(startStr);
        const end = parseTime(endStr);

        const isBooked =
          bookedTimeSlots.some((slot) => {
            if (!slot?.startTime || !slot?.endTime || slot.status !== "Scheduled")
              return false;

            const [bStartH, bStartM, bStartS = 0] = slot.startTime.split(":").map(Number);
            const bookedStart = new Date();
            bookedStart.setHours(bStartH, bStartM, bStartS, 0);

            const [bEndH, bEndM, bEndS = 0] = slot.endTime.split(":").map(Number);
            const bookedEnd = new Date();
            bookedEnd.setHours(bEndH, bEndM, bEndS, 0);

            return isOverlapping(start, end, bookedStart, bookedEnd);
          }) || bookedSlots.includes(value);

        const isSelected = selectedSlot === value;

        return (
          <button
            key={index}
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold ${
              isBooked
                ? "btn-secondary"
                : isSelected
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            disabled={isBooked}
            onClick={() => onSlotSelect(value)}
            title={isBooked ? "Slot already booked" : "Available"}
          >
            {value}
          </button>
        );
      })}
    </div>
  </>
)}


        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;