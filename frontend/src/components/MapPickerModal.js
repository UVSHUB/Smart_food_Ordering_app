import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity,
  ActivityIndicator, Platform, Dimensions
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MapPickerModal = ({ visible, onClose, onLocationSelect }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 6.9271, // Default to Colombo, Sri Lanka
    longitude: 79.8612,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    if (visible) {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        const initialRegion = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setLocation(loc);
        setSelectedLocation(initialRegion);
        setLoading(false);
      })();
    }
  }, [visible]);

  const handleConfirm = async () => {
    try {
      // Reverse geocode to get address string
      const [addressResult] = await Location.reverseGeocodeAsync({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });

      if (addressResult) {
        const addressString = `${addressResult.name ? addressResult.name + ', ' : ''}${addressResult.street ? addressResult.street + ', ' : ''}${addressResult.city ? addressResult.city : ''}`;
        onLocationSelect(addressString);
      } else {
        onLocationSelect(`${selectedLocation.latitude.toFixed(5)}, ${selectedLocation.longitude.toFixed(5)}`);
      }
      onClose();
    } catch (error) {
      console.error(error);
      onLocationSelect(`${selectedLocation.latitude.toFixed(5)}, ${selectedLocation.longitude.toFixed(5)}`);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <MaterialIcons name="close" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={s.title}>Select Delivery Location</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color="#FA4A0C" />
            <Text style={s.loadingText}>Fetching your location...</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <MapView
              style={s.map}
              initialRegion={selectedLocation}
              onRegionChangeComplete={setSelectedLocation}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              <Marker
                coordinate={selectedLocation}
                title="Delivery Point"
                pinColor="#FA4A0C"
              />
            </MapView>

            {/* Instruction Overlay */}
            <View style={s.instructionWrap}>
              <Text style={s.instruction}>Drag the map to position the pin exactly on your delivery spot</Text>
            </View>

            {/* Footer */}
            <View style={s.footer}>
              <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm}>
                <Text style={s.confirmText}>Confirm Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },
  closeBtn: { padding: 5 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#6B7280', fontSize: 14 },
  map: { flex: 1 },
  instructionWrap: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  instruction: { fontSize: 13, color: '#374151', textAlign: 'center', fontWeight: '500' },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmBtn: {
    backgroundColor: '#FA4A0C',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

export default MapPickerModal;
