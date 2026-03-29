import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './YourDistrictPage.css';

const YourDistrictPage = () => {
  const { t, lang, userDistrict } = useApp();
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Dummy data for pad centers
  const padCenters = [
    { place: "Community Health Center", date: "2024-04-01", pads: 200 },
    { place: "Primary Health Center", date: "2024-04-05", pads: 150 },
    { place: "Anganwadi Center", date: "2024-04-10", pads: 100 }
  ];

  // Dummy data for hospitals
  const hospitals = [
    { name: "District Hospital", type: "Gynecology", distance: "2 km" },
    { name: "Women's Health Center", type: "Specialty", distance: "3.5 km" },
    { name: "Community Health Center", type: "General", distance: "1.8 km" }
  ];

  // Dummy data for district officials
  const districtOfficials = [
    { name: "Dr. Smitha Rao", role: "District Health Officer", qualification: "MD", experience: "12 years" },
    { name: "Ms. Kavya Patil", role: "NGO Coordinator", office: "Women Welfare Office", place: "District Complex" }
  ];

  // Dummy data for programmes
  const programmes = [
    { name: "Women's Health Camp", date: "2024-04-15", place: "Community Hall" },
    { name: "Pad Distribution Drive", date: "2024-04-20", place: "Various Locations" }
  ];

  return (
    <div className="your-district-page">
      <div className="district-header">
        <h1>{userDistrict}</h1>
        <p>{lang === 'en' ? 'Your District Health Information' : 'ನಿಮ್ಮ ಜಿಲ್ಲೆಯ ಆರೋಗ್ಯ ಮಾಹಿತಿ'}</p>
      </div>

      <div className="location-access">
        <button 
          className="enable-location-btn"
          onClick={() => setLocationEnabled(true)}
        >
          📍 {lang === 'en' ? 'Enable Location Access' : 'ಸ್ಥಳ ಪ್ರವೇಶವನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ'}
        </button>
      </div>

      <div className="cards-grid">
        {/* Pad Centers Card */}
        <div className="district-card">
          <div className="card-icon">🩸</div>
          <h3>{lang === 'en' ? 'Pad Distribution Centers' : 'ಪ್ಯಾಡ್ ವಿತರಣಾ ಕೇಂದ್ರಗಳು'}</h3>
          {padCenters.map((center, idx) => (
            <div key={idx} className="card-details">
              <p><strong>{center.place}</strong></p>
              <p>{lang === 'en' ? 'Date' : 'ದಿನಾಂಕ'}: {center.date}</p>
              <p>{lang === 'en' ? 'Pads Available' : 'ಪ್ಯಾಡ್ಗಳು ಲಭ್ಯ'}: {center.pads}</p>
            </div>
          ))}
        </div>

        {/* Hospitals Card */}
        <div className="district-card">
          <div className="card-icon">🏥</div>
          <h3>{lang === 'en' ? 'Nearby Hospitals' : 'ಸಮೀಪದ ಆಸ್ಪತ್ರೆಗಳು'}</h3>
          {hospitals.map((hospital, idx) => (
            <div key={idx} className="card-details">
              <p><strong>{hospital.name}</strong></p>
              <p>{hospital.type} • {hospital.distance}</p>
            </div>
          ))}
        </div>

        {/* District Information Card */}
        <div className="district-card">
          <div className="card-icon">📊</div>
          <h3>{lang === 'en' ? 'District Information' : 'ಜಿಲ್ಲಾ ಮಾಹಿತಿ'}</h3>
          {districtOfficials.map((official, idx) => (
            <div key={idx} className="card-details">
              <p><strong>{official.name}</strong> - {official.role}</p>
              {official.qualification && <p>{official.qualification}, {official.experience}</p>}
              {official.office && <p>{official.office}, {official.place}</p>}
            </div>
          ))}
        </div>

        {/* Programme Details Card */}
        <div className="district-card">
          <div className="card-icon">📅</div>
          <h3>{lang === 'en' ? 'Programme Details' : 'ಕಾರ್ಯಕ್ರಮದ ವಿವರಗಳು'}</h3>
          {programmes.map((programme, idx) => (
            <div key={idx} className="card-details">
              <p><strong>{programme.name}</strong></p>
              <p>{lang === 'en' ? 'Date' : 'ದಿನಾಂಕ'}: {programme.date}</p>
              <p>{lang === 'en' ? 'Place' : 'ಸ್ಥಳ'}: {programme.place}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YourDistrictPage;