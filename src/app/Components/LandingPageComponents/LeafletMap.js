import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeafletMap = () => {
  const [iframeUrl, setIframeUrl] = useState('');

  useEffect(() => {
    const fetchIframeUrl = async () => {
      try {
        const res = await axios.get('https://appointify.coinagesoft.com/api/Location');
        console.log("res iframeurl", res.data.data.iFrameURL);

        if (res.data.data?.iFrameURL) {
          setIframeUrl(res.data.data.iFrameURL); // ✅ use directly
        } else {
          console.warn("No iframe URL found in response");
        }
      } catch (err) {
        console.error('Error loading map:', err);
      }
    };

    fetchIframeUrl();
  }, []);

  if (!iframeUrl) return null;

  return (
    <section className="container my-5 py-5">
      <div className="text-center mb-4">
        <h2 className="fw-bold">Find Us on the Map</h2>
        <p className="text-muted">We’re located at the heart of the city</p>
      </div>

      <div className="ratio ratio-16x9 rounded shadow overflow-hidden">
        <iframe
          src={iframeUrl}
          title="Google Map"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0 }}
        />
      </div>
    </section>
  );
};

export default LeafletMap;
