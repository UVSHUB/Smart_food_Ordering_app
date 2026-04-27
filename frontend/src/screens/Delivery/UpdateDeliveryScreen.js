import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../services/api';

const STATUSES = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];

const STATUS_COLORS = {
  Pending:            { bg: '#FFF3E0', text: '#E65100', dot: '#FF9800' },
  Preparing:          { bg: '#E3F2FD', text: '#0D47A1', dot: '#2196F3' },
  'Out for Delivery': { bg: '#F3E5F5', text: '#6A1B9A', dot: '#9C27B0' },
  Delivered:          { bg: '#E8F5E9', text: '#1B5E20', dot: '#4CAF50' },
};

const C = {
  primary:   '#FA4A0C',
  bg:        '#F9F9FB',
  surface:   '#FFFFFF',
  textDark:  '#1A1A1A',
  textMuted: '#9A9A9D',
  border:    '#E8E8E8',
};

export default function UpdateDeliveryScreen({ route, navigation }) {
  const { delivery } = route.params;

  const [status,  setStatus]  = useState(delivery.status);
  const [address, setAddress] = useState(delivery.address);
  const [phone,   setPhone]   = useState(delivery.phone);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!address.trim()) return Alert.alert('Missing Field', 'Address cannot be empty.');
    if (!phone.trim())   return Alert.alert('Missing Field', 'Phone cannot be empty.');

    setLoading(true);
    try {
      await axios.put(`${BASE_URL}/deliveries/${delivery._id}`, {
        status,
        address: address.trim(),
        phone:   phone.trim(),
      });

      Alert.alert('Updated ✅', 'Delivery updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Go back two screens to the list (or just one to detail — go back twice to refresh list)
            navigation.pop(2);
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Update Delivery</Text>
          <Text style={styles.subtitle}>Order #{delivery.order_id}</Text>

          {/* Status selector */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Delivery Status</Text>
            <View style={styles.statusGrid}>
              {STATUSES.map((s) => {
                const colors   = STATUS_COLORS[s];
                const selected = status === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusBtn,
                      { backgroundColor: selected ? colors.dot : C.bg },
                      selected && styles.statusBtnSelected,
                    ]}
                    onPress={() => setStatus(s)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.statusDot, { backgroundColor: selected ? '#fff' : colors.dot }]} />
                    <Text style={[styles.statusBtnLabel, { color: selected ? '#fff' : colors.text }]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Address & Phone */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contact Details</Text>

            <Text style={styles.fieldLabel}>Address</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={address}
              onChangeText={setAddress}
              placeholder="Delivery address"
              placeholderTextColor={C.textMuted}
              multiline
            />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor={C.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          {/* Save */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>💾  Save Changes</Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },

  backBtn:  { marginBottom: 16 },
  backText: { fontSize: 16, color: C.primary, fontWeight: '600' },

  title:    { fontSize: 26, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: C.textMuted, marginBottom: 24 },

  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.textDark, marginBottom: 14 },

  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statusBtn:  {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    width: '47%',
  },
  statusBtnSelected: { borderColor: 'rgba(255,255,255,0.3)' },
  statusDot:         { width: 8, height: 8, borderRadius: 4, marginRight: 7 },
  statusBtnLabel:    { fontSize: 13, fontWeight: '700' },

  fieldLabel: { fontSize: 13, fontWeight: '700', color: C.textDark, marginBottom: 6 },
  input: {
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.textDark,
  },
  inputMulti: { height: 90, textAlignVertical: 'top' },

  saveBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
