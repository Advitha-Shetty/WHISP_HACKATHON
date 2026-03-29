import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { t, lang, userDistrict, setIsAuthenticated } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Dummy user data (in real app, this would come from context/state)
  const userData = {
    name: "User Name",
    adharId: "XXXX-XXXX-XXXX",
    phone: "9876543210",
    district: userDistrict
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {userData.name.charAt(0)}
          </div>
          <h2>{userData.name}</h2>
        </div>

        <div className="profile-info">
          <div className="info-row">
            <label>{lang === 'en' ? 'Aadhar ID' : 'ಆಧಾರ್ ಐಡಿ'}:</label>
            <span>{userData.adharId}</span>
          </div>
          <div className="info-row">
            <label>{lang === 'en' ? 'Phone Number' : 'ದೂರವಾಣಿ ಸಂಖ್ಯೆ'}:</label>
            <span>{userData.phone}</span>
          </div>
          <div className="info-row">
            <label>{lang === 'en' ? 'District' : 'ಜಿಲ್ಲೆ'}:</label>
            <span>{userData.district}</span>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          {lang === 'en' ? 'Logout' : 'ಲಾಗ್ ಔಟ್'}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;