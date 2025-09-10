'use client';
import React, { useState, useEffect, useRef } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Plan_Widget from './Plan_Widget';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const Plan_List = () => {
  const [plans, setPlans] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [bufferInMinutes, setBufferInMinutes] = useState(0);
  const [bufferRules, setBufferRules] = useState({});
  const [shiftList, setShiftList] = useState([]);

  const [editedPlan, setEditedPlan] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    features: '',
    bufferMin: '',
    shiftId: '',
  });
  const [errors, setErrors] = useState({});
  const editorRef = useRef(null);

  
useEffect(() => {
  const fetchPlans = async () => {
    const token = localStorage.getItem('token');
    try {
      const [plansRes, shiftsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/admin/plans/all`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`http://localhost:5000/api/admin/shift`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (!plansRes.ok) throw new Error('Failed to fetch plans');
      if (!shiftsRes.ok) throw new Error('Failed to fetch shifts');

      const plansData = await plansRes.json();
      const shiftData = await shiftsRes.json();

      setPlans(plansData);
      setShiftList(shiftData);
      console.log("shftlist",shiftList)
      const bufferMap = {};
      for (const plan of plansData) {
        try {
          const bufferRes = await axios.get(
            `http://localhost:5000/api/plan-shift-buffer-rule/${plan.planId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { planId: plan.planId }
            }
          );
          // Take first rule if multiple returned
          bufferMap[plan.planId] = bufferRes.data?.bufferInMinutes ?? 0;
          console.log("buffer",bufferRes.data)
          console.log( bufferMap[plan.planId])
          console.log("shiftList",shiftList)
        } catch {
          bufferMap[plan.planId] = 0;
        }
      }
      setBufferRules(bufferMap);
    } catch (error) {
      console.error('Error fetching:', error);
      setPlans([]);
      setShiftList([]);
      setBufferRules({});
    }
  };

  fetchPlans();
}, []);


  const fetchBufferForPlan = async (planId, shiftId) => {
    if (!shiftId) {
      setBufferInMinutes(0);
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5000/api/plan-shift-buffer-rule/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { planId, shiftId }
        }
      );
      console.log("all",response.data)
      setBufferInMinutes(response?.data?.rules?.bufferInMinutes ?? 0);
    } catch (error) {
      if (error.response?.status === 404) setBufferInMinutes(0);
      else console.error("Error fetching buffer rule:", error);
    }
  };

  const handleEdit = async (index) => {
    const selectedPlan = plans[index];
    setEditingIndex(index);

    setEditedPlan({
      name: selectedPlan.planName ?? '',
      price: selectedPlan.planPrice ?? '',
      duration: selectedPlan.planDuration ?? '',
      description: selectedPlan.planDescription ?? '',
      shiftId: selectedPlan.shiftId ?? '',
    });

    try {
      const features = JSON.parse(selectedPlan.planFeatures || "[]");
      if (editorRef.current) {
        editorRef.current.innerHTML = features.map(f => `<li>${f.feature}</li>`).join("");
      }
    } catch {
      if (editorRef.current) editorRef.current.innerHTML = "";
    }

    await fetchBufferForPlan(selectedPlan.planId, selectedPlan.shiftId);

    const editModal = new window.bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
  };

  const handleDelete = async (index) => {
    const token = localStorage.getItem('token');
    const planToDelete = plans[index];
    try {
      const response = await fetch(`http://localhost:5000/api/admin/plans/${planToDelete.planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) setPlans(plans.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    if (!editedPlan.name) { newErrors.name = 'Name is required'; isValid = false; }
    if (!editedPlan.price || isNaN(editedPlan.price) || parseFloat(editedPlan.price) <= 0) {
      newErrors.price = 'Enter valid price'; isValid = false;
    }
    if (!editedPlan.duration) { newErrors.duration = 'Duration is required'; isValid = false; }
    if (!editedPlan.description) { newErrors.description = 'Description is required'; isValid = false; }
    if (!editorRef.current || !editorRef.current.innerHTML.trim()) {
      newErrors.features = 'Features required'; isValid = false;
    }
    if (bufferInMinutes === null || isNaN(bufferInMinutes)) {
      newErrors.bufferMin = 'Buffer minutes required'; isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };
const handleSave = async () => {
  if (!validateForm()) return;
  const token = localStorage.getItem("token");
  const plan = plans[editingIndex];

  // ✅ Extract features
  const featuresArray = Array.from(editorRef.current.querySelectorAll("li"))
    .map(el => ({ feature: el.innerText.trim() }));

  // ✅ Prepare updated plan
  const updatedPlan = {
    planId: plan.planId,
    planName: editedPlan.name,
    planPrice: parseFloat(editedPlan.price) || 0,
    planDuration: editedPlan.duration,
    planDescription: editedPlan.description,
    planFeatures: featuresArray,
    shiftId: editedPlan.shiftId
  };

  try {
    // 🔹 1. Update Plan
    await fetch(`http://localhost:5000/api/admin/plans/${plan.planId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedPlan),
    });

    // 🔹 2. Check if buffer rule exists
    const ruleRes = await axios.get(
      `http://localhost:5000/api/plan-shift-buffer-rule/${plan.planId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
   
    console.log("ruleRes",ruleRes)

    if (ruleRes.status == 200) {
      const existingRule = ruleRes.data;
console.log("existingRule",existingRule)
      if (existingRule) {
        // 🔹 2a. Update existing rule
       await fetch(
  `http://localhost:5000/api/plan-shift-buffer-rule/${existingRule.id}`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      shiftId: editedPlan.shiftId,
      bufferInMinutes,
    }),
  }
  
);

      } else {
        // 🔹 2b. Create new rule
        await fetch(`http://localhost:5000/api/plan-shift-buffer-rule/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            planId: plan.planId,
            shiftId: editedPlan.shiftId,
            bufferInMinutes,
          }),
        });
      }
    }

    // 🔹 3. Update local state (keep UI in sync)
    const updatedPlans = [...plans];
    updatedPlans[editingIndex] = {
      ...updatedPlan,
      planFeatures: JSON.stringify(featuresArray), // keep consistent with backend
    };
    setPlans(updatedPlans);

    // 🔹 4. Close modal
    setEditingIndex(null);
    const modal = window.bootstrap.Modal.getInstance(
      document.getElementById("editModal")
    );
    modal.hide();
  } catch (err) {
    console.error("Save failed:", err);
  }
};



  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedPlan((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container py-4">
      <Plan_Widget />
      <div className="row">
        {plans.length === 0 ? (
          <div>No plans available.</div>
        ) : (
          plans.map((plan, index) => (
            <div className="col-md mb-3 mb-md-0 col-lg-4 col-md-6 col-12 mt-4" key={plan.planId}>
              <div className="card h-100 shadow-sm border-0 rounded-4 px-0">
                <div className="card-header text-center text-black">
                  <div className="mb-2">
                    <span className="fs-2 text-dark fw-semibold">
                      {plan.planDuration}<span className="fs-5"> min</span>
                    </span>
                  </div>
                  <h3 className="card-title fs-5 mt-1 lh-1">{plan.planName}</h3>
                  <p className="card-text justify-start mt-2">{plan.planDescription}</p>
                </div>
                <div className="card-body d-flex flex-column align-items-center py-0">
                  <h5 className="text-dark fw-bold mt-3">Price: ₹{plan.planPrice}</h5>
                  <div className="text-black">
                    <ul className="list-unstyled">
                      {(() => {
                        try {
                          const features = JSON.parse(plan.planFeatures);
                          return features.map((f, i) => <li key={i}>✔ {f.feature}</li>);
                        } catch {
                          return <li>No features available</li>;
                        }
                      })()}
                    </ul>
                  </div>
                </div>
                <div className="card-body d-flex flex-column align-items-center py-0">
      <p>
  {plan.shiftId
    ? shiftList.find(s => String(s.id) === String(plan.shiftId))?.name ?? 'None'
    : 'None'}
</p>

<p>Buffer: {bufferRules[plan.planId] ?? '—'} min</p>

                </div>
                <div className="card-footer text-center">
                  <button className="btn btn-warning text-white me-2" onClick={() => handleEdit(index)}>Edit</button>
                  <button className="btn btn-danger text-white" onClick={() => handleDelete(index)}>Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <div className="modal fade" id="editModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content rounded-4">
            <div className="modal-header">
              <h5 className="modal-title">Edit Plan Information</h5>
              <button className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {/* Form */}
              <div className="form-floating mb-4">
                <input type="text" className={`form-control ${errors.name ? 'border-danger' : ''}`}
                  name="name" value={editedPlan.name} onChange={handleChange} placeholder="Plan Name" />
                <label>Plan Name</label>
                {errors.name && <div className="text-danger">{errors.name}</div>}
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="form-floating">
                    <input type="number" className={`form-control ${errors.price ? 'border-danger' : ''}`}
                      name="price" value={editedPlan.price} onChange={handleChange} placeholder="Price" />
                    <label>Plan Price (₹)</label>
                    {errors.price && <div className="text-danger">{errors.price}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating">
                    <input type="text" className={`form-control ${errors.duration ? 'border-danger' : ''}`}
                      name="duration" value={editedPlan.duration} onChange={handleChange} placeholder="Duration" />
                    <label>Plan Duration</label>
                    {errors.duration && <div className="text-danger">{errors.duration}</div>}
                  </div>
                </div>
              </div>

              <div className="form-floating mt-4">
                <input type="text" className={`form-control ${errors.description ? 'border-danger' : ''}`}
                  name="description" value={editedPlan.description} onChange={handleChange} placeholder="Description" />
                <label>Plan Description</label>
                {errors.description && <div className="text-danger">{errors.description}</div>}
              </div>

              {/* Features Rich Text */}
              <div className="mt-4">
                <label className="mb-2 fw-semibold text-dark">Plan Features</label>
                <div className="d-flex gap-2 flex-wrap mb-3 p-2 bg-light shadow-sm rounded-3">
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => formatText('bold')}><i className="fas fa-bold"></i></button>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => formatText('italic')}><i className="fas fa-italic"></i></button>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => formatText('underline')}><i className="fas fa-underline"></i></button>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => formatText('insertOrderedList')}><i className="fas fa-list-ol"></i></button>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => formatText('insertUnorderedList')}><i className="fas fa-list-ul"></i></button>
                </div>
                <div ref={editorRef} contentEditable
                  className={`form-control p-3 ${errors.features ? 'border-danger' : ''}`}
                  style={{ minHeight: '150px', outline: 'none', backgroundColor: '#fff' }} />
                {errors.features && <div className="text-danger">{errors.features}</div>}
              </div>

              <div className="form-floating mt-4">
                <select className="form-select" name="shiftId" value={editedPlan.shiftId} onChange={handleChange}>
                  <option value="">-- Select Shift --</option>
                  {shiftList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime?.slice(0, 5)} - {s.endTime?.slice(0, 5)})
                    </option>
                  ))}
                </select>
                <label>Select Shift</label>
              </div>

              <div className="form-floating mt-4">
                <input type="number" className="form-control"
                  name="bufferInMinutes" value={bufferInMinutes ?? 0}
                  onChange={(e) => setBufferInMinutes(Number(e.target.value))} />
                <label>Buffer Minutes</label>
                {errors.bufferMin && <div className="text-danger">{errors.bufferMin}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button className="btn btn-primary" onClick={handleSave}>Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plan_List;
