'use client';
import React, { useEffect, useState } from "react";
import './Consultant_Info.css'
const Consultant_Info = () => {

  const API_URL = process.env.REACT_APP_API_URL;
  const [consultantData, setConsultantData] = useState([])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://appointify.coinagesoft.com/api/ConsultantProfile/getConsultantProfile`);
        if (!response.ok) throw new Error("Failed to fetch consultant data");
        const result = await response.json();
        console.log("result", result[0]);
        setConsultantData(result[0]);
      } catch (error) {
        console.error("Error fetching consultant data:", error);
      }
    };

    fetchData();
  }, []);

  return (
<div className="container py-5 px-3 px-md-4 px-lg-5">
  <div className="row align-items-center   rounded-4 py-5">
    {/* Consultant Image */}
    <div className="col-md-5 mb-4 mb-md-0">
      <img
        className="img-fluid rounded-4 shadow-sm"
        style={{ transition: 'transform 0.3s ease-in-out' }}
        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        src={
          consultantData.section2_Image
            ? `https://appointify.coinagesoft.com${consultantData.section2_Image}`
            : "/assets/img/160x160/img8.jpg"
        }
        alt={consultantData.section2_Image}
      />
    </div>

    {/* Consultant Info */}
    <div className="col-md-7">
      <div className="px-md-4">
        <p className="text-primary fst-italic fs-5 mb-3">
          <i className="bi-quote me-2 text-secondary"></i>
          {consultantData.section2_Tagline}
        </p>

        <h3 className="text-dark fw-bold mb-1">{consultantData.fullName}</h3>
        <div className="border-top border-2 mb-3" style={{ width: "60px" }}></div>

        <p className="text-primary fw-medium fs-6 mb-1">{consultantData.role}</p>
        <p className="text-muted small mb-1">{consultantData.experience}</p>
        {consultantData.certificates !== "null" && (
          <p className="text-muted small mb-3">{consultantData.certificates}</p>
        )}

        <p className="text-secondary lh-lg fs-6" style={{ textAlign: "justify" }}>
          {consultantData.description}
        </p>

        {/* Social Icons */}
       <div className="mt-4">
  <span className="me-2 fw-semibold text-muted">Connect:</span>
  <ul className="list-inline d-inline">
    {consultantData.facebookId && (
      <li className="list-inline-item me-2">
        <a
          className="btn btn-soft-primary btn-sm rounded-circle shadow-sm"
          target="_blank"
          rel="noopener noreferrer"
          href={consultantData.facebookId}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            fontSize: '18px',
          }}
        >
          <i className="bi-facebook"></i>
        </a>
      </li>
    )}
    {consultantData.instagramId && (
      <li className="list-inline-item me-2">
        <a
          className="btn btn-soft-danger btn-sm rounded-circle shadow-sm"
          target="_blank"
          rel="noopener noreferrer"
          href={consultantData.instagramId}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            fontSize: '18px',
          }}
        >
          <i className="bi-instagram"></i>
        </a>
      </li>
    )}
    {consultantData.twitterId && (
      <li className="list-inline-item me-2">
        <a
          className="btn btn-soft-info btn-sm rounded-circle shadow-sm"
          target="_blank"
          rel="noopener noreferrer"
          href={consultantData.twitterId}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            fontSize: '18px',
          }}
        >
          <i className="bi-twitter"></i>
        </a>
      </li>
    )}
    {/* {consultantData.youtubeId && (
      <li className="list-inline-item me-2">
        <a
          className="btn btn-soft-danger btn-sm rounded-circle shadow-sm"
          target="_blank"
          rel="noopener noreferrer"
          href={consultantData.youtubeId}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            fontSize: '18px',
          }}
        >
          <i className="bi-youtube"></i>
        </a>
      </li>
    )} */}
  </ul>
</div>

      </div>
    </div>
  </div>
</div>



  );
};

export default Consultant_Info;
