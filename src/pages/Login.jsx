import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import toast, { Toaster } from 'react-hot-toast';
import './Login.css';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: mobile, 2: OTP
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // remove complex animations; keep login simple and modern
  useEffect(() => {
    // placeholder for any future small animations, currently none
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      // Send OTP
      if (!mobile) {
        toast.error('Please enter mobile number');
        return;
      }

      setIsLoading(true);
      const result = await sendOtp(mobile);
      setIsLoading(false);
      
      if (result.success) {
        toast.success('OTP sent to your mobile!');
        setStep(2);
      } else {
        toast.error(result.message || 'Failed to send OTP');
      }
    } else {
      // Verify OTP
      if (!otp) {
        toast.error('Please enter OTP');
        return;
      }

      setIsLoading(true);
      const result = await verifyOtp(mobile, otp);
      setIsLoading(false);
      
      if (result.success) {
        toast.success('Login successful! Welcome back 👋');
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        toast.error(result.message || 'Invalid OTP');
      }
    }
  };

  return (
    <div className="login-container">
      <Toaster position="top-right" />
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">S</div>
          <h1 className="login-title">SBMS Administrator Console</h1>
          <p className="login-welcome">
            Hello There <span className="wave-emoji">😊</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {step === 1 ? (
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="Mobile Number (+251...)"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                disabled={isLoading}
              />
              <button 
                type="button" 
                className="btn-link"
                onClick={() => setStep(1)}
                style={{ marginTop: '10px', fontSize: '14px', color: '#1D61E7' }}
              >
                ← Change mobile number
              </button>
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : (step === 1 ? 'Send OTP' : 'Verify & Login')}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-hint">
            Platform administration is restricted to authorized administrators. <strong>Sign in with your admin mobile number</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
