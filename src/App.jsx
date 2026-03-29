import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import YourDistrictPage from './pages/YourDistrictPage';
import DiscussionPage from './pages/DiscussionPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import './App.css';

// This component handles the routing and uses the context
const AppContent = () => {
  const { isAuthenticated, userDistrict } = useApp();

  return (
    <div className="app-container">
      {isAuthenticated && <NavBar />}
      <div className="main-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route 
            path="/" 
            element={isAuthenticated ? <HomePage userDistrict={userDistrict} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/your-district" 
            element={isAuthenticated ? <YourDistrictPage userDistrict={userDistrict} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/discussion" 
            element={isAuthenticated ? <DiscussionPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </div>
  );
};

// Main App component with Provider
function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}

export default App;