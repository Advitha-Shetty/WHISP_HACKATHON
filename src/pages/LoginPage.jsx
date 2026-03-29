import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, t, lang } = useApp();
  const [formData, setFormData] = useState({ adharId: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dummy authentication
    if (formData.adharId && formData.password) {
      setIsAuthenticated(true);
      navigate('/');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>{lang === 'en' ? 'Login to WHISP' : 'WHISP ಗೆ ಲಾಗಿನ್ ಮಾಡಿ'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={lang === 'en' ? 'Aadhar ID' : 'ಆಧಾರ್ ಐಡಿ'}
            value={formData.adharId}
            onChange={(e) => setFormData({ ...formData, adharId: e.target.value })}
          />
          <input
            type="password"
            placeholder={lang === 'en' ? 'Password' : 'ಪಾಸ್ವರ್ಡ್'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button type="submit">{lang === 'en' ? 'Login' : 'ಲಾಗಿನ್'}</button>
        </form>
        <button onClick={() => navigate('/signup')}>{lang === 'en' ? 'Sign Up' : 'ಸೈನ್ ಅಪ್'}</button>
        <button onClick={() => navigate('/forgot-password')}>{lang === 'en' ? 'Forgot Password?' : 'ಪಾಸ್ವರ್ಡ್ ಮರೆತಿರಾ?'}</button>
      </div>
    </div>
  );
};

export default LoginPage;