import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';

export const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (user) {
      loadAddresses();
    } else {
      setAddresses([]);
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      const stored = await AsyncStorage.getItem(`addresses_${user._id}`);
      if (stored) {
        setAddresses(JSON.parse(stored));
      }
    } catch (err) {
      console.log('Error loading addresses:', err);
    }
  };

  const addAddress = async (newAddr) => {
    try {
      const updated = [...addresses, { ...newAddr, id: Date.now().toString() }];
      setAddresses(updated);
      await AsyncStorage.setItem(`addresses_${user._id}`, JSON.stringify(updated));
    } catch (err) {
      console.log('Error adding address:', err);
    }
  };

  const deleteAddress = async (id) => {
    try {
      const updated = addresses.filter(a => a.id !== id);
      setAddresses(updated);
      await AsyncStorage.setItem(`addresses_${user._id}`, JSON.stringify(updated));
    } catch (err) {
      console.log('Error deleting address:', err);
    }
  };

  const updateAddress = async (id, updatedData) => {
    try {
      const updated = addresses.map(a => a.id === id ? { ...a, ...updatedData } : a);
      setAddresses(updated);
      await AsyncStorage.setItem(`addresses_${user._id}`, JSON.stringify(updated));
    } catch (err) {
      console.log('Error updating address:', err);
    }
  };

  return (
    <AddressContext.Provider value={{ addresses, addAddress, deleteAddress, updateAddress }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddresses = () => useContext(AddressContext);
