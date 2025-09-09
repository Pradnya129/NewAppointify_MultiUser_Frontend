'use client';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ShiftManager.css'


const API = process.env.REACT_APP_API_URL;

const ShiftManager = ({ planId }) => {
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [startHour, setStartHour] = useState('01');
  const [startMinute, setStartMinute] = useState('00');
  const [startPeriod, setStartPeriod] = useState('AM');
  const [endHour, setEndHour] = useState('01');
  const [endMinute, setEndMinute] = useState('00');
  const [endPeriod, setEndPeriod] = useState('PM');
  const [bufferMin, setBufferMin] = useState('10');
  const [planList, setPlanList] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);

  const hours = [...Array(12)].map((_, i) => (i + 1).toString().padStart(2, '0'));
  const mins = ['00', '15', '30', '45'];

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const loadData = async () => {
      try {
        const shiftRes = await axios.get(`http://localhost:5000/api/admin/shift`, authHeaders);
        const shiftData = shiftRes.data;
        setShifts(shiftData);

        if (shiftData.length === 0) {
          setMessage("No shifts found for this consultant.");
        }
      } catch (err) {
        setError('Cannot load shifts');
      }

      try {
        const planRes = await axios.get(`http://localhost:5000/api/admin/plans/all`);
        setPlanList(planRes.data);
      } catch {
        console.log('No plans found.');
      }
    };

    loadData();
  }, [token]);

  useEffect(() => {
    if (!selectedShift) return;
    const ps = parseTime(selectedShift.startTime);
    const pe = parseTime(selectedShift.endTime);
    setStartHour(ps.hour); setStartMinute(ps.minute); setStartPeriod(ps.period);
    setEndHour(pe.hour); setEndMinute(pe.minute); setEndPeriod(pe.period);
  }, [selectedShift]);


  const parseTime = (ts) => {
    const [hStr, mStr] = ts.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    let period = 'AM';

    if (h >= 12) {
      period = 'PM';
      if (h > 12) h -= 12;
    }
    if (h === 0) h = 12;

    return {
      hour: h.toString().padStart(2, '0'),
      minute: m.toString().padStart(2, '0'),
      period
    };
  };

  const buildTimeSpan = (h, m, p) => {
    if (!h || !m || !p) return null;

    let hh = parseInt(h, 10);
    if (p === 'PM' && hh < 12) hh += 12;
    if (p === 'AM' && hh === 12) hh = 0;

    const mm = m.toString().padStart(2, '0');
    const hhStr = hh.toString().padStart(2, '0');

    return `${hhStr}:${mm}:00`; // returns "HH:mm:ss"
  };

  const handleDeleteShift = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) return;

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.delete(`http://localhost:5000/api/admin/shift/${id}`, authHeaders);
      setShifts(shifts.filter(s => s.id !== id));
      setMessage("Shift deleted successfully.");
      setError('');
    } catch (err) {
      setError('Failed to delete shift');
    }
  };


  const saveShift = async () => {
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
    console.log(startHour, startMinute, endHour, endMinute)

    if (!startHour || !startMinute || !endHour || !endMinute) {
      setError("Please select valid start and end time.");
      return;
    }

    const start = buildTimeSpan(startHour, startMinute, startPeriod); // e.g. "13:30:00"
    const end = buildTimeSpan(endHour, endMinute, endPeriod);         // e.g. "15:00:00"

    const shiftName = `Shift (${startHour}:${startMinute} ${startPeriod} - ${endHour}:${endMinute} ${endPeriod})`;

    // 🧠 Convert HH:mm:ss → minutes since midnight
    const timeToMinutes = (time) => {
      const [h, m] = time.split(':');
      return parseInt(h, 10) * 60 + parseInt(m, 10);
    };

    const newStartMin = timeToMinutes(start);
    const newEndMin = timeToMinutes(end);

    // 🚫 Check for overlap
    const isOverlap = shifts.some(s => {
      if (selectedShift?.id && s.id === selectedShift.id) return false; // skip editing current shift
      const existingStart = timeToMinutes(s.startTime.slice(0, 5));
      const existingEnd = timeToMinutes(s.endTime.slice(0, 5));
      return !(newEndMin <= existingStart || newStartMin >= existingEnd);
    });

    if (isOverlap) {
      setError("⚠️ This shift overlaps with an existing one. Please choose a different time.");
      return;
    }

    const body = {
      startTime: start,
      endTime: end,
      name: shiftName,
    };
    
if (planId) {
  body.planId = planId;  // ✅ Only include if it's valid
}

    console.log("Creating/Updating shift with body:", body);

    try {
      const res = selectedShift?.id
        ? await axios.put(`http://localhost:5000/api/admin/shift/${selectedShift.id}`, body, authHeaders)
        : await axios.post(`http://localhost:5000/api/admin/shift`, body, authHeaders);

      setMessage('Shift saved successfully');
      setError('');
      const { data } = await axios.get(`http://localhost:5000/api/admin/shift`, authHeaders);
      setShifts(data);
      setSelectedShift(null);
    } catch (err) {
      const validationErrors = err?.response?.data?.errors;
      if (validationErrors) {
        const errorMessages = Object.values(validationErrors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError(err?.response?.data?.title || 'Save failed');
      }
    }
  };
  return (
    <Container className="p-4 bg-white rounded shadow-md-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Manage Shifts </h4>
        <Button
          variant="outline-success"
          onClick={() => {
            setSelectedShift(null);
            setStartHour('01'); setStartMinute('00'); setStartPeriod('AM');
            setEndHour('01'); setEndMinute('00'); setEndPeriod('PM');
          }}
        >
          <i className="bi bi-plus-circle pe-3"></i>  Add Shift
        </Button>
      </div>

      {/* Shifts List */}
      {shifts.length === 0 ? (
        <Alert variant="info">No shifts found. Use <b>Add Shift</b> to create one.</Alert>
      ) : (
        <div className="mb-4">
          <div className="list-group">
            {shifts.map((s) => (
              <div key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{s.name}</strong>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                    {s.startTime.slice(11, 16)}  {s.endTime.slice(11, 16)}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => setSelectedShift(s)}
                  >
                    <i className="bi bi-pencil-fill"></i>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDeleteShift(s.id)}
                  >
                    <i className="bi bi-trash-fill"></i>
                  </Button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shift Form */}
      <hr />
      <h5>{selectedShift ? 'Edit Shift' : 'Create New Shift'}</h5>
      <Row className="mb-3">
        <Col>
          <Form.Label>Start Time</Form.Label>
          <div className="d-flex gap-2">
            <Form.Select value={startHour} onChange={(e) => setStartHour(e.target.value)}>
              {hours.map(h => <option key={h} value={h}>{h}</option>)}
            </Form.Select>

            <Form.Select value={startMinute} onChange={(e) => setStartMinute(e.target.value)}>
              {mins.map(m => <option key={m} value={m}>{m}</option>)}
            </Form.Select>

            <Form.Select value={startPeriod} onChange={(e) => setStartPeriod(e.target.value)}>
              {['AM', 'PM'].map(p => <option key={p} value={p}>{p}</option>)}
            </Form.Select>

          </div>
        </Col>
        <Col>
          <Form.Label>End Time</Form.Label>
          <div className="d-flex gap-2">
            <Form.Select value={endHour} onChange={(e) => setEndHour(e.target.value)}>
              {hours.map(h => <option key={h} value={h}>{h}</option>)}
            </Form.Select>
            <Form.Select value={endMinute} onChange={(e) => setEndMinute(e.target.value)}>
              {mins.map(m => <option key={m} value={m}>{m}</option>)}
            </Form.Select>
            <Form.Select value={endPeriod} onChange={(e) => setEndPeriod(e.target.value)}>
              {['AM', 'PM'].map(p => <option key={p} value={p}>{p}</option>)}
            </Form.Select>
          </div>
        </Col>
      </Row>

      <Button onClick={saveShift} className="mb-4" variant="primary">
        {selectedShift ? 'Update Shift' : 'Save Shift'}
      </Button>

      {/* Buffer Section */}
      <hr />


      {/* Messages */}
      {message && <Alert variant="success" className="mt-3">{message}</Alert>}
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
    </Container>
  );

};

export default ShiftManager;