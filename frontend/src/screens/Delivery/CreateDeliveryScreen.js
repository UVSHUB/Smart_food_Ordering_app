import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator, SafeAreaView,
  StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { BASE_URL } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const C = {
  primary:   '#FA4A0C',
  bg:        '#F4F4F6',
  surface:   '#FFFFFF',
  textDark:  '#111827',
  textMid:   '#6B7280',
  textLight: '#9CA3AF',
  border:    '#E5E7EB',
};

// ── Input field component ─────────────────────────────────────────────────────
function Field({ label, icon, value, onChangeText, placeholder, multiline, keyboardType }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={[s.inputWrap, multiline && s.inputWrapMulti]}>
        <MaterialIcons name={icon} size={17} color={C.textLight} style={s.fieldIcon} />
        <TextInput
          style={[s.input, multiline && s.inputMulti]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.textLight}
          multiline={multiline}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={multiline ? 'sentences' : 'none'}
        />
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function CreateDeliveryScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [orderId,  setOrderId]  = useState('');
  const [userId,   setUserId]   = useState(user?._id || '');
  const [address,  setAddress]  = useState('');
  const [phone,    setPhone]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleCreate = async () => {
    if (!orderId.trim()) return Alert.alert('Required', 'Please enter an Order ID.');
    if (!userId.trim())  return Alert.alert('Required', 'Please enter a User ID.');
    if (!address.trim()) return Alert.alert('Required', 'Please enter the delivery address.');
    if (!phone.trim())   return Alert.alert('Required', 'Please enter a phone number.');

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/deliveries`, {
        order_id: orderId.trim(),
        user_id:  userId.trim(),
        address:  address.trim(),
        phone:    phone.trim(),
      });
      Alert.alert('Created', 'Delivery record has been created successfully.', [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create delivery.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={22} color={C.textDark} />
          </TouchableOpacity>
          <View style={s.headerMid}>
            <Text style={s.headerTitle}>Create Delivery</Text>
            <Text style={s.headerSub}>Manual delivery entry</Text>
          </View>
          <View style={s.adminTag}>
            <MaterialIcons name="shield" size={13} color="#fff" />
            <Text style={s.adminTagText}>Admin</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Form card */}
          <View style={s.card}>
            <Text style={s.cardLabel}>Order Information</Text>
            <Field
              label="Order ID"
              icon="receipt-long"
              value={orderId}
              onChangeText={setOrderId}
              placeholder="Paste the order or payment ID"
            />
            <Field
              label="User ID"
              icon="person-outline"
              value={userId}
              onChangeText={setUserId}
              placeholder="MongoDB user ObjectId"
            />
          </View>

          <View style={s.card}>
            <Text style={s.cardLabel}>Delivery Details</Text>
            <Field
              label="Delivery Address"
              icon="location-on"
              value={address}
              onChangeText={setAddress}
              placeholder="Street, city, postal code"
              multiline
            />
            <Field
              label="Phone Number"
              icon="phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="+94 77 000 0000"
              keyboardType="phone-pad"
            />
          </View>

          {/* Info note */}
          <View style={s.note}>
            <MaterialIcons name="info-outline" size={16} color="#92400E" />
            <Text style={s.noteText}>
              Default status will be set to <Text style={{ fontWeight: '800' }}>Pending</Text> and can be updated from the delivery list.
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[s.submitBtn, loading && { opacity: 0.65 }]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <MaterialIcons name="add-circle-outline" size={18} color="#fff" />
                  <Text style={s.submitText}>Create Delivery</Text>
                </>
            }
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 14,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  backBtn:     { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerMid:   { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.textDark },
  headerSub:   { fontSize: 12, color: C.textLight, marginTop: 1 },
  adminTag:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  adminTagText:{ color: '#fff', fontSize: 11, fontWeight: '800' },

  scroll: { padding: 20 },

  // Card
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: C.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 16,
  },

  // Fields
  field:      { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: C.textMid, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 },
  inputWrap:  {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
  },
  inputWrapMulti: { alignItems: 'flex-start' },
  fieldIcon:  { marginRight: 8, paddingTop: Platform.OS === 'ios' ? 12 : 14 },
  input: {
    flex: 1,
    fontSize: 14,
    color: C.textDark,
    paddingVertical: 12,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },

  // Note
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  noteText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 20, fontWeight: '500' },

  // Submit
  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
