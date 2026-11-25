import React, { useState } from "react";
import { AuthContext } from "./authContext";
import api from "../api/axiosInstance";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("adminUser");
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return String(parsed?.role || '').toLowerCase() === 'admin' ? parsed : null;
    } catch {
      localStorage.removeItem("adminUser");
      localStorage.removeItem("token");
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const sendOtp = async (mobile) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/send-otp', { mobile });
      setLoading(false);
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      setLoading(false);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to send OTP" 
      };
    }
  };

  const verifyOtp = async (mobile, otp) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { mobile, otp });
      
      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        
        // Only allow admin role
        if (String(userData?.role || '').toLowerCase() !== 'admin') {
          setLoading(false);
          return { success: false, message: "Access denied. Admin only." };
        }
        
        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("adminUser", JSON.stringify(userData));
        setUser(userData);
        setLoading(false);
        return { success: true };
      }
      
      setLoading(false);
      return { success: false, message: response.data.message || "Verification failed" };
    } catch (error) {
      setLoading(false);
      return { 
        success: false, 
        message: error.response?.data?.message || "Invalid OTP" 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, sendOtp, verifyOtp, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
