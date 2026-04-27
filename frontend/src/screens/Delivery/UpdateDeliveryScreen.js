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

const STATUS_META = {
  Pending:            { bg: '#FFF3E0', text: '#E65100', dot: '#FF9800', icon: 'hourglass-empty'  },
  Preparing:          { bg: '#E3F2FD', text: '#0D47A1', dot: '#2196F3', icon: 'restaurant'       },
  'Out for Delivery': { bg: '#F3E5F5', text: '#6A1B9A', dot: '#9C27B0', icon: 'delivery-dining'  },
  Delivered:          { bg: '#E8F5E9', text: '#1B5E20', dot: '#4CAF50', icon: 'check-circle'     },
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
  const { user } = useContext(AuthContext);
  const { delivery } = route.params;

  // ── Security: only admin can access this screen ───────────────────────────
  if (!user?.isAdmin) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={s.noAccessWrap}>
          <MaterialIcons name="lock" size={64} color={C.border} />
          <Text style={s.noAccessTitle}>Admin Only</Text>
          <Text style={s.noAccessSub}>You do not have permission to update delivery status.</Text>
          <TouchableOpacity style={s.noAccessBtn} onPress={() => navigation.goBack()}>
            <Text style={s.noAccessBtnText}>Go Back</Text>
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
        { text: 'OK', onPress: () => navigation.pop(2) },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const currentMeta = STATUS_META[status];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={20} color={C.textDark} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Update Delivery</Text>
            <Text style={s.headerSub}>Order #{delivery.order_id?.slice(-8).toUpperCase()}</Text>
          </View>
          {/* Admin badge */}
          <View style={s.adminBadge}>
            <MaterialIcons name="admin-panel-settings" size={14} color="#fff" />
            <Text style={s.adminBadgeText}>Admin</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Current status preview */}
          <View style={[s.currentStatusCard, { backgroundColor: currentMeta.bg }]}>
            <View style={[s.statusIconCircle, { backgroundColor: currentMeta.dot }]}>
              <MaterialIcons name={currentMeta.icon} size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.currentStatusLabel, { color: currentMeta.text }]}>Current Status</Text>
              <Text style={[s.currentStatusValue, { color: currentMeta.text }]}>{status}</Text>
            </View>
          </View>

          {/* Status selection */}
          <View style={s.card}>
            <Text style={s.sectionTitle}>Select New Status</Text>
            <View style={s.statusGrid}>
              {STATUSES.map((st) => {
                const meta     = STATUS_META[st];
                const selected = status === st;
                return (
                  <TouchableOpacity
                    key={st}
                    style={[
                      s.statusBtn,
                      selected
                        ? { backgroundColor: meta.dot, borderColor: meta.dot }
                        : { backgroundColor: meta.bg,  borderColor: 'transparent' },
                    ]}
                    onPress={() => setStatus(st)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={meta.icon}
                      size={18}
                      color={selected ? '#fff' : meta.dot}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[s.statusBtnLabel, { color: selected ? '#fff' : meta.text }]}>
                      {st}
                    </Text>
                    {selected && (
                      <MaterialIcons name="check" size={14} color="#fff" style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Contact details */}
          <View style={s.card}>
            <Text style={s.sectionTitle}>Contact Details</Text>

            <Text style={s.fieldLabel}>📍 Delivery Address</Text>
            <TextInput
              style={[s.input, s.inputMulti]}
              value={address}
              onChangeText={setAddress}
              placeholder="Delivery address"
              placeholderTextColor={C.textMuted}
              multiline
            />

            <Text style={[s.fieldLabel, { marginTop: 14 }]}>📞 Phone Number</Text>
            <TextInput
              style={s.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor={C.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[s.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <MaterialIcons name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={s.saveBtnText}>Save Changes</Text>
                </>
            }
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // No access screen
  noAccessWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  noAccessTitle:{ fontSize: 22, fontWeight: '800', color: C.textDark, marginTop: 16, marginBottom: 8 },
  noAccessSub:  { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  noAccessBtn:  { backgroundColor: C.primary, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  noAccessBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
    gap: 12,
  },
  backBtn:     { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.textDark },
  headerSub:   { fontSize: 12, color: C.textMuted, marginTop: 1 },
  adminBadge:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, gap: 4 },
  adminBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  scroll: { padding: 20, paddingBottom: 40 },

  // Current status
  currentStatusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 18, padding: 18,
    marginBottom: 16,
  },
  statusIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  currentStatusLabel: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  currentStatusValue: { fontSize: 18, fontWeight: '900' },

  // Card
  card: {
    backgroundColor: C.surface, borderRadius: 20, padding: 20,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.textDark, marginBottom: 16 },

  // Status grid
  statusGrid: { gap: 10 },
  statusBtn:  {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 14, borderWidth: 1.5,
  },
  statusBtnLabel: { fontSize: 14, fontWeight: '700' },

  // Inputs
  fieldLabel: { fontSize: 13, fontWeight: '700', color: C.textDark, marginBottom: 8 },
  input: {
    backgroundColor: C.bg, borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: C.textDark,
  },
  inputMulti: { height: 90, textAlignVertical: 'top' },

  // Save button
  saveBtn: {
    backgroundColor: C.primary, borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
