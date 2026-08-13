import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api, { setAccessToken } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On page load/refresh, try to get a new access token via the httpOnly refresh cookie
    const silentRefresh = async () => {
      try {
        // Use raw axios to bypass the response interceptor (avoids redirect loop)
        const response = await axios.post(
          'http://localhost:3000/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );
        const { accessToken } = response.data;
        setAccessToken(accessToken);

        // Load user details from localStorage (public info only, not tokens)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        // No valid session — clear stale user data
        console.error("Session expired or no active session:", err);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    silentRefresh();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, user: userData } = response.data;
    
    setAccessToken(accessToken);                        // Store access token in memory
    localStorage.setItem('user', JSON.stringify(userData)); // Store public user info for route guards
    
    setUser(userData);
    return userData;
  };

  const registerUser = async (name, email, password) => {
    await api.post('/auth/register', { name, email, password });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error("Server logout error:", err);
    } finally {
      setAccessToken(null);             // Clear in-memory token
      localStorage.removeItem('user');  // Clear public user info
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register: registerUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
