import React, { useState } from 'react';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');

  const handleSendOtp = () => {
    setOtp('123456'); // Dummy OTP
    setOtpSent(true);
    alert('Dummy OTP: 123456');
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === otp) {
      alert('OTP Verified! You can reset your password.');
    } else {
      alert('Invalid OTP');
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-container">
        <h2>Forgot Password</h2>
        {!otpSent ? (
          <>
            <input type="text" placeholder="Enter Aadhar ID" />
            <button onClick={handleSendOtp}>Send OTP</button>
          </>
        ) : (
          <>
            <input type="text" placeholder="Enter OTP" onChange={(e) => setEnteredOtp(e.target.value)} />
            <button onClick={handleVerifyOtp}>Verify OTP</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;