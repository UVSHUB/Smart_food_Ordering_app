import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, Platform, TextInput, Alert,
  Modal,
} from 'react-native';
import { useAddresses } from '../../context/AddressContext';
import { MaterialIcons } from '@expo/vector-icons';

const C = {
  primary:  '#FA4A0C',
  bg:       '#F4F4F6',
  surface:  '#FFFFFF',
  textDark: '#111827',
  textMid:  '#6B7280',
  border:   '#E5E7EB',
};

export default function ManageAddressesScreen({ navigation }) {
  const { addresses, addAddress, deleteAddress } = useAddresses();
  const [modalVisible, setModalVisible] = useState(false);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');

  const handleAdd = () => {
    if (!label.trim() || !address.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    addAddress({ label: label.trim(), address: address.trim() });
    setLabel('');
    setAddress('');
    setModalVisible(false);
  };

  const confirmDelete = (id) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAddress(id) },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={s.card}>
      <View style={s.iconBox}>
        <MaterialIcons 
          name={item.label.toLowerCase() === 'home' ? 'home' : (item.label.toLowerCase() === 'work' ? 'work' : 'place')} 
          size={24} 
          color={C.primary} 
        />
      </View>
      <View style={s.body}>
        <Text style={s.label}>{item.label}</Text>
        <Text style={s.addressText}>{item.address}</Text>
      </View>
      <TouchableOpacity onPress={() => confirmDelete(item.id)}>
        <MaterialIcons name="delete-outline" size={22} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />
      
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color={C.textDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Addresses</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="add" size={24} color={C.primary} />
        </TouchableOpacity>
      </View>

      {addresses.length === 0 ? (
        <View style={s.empty}>
          <MaterialIcons name="map" size={60} color={C.border} />
          <Text style={s.emptyTitle}>No Addresses Saved</Text>
          <Text style={s.emptySub}>Save your home or work address for faster checkout.</Text>
          <TouchableOpacity style={s.primaryBtn} onPress={() => setModalVisible(true)}>
            <Text style={s.primaryBtnText}>Add New Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
        />
      )}

      {/* Add Address Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Add New Address</Text>
            
            <Text style={s.inputLabel}>Label (e.g. Home, Office)</Text>
            <TextInput 
              style={s.input} 
              placeholder="Home" 
              value={label} 
              onChangeText={setLabel} 
            />

            <Text style={s.inputLabel}>Complete Address</Text>
            <TextInput 
              style={[s.input, { height: 80 }]} 
              placeholder="No. 12, Main Street, Colombo" 
              value={address} 
              onChangeText={setAddress} 
              multiline
            />

            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleAdd}>
                <Text style={s.saveText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 14,
    backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn:     { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.textDark },
  addBtn:      { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },

  list: { padding: 16 },
  card: {
    flexDirection: 'row', backgroundColor: C.surface, borderRadius: 16,
    padding: 16, marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFF2EE', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  body:    { flex: 1 },
  label:   { fontSize: 15, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  addressText: { fontSize: 13, color: C.textMid, lineHeight: 18 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginTop: 20 },
  emptySub: { fontSize: 14, color: C.textMid, textAlign: 'center', marginTop: 8, marginBottom: 24 },

  primaryBtn: { backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 24 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: C.textMid, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: C.bg, borderRadius: 12, padding: 14, marginBottom: 20, fontSize: 15, color: C.textDark },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: C.bg, padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelText: { color: C.textMid, fontWeight: '700' },
  saveBtn: { flex: 2, backgroundColor: C.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '800' },
});
