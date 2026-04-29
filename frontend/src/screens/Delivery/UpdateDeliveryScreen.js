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

const STATUSES = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];

const STATUS = {
  Pending:            { bg: '#FFF8F0', text: '#C2410C', dot: '#F97316', icon: 'schedule'        },
  Preparing:          { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6', icon: 'restaurant'      },
  'Out for Delivery': { bg: '#FAF5FF', text: '#7E22CE', dot: '#A855F7', icon: 'delivery-dining' },
  Delivered:          { bg: '#F0FDF4', text: '#15803D', dot: '#22C55E', icon: 'check-circle'    },
};

const C = {
  primary:   '#FA4A0C',
  bg:        '#F4F4F6',
  surface:   '#FFFFFF',
  textDark:  '#111827',
  textMid:   '#6B7280',
  textLight: '#9CA3AF',
  border:    '#E5E7EB',
};

export default function UpdateDeliveryScreen({ route, navigation }) {
  const { user }     = useContext(AuthContext);
  const { delivery } = route.params;

  // ── Admin guard ─────────────────────────────────────────────────────────────
  if (!user?.isAdmin) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.guardWrap}>
          <View style={s.guardIconBox}>
            <MaterialIcons name="lock" size={36} color={C.textLight} />
          </View>
          <Text style={s.guardTitle}>Access Restricted</Text>
          <Text style={s.guardSub}>Only administrators can update delivery status.</Text>
          <TouchableOpacity style={s.guardBtn} onPress={() => navigation.goBack()}>
            <Text style={s.guardBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const [status,  setStatus]  = useState(delivery.status);
  const [address, setAddress] = useState(delivery.address);
  const [phone,   setPhone]   = useState(delivery.phone);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!address.trim()) return Alert.alert('Required', 'Address cannot be empty.');
    if (!phone.trim())   return Alert.alert('Required', 'Phone number cannot be empty.');

    const phoneRegex = /^(0\d{9})$/;
    if (!phoneRegex.test(phone.trim())) {
      return Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number starting with 0 (e.g. 0712345678).');
    }

    setLoading(true);
    try {
      await axios.put(`${BASE_URL}/deliveries/${delivery._id}`, {
        status, address: address.trim(), phone: phone.trim(),
      });
      Alert.alert('Saved', 'Delivery record updated successfully.', [
        { text: 'Done', onPress: () => navigation.pop(2) },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Update failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentMeta = STATUS[status];

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
            <Text style={s.headerTitle}>Update Delivery</Text>
            <Text style={s.headerSub}>#{delivery.order_id?.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={s.adminTag}>
            <MaterialIcons name="shield" size={13} color="#fff" />
            <Text style={s.adminTagText}>Admin</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Current status banner */}
          <View style={[s.currentBanner, { backgroundColor: currentMeta.bg, borderColor: currentMeta.dot }]}>
            <View style={[s.bannerIcon, { backgroundColor: currentMeta.dot }]}>
              <MaterialIcons name={currentMeta.icon} size={20} color="#fff" />
            </View>
            <View style={s.bannerText}>
              <Text style={s.bannerLabel}>Current Status</Text>
              <Text style={[s.bannerValue, { color: currentMeta.text }]}>{status}</Text>
            </View>
          </View>

          {/* Status selector */}
          <View style={s.card}>
            <Text style={s.cardLabel}>Select Status</Text>
            <View style={s.statusList}>
              {STATUSES.map((st) => {
                const meta     = STATUS[st];
                const selected = status === st;
                return (
                  <TouchableOpacity
                    key={st}
                    style={[
                      s.statusRow,
                      selected && { backgroundColor: meta.bg, borderColor: meta.dot },
                    ]}
                    onPress={() => setStatus(st)}
                    activeOpacity={0.8}
                  >
                    <View style={[s.statusRowIcon, { backgroundColor: selected ? meta.dot : C.bg }]}>
                      <MaterialIcons name={meta.icon} size={16} color={selected ? '#fff' : C.textLight} />
                    </View>
                    <Text style={[s.statusRowLabel, selected && { color: meta.text, fontWeight: '800' }]}>
                      {st}
                    </Text>
                    {selected && (
                      <MaterialIcons name="check-circle" size={18} color={meta.dot} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Contact card */}
          <View style={s.card}>
            <Text style={s.cardLabel}>Contact Details</Text>

            <Text style={s.fieldLabel}>Delivery Address</Text>
            <TextInput
              style={[s.input, s.inputMulti]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter delivery address"
              placeholderTextColor={C.textLight}
              multiline
            />

            <Text style={[s.fieldLabel, { marginTop: 14 }]}>Phone Number</Text>
            <TextInput
              style={s.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              placeholderTextColor={C.textLight}
              keyboardType="phone-pad"
            />
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[s.saveBtn, loading && { opacity: 0.65 }]}
            onPress={handleUpdate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <MaterialIcons name="save" size={18} color="#fff" />
                  <Text style={s.saveBtnText}>Save Changes</Text>
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

  // Guard
  guardWrap:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  guardIconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: C.border, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  guardTitle:   { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 8 },
  guardSub:     { fontSize: 14, color: C.textMid, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  guardBtn:     { backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 13 },
  guardBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

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
  backBtn:    { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerMid:  { flex: 1 },
  headerTitle:{ fontSize: 17, fontWeight: '800', color: C.textDark },
  headerSub:  { fontSize: 12, color: C.textLight, marginTop: 1, letterSpacing: 0.3 },
  adminTag:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  adminTagText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  scroll: { padding: 20 },

  // Current banner
  currentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  bannerIcon:  { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  bannerText:  { flex: 1 },
  bannerLabel: { fontSize: 11, color: C.textLight, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  bannerValue: { fontSize: 17, fontWeight: '800' },

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
    marginBottom: 14,
  },

  // Status list
  statusList: { gap: 8 },
  statusRow:  {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: C.bg,
  },
  statusRowIcon: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  statusRowLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: C.textMid },

  // Inputs
  fieldLabel: { fontSize: 12, fontWeight: '700', color: C.textMid, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 },
  input: {
    backgroundColor: C.bg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.textDark,
  },
  inputMulti: { minHeight: 88, textAlignVertical: 'top' },

  // Save
  saveBtn: {
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
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
