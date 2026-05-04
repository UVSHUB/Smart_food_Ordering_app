import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../services/api';

axios.defaults.timeout = 10000;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate token structure or custom validation
  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const userInfo = await AsyncStorage.getItem('userInfo');

      if (token && userInfo) {
        setUserToken(token);
        setUser(JSON.parse(userInfo));
        // Set Axios default headers here if we had a persistent instance
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.log(`isLogged in error ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });

      if (data && data.token) {
        setUserToken(data.token);
        setUser(data);
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(data));
        // Set Axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
      return { success: true };
    } catch (error) {
      console.log('Login error', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (idToken) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/google`, {
        idToken,
      });

      if (data && data.token) {
        setUserToken(data.token);
        setUser(data);
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
      return { success: true };
    } catch (error) {
      console.log('Google Login error', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Google Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password, isAdmin = false) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/register`, {
        name,
        email,
        password,
        isAdmin,
      });

      if (data && data.token) {
        setUserToken(data.token);
        setUser(data);
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
      return { success: true };
    } catch (error) {
      console.log('Register error', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      setUserToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    } catch (e) {
      console.log(`Logout error ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Keep user profile fresh
  const refreshUser = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/users/profile`);
      if (data) {
        setUser(data);
        await AsyncStorage.setItem('userInfo', JSON.stringify(data));
      }
    } catch (e) {
      console.log(`Refresh user error: ${e.response?.data?.message || e.message}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        googleLogin,
        logout,
        register,
        refreshUser,
        user,
        userToken,
        isLoading,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
