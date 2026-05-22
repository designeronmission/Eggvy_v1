// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authStep, setAuthStep] = useState('login'); // login, otp, pin, dashboard
  const [tempPhoneNumber, setTempPhoneNumber] = useState('');

  // Check for existing session on app start
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const hasPin = await AsyncStorage.getItem('hasPin');
      const authStatus = await AsyncStorage.getItem('isAuthenticated');
      
      if (userData && hasPin === 'true' && authStatus === 'true') {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        setAuthStep('dashboard');
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (phoneNumber) => {
    setTempPhoneNumber(phoneNumber);
    setAuthStep('otp');
    return { success: true };
  };

  const verifyOTP = async (otpCode) => {
    setAuthStep('pin');
    return { success: true };
  };

  const setUserPIN = async (pinCode) => {
    // Create user object
    const userData = {
      phone: tempPhoneNumber,
      name: 'User',
      email: '',
      createdAt: new Date().toISOString(),
      isVerified: true
    };
    
    // Store user data and PIN status
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    await AsyncStorage.setItem('hasPin', 'true');
    await AsyncStorage.setItem('isAuthenticated', 'true');
    
    setUser(userData);
    setIsAuthenticated(true);
    setAuthStep('dashboard');
    
    return { success: true };
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('hasPin');
    await AsyncStorage.removeItem('isAuthenticated');
    setUser(null);
    setIsAuthenticated(false);
    setAuthStep('login');
    setTempPhoneNumber('');
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        authStep,
        user,
        tempPhoneNumber,
        sendOTP,
        verifyOTP,
        setUserPIN,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};