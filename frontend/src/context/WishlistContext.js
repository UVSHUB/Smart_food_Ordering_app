import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist when user changes
  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const stored = await AsyncStorage.getItem(`wishlist_${user._id}`);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (err) {
      console.log('Error loading wishlist:', err);
    }
  };

  const toggleWishlist = async (food) => {
    try {
      let updated;
      const exists = wishlist.find(item => item._id === food._id);
      
      if (exists) {
        updated = wishlist.filter(item => item._id !== food._id);
      } else {
        updated = [...wishlist, food];
      }
      
      setWishlist(updated);
      await AsyncStorage.setItem(`wishlist_${user._id}`, JSON.stringify(updated));
    } catch (err) {
      console.log('Error updating wishlist:', err);
    }
  };

  const isInWishlist = (foodId) => {
    return wishlist.some(item => item._id === foodId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
