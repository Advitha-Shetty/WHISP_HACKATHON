import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import KarnatakaMap from '../components/KarnatakaMap';
import Carousel from '../components/Carousel';
import './HomePage.css';

const HomePage = () => {
  const { t, lang, userDistrict } = useApp();
  const [selectedDistrict, setSelectedDistrict] = useState(userDistrict);

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className="hero-title">
          {lang === 'en' ? 'Welcome to WHISP' : 'ವಿಸ್ಪ್ ಗೆ ಸ್ವಾಗತ'}
        </h1>
        <p className="hero-subtitle">
          {lang === 'en' 
            ? 'Women\'s Health Information and Support Platform' 
            : 'ಮಹಿಳಾ ಆರೋಗ್ಯ ಮಾಹಿತಿ ಮತ್ತು ಬೆಂಬಲ ವೇದಿಕೆ'}
        </p>
      </div>
      
      <Carousel />
      
      <div className="map-section">
        <h2>
          {lang === 'en' ? 'Karnataka Health Map' : 'ಕರ್ನಾಟಕ ಆರೋಗ್ಯ ನಕ್ಷೆ'}
        </h2>
        <p>
          {lang === 'en' 
            ? 'Click on any district to view detailed health information' 
            : 'ವಿವರವಾದ ಆರೋಗ್ಯ ಮಾಹಿತಿಯನ್ನು ವೀಕ್ಷಿಸಲು ಯಾವುದೇ ಜಿಲ್ಲೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ'}
        </p>
        <KarnatakaMap 
          selectedDistrict={selectedDistrict}
          onDistrictSelect={setSelectedDistrict}
        />
      </div>
    </div>
  );
};

export default HomePage;