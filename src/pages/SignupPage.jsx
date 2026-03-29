import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './SignupPage.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setUserDistrict, t, lang } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    adharId: '',
    phone: '',
    district: '',
    password: ''
  });

  // All 31 districts of Karnataka
  const districts = [
    'Bagalkot', 'Bengaluru Rural', 'Bengaluru Urban', 'Belagavi', 'Ballari', 
    'Bidar', 'Vijayapura', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 
    'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 
    'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 
    'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 
    'Udupi', 'Uttara Kannada', 'Vijayanagara', 'Yadgir'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.adharId && formData.password) {
      setUserDistrict(formData.district || 'Bengaluru Urban');
      setIsAuthenticated(true);
      navigate('/');
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2>{lang === 'en' ? 'Sign Up for WHISP' : 'WHISP ಗಾಗಿ ಸೈನ್ ಅಪ್ ಮಾಡಿ'}</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder={lang === 'en' ? 'Name' : 'ಹೆಸರು'} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
          />
          <input 
            type="email" 
            placeholder="Email" 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
          <input 
            type="text" 
            placeholder={lang === 'en' ? 'Aadhar ID' : 'ಆಧಾರ್ ಐಡಿ'} 
            onChange={(e) => setFormData({...formData, adharId: e.target.value})} 
          />
          <input 
            type="tel" 
            placeholder={lang === 'en' ? 'Phone Number' : 'ದೂರವಾಣಿ ಸಂಖ್ಯೆ'} 
            onChange={(e) => setFormData({...formData, phone: e.target.value})} 
          />
          <select onChange={(e) => setFormData({...formData, district: e.target.value})}>
            <option value="">{lang === 'en' ? 'Select District' : 'ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ'}</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          <input 
            type="password" 
            placeholder={lang === 'en' ? 'Password' : 'ಪಾಸ್ವರ್ಡ್'} 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
          <button type="submit">{lang === 'en' ? 'Sign Up' : 'ಸೈನ್ ಅಪ್'}</button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;