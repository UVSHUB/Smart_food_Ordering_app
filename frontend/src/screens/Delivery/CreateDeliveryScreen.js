import React, { useState, useContext } from 'react';
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
import { AuthContext } from '../../context/AuthContext';

const C = {
  primary:   '#FA4A0C',
  bg:        '#F9F9FB',
  surface:   '#FFFFFF',
  textDark:  '#1A1A1A',
  textMuted: '#9A9A9D',
  border:    '#E8E8E8',
};

export default function CreateDeliveryScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [orderId,  setOrderId]  = useState('');
  const [userId,   setUserId]   = useState(user?._id || '');
  const [address,  setAddress]  = useState('');
  const [phone,    setPhone]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleCreate = async () => {
    // Validate required fields
    if (!orderId.trim()) return Alert.alert('Missing Field', 'Please enter an Order ID.');
    if (!userId.trim())  return Alert.alert('Missing Field', 'Please enter a User ID.');
    if (!address.trim()) return Alert.alert('Missing Field', 'Please enter the delivery address.');
    if (!phone.trim())   return Alert.alert('Missing Field', 'Please enter a phone number.');

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/deliveries`, {
        order_id: orderId.trim(),
        user_id:  userId.trim(),
        address:  address.trim(),
        phone:    phone.trim(),
      });

      Alert.alert('Success 🎉', 'Delivery created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create delivery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create Delivery</Text>
          <Text style={styles.subtitle}>Fill in the delivery details below</Text>

          {/* Form card */}
          <View style={styles.card}>
            <InputField label="Order ID *"   value={orderId}  onChangeText={setOrderId}  placeholder="e.g. 64fa123abc…" />
            <InputField label="User ID *"    value={userId}   onChangeText={setUserId}   placeholder="MongoDB ObjectId of user" />
            <InputField label="Address *"    value={address}  onChangeText={setAddress}  placeholder="123 Main St, Colombo" multiline />
            <InputField label="Phone *"      value={phone}    onChangeText={setPhone}    placeholder="+94 77 123 4567" keyboardType="phone-pad" />
          </View>

          {/* Note */}
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>📌 Default status will be set to <Text style={{ fontWeight: '700' }}>Pending</Text></Text>
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>🚚  Create Delivery</Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Reusable input ────────────────────────────────────────────────────────────
function InputField({ label, value, onChangeText, placeholder, multiline, keyboardType }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textMuted}
        multiline={multiline}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={multiline ? 'sentences' : 'none'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },

  backBtn:   { marginBottom: 16 },
  backText:  { fontSize: 16, color: C.primary, fontWeight: '600' },

  title:    { fontSize: 26, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: C.textMuted, marginBottom: 24 },

  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },

  field:       { marginBottom: 18 },
  fieldLabel:  { fontSize: 13, fontWeight: '700', color: C.textDark, marginBottom: 6 },
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

  noteBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  noteText: { fontSize: 13, color: '#5D4037' },

  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
