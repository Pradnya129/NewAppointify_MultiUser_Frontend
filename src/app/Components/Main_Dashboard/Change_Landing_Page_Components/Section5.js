'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;
import { jwtDecode } from "jwt-decode";

const Section5 = () => {
  const [formData, setFormData] = useState({
    tagline: '',
    mainDescription: '',
    // mainHeading: '',
  });

  const [editedData, setEditedData] = useState({ ...formData });
  const [isEdited, setIsEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const [isTaglineValid, setIsTaglineValid] = useState(true);
  const [isDescriptionValid, setIsDescriptionValid] = useState(true);
  // const [isHeadingValid, setIsHeadingValid] = useState(true);

  // Fetch Section 5 data on mount
  useEffect(() => {
       const token = localStorage.getItem("token");
        
          if (!token) return;
        
          const decoded = jwtDecode(token);
          const adminId = decoded.id;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/landing/${adminId}`);
        setFormData(res.data);
        setEditedData(res.data);
        setStatusMessage({ type: '', text: '' });
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Failed to fetch section content.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Detect form changes
  useEffect(() => {
    const hasChanges =
      editedData.tagline !== formData.tagline ||
      editedData.mainDescription !== formData.mainDescription ||
      editedData.mainHeading !== formData.mainHeading;
    setIsEdited(hasChanges);
  }, [editedData, formData]);

  // Handle input change
  const handleChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  // Validate the fields before saving
  const validateFields = () => {
    let isValid = true;

    if (!editedData.tagline.trim()) {
      setIsTaglineValid(false);
      isValid = false;
    } else {
      setIsTaglineValid(true);
    }

    if (!editedData.mainDescription.trim()) {
      setIsDescriptionValid(false);
      isValid = false;
    } else {
      setIsDescriptionValid(true);
    }

    // if (!editedData.mainHeading.trim()) {
    //   setIsHeadingValid(false);
    //   isValid = false;
    // } else {
    //   setIsHeadingValid(true);
    // }

    return isValid;
  };

  // Handle Save
  const handleSave = async () => {
    if (!validateFields()) return;  // Prevent save if validation fails

    try {
         const token = localStorage.getItem("token");
        
          if (!token) return;
        
          const decoded = jwtDecode(token);
          const adminId = decoded.id;
      setLoading(true);
      await axios.put(`http://localhost:5000/api/landing/${adminId}`, editedData);
      setFormData(editedData);
      setIsEdited(false);
      setStatusMessage({ type: 'success', text: 'Section 5 updated successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to update section.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset
  const handleReset = () => {
    setEditedData(formData);
    setIsEdited(false);
    setStatusMessage({ type: '', text: '' });
  };

  return (
    <div className="my-5">
      <h5 className="text-muted mb-4">Section 5 - Manage Plan Taglines</h5>

      {statusMessage.text && (
        <div className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="card shadow-sm p-4">
        <div className="mb-3">
          <label className="form-label fw-semibold">Tagline</label>
          <input
            type="text"
            className={`form-control ${!isTaglineValid ? 'is-invalid' : ''}`}
           value={editedData?.tagline || ''}
            disabled={loading}
            onChange={e => handleChange('tagline', e.target.value)}
          />
          {!isTaglineValid && <div className="invalid-feedback">Tagline cannot be empty.</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Description</label>
          <textarea
            rows="4"
            className={`form-control ${!isDescriptionValid ? 'is-invalid' : ''}`}
            value={editedData.mainDescription || ''}
            disabled={loading}
            onChange={e => handleChange('mainDescription', e.target.value)}
          />
          {!isDescriptionValid && <div className="invalid-feedback">Description cannot be empty.</div>}
        </div>

        {/* <div className="mb-3">
          <label className="form-label fw-semibold">Heading</label>
          <input
            type="text"
            className={`form-control ${!isHeadingValid ? 'is-invalid' : ''}`}
            value={editedData.mainHeading}
            disabled={loading}
            onChange={e => handleChange('mainHeading', e.target.value)}
          />
          {!isHeadingValid && <div className="invalid-feedback">Heading cannot be empty.</div>}
        </div> */}

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={!isEdited || loading}
          >
            Reset
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!isEdited || loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Section5;
