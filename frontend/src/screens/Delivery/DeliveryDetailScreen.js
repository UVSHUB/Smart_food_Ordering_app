import React, { useContext, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, StatusBar, Animated, Platform, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const STATUS = {
  Pending:            { bg: '#FFF8F0', text: '#C2410C', dot: '#F97316', icon: 'schedule',        label: 'Order Received'       },
  Preparing:          { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6', icon: 'restaurant',      label: 'Being Prepared'       },
  'Out for Delivery': { bg: '#FAF5FF', text: '#7E22CE', dot: '#A855F7', icon: 'delivery-dining', label: 'Out for Delivery'     },
  Delivered:          { bg: '#F0FDF4', text: '#15803D', dot: '#22C55E', icon: 'check-circle',    label: 'Delivered'            },
  Cancelled:          { bg: '#FFF0F0', text: '#DC2626', dot: '#EF4444', icon: 'cancel',          label: 'Order Cancelled'      },
};

const STEPS = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];

const C = {
  primary:   '#FA4A0C',
  bg:        '#F4F4F6',
  surface:   '#FFFFFF',
  textDark:  '#111827',
  textMid:   '#6B7280',
  textLight: '#9CA3AF',
  border:    '#E5E7EB',
};

// ── Vertical progress tracker ─────────────────────────────────────────────────
function ProgressTracker({ currentStatus }) {
  const currentIndex = STEPS.indexOf(currentStatus);

  return (
    <View style={pt.wrap}>
      {STEPS.map((step, idx) => {
        const done   = idx <= currentIndex;
        const active = idx === currentIndex;
        const meta   = STATUS[step];

        return (
          <View key={step} style={pt.row}>
            {/* Icon column */}
            <View style={pt.iconCol}>
              <View style={[
                pt.circle,
                done  && { backgroundColor: meta.dot, borderColor: meta.dot },
                !done && { backgroundColor: C.bg, borderColor: C.border },
              ]}>
                <MaterialIcons
                  name={meta.icon}
                  size={16}
                  color={done ? '#fff' : C.textLight}
                />
              </View>
              {idx < STEPS.length - 1 && (
                <View style={[pt.line, done && idx < currentIndex && { backgroundColor: meta.dot }]} />
              )}
            </View>

            {/* Text column */}
            <View style={pt.textCol}>
              <Text style={[pt.stepName, done && { color: C.textDark, fontWeight: '700' }]}>
                {step}
              </Text>
              {active && (
                <Text style={[pt.stepDesc, { color: meta.text }]}>{meta.label}</Text>
              )}
            </View>

            {/* Active badge */}
            {active && (
              <View style={[pt.badge, { backgroundColor: meta.bg }]}>
                <Text style={[pt.badgeText, { color: meta.text }]}>Current</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoIconBox}>
        <MaterialIcons name={icon} size={16} color={C.primary} />
      </View>
      <View style={s.infoText}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function DeliveryDetailScreen({ route, navigation }) {
  const { user }     = useContext(AuthContext);
  const { delivery } = route.params;

  const meta   = STATUS[delivery.status] || STATUS.Pending;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const date = new Date(delivery.createdAt).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
  const time = new Date(delivery.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.put(`${BASE_URL}/payments/${delivery.order_id}/cancel`, { cancellation_reason: 'Cancelled by user' });
              Alert.alert('Success', 'Order has been cancelled.');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to cancel order.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={meta.dot} />

      {/* ── Coloured header ── */}
      <View style={[s.header, { backgroundColor: meta.dot }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <View style={s.headerIconRing}>
            <MaterialIcons name={meta.icon} size={28} color={meta.dot} />
          </View>
          <Text style={s.headerStatus}>{delivery.status}</Text>
          <Text style={s.headerDesc}>{meta.label}</Text>
        </View>

        {/* spacer to balance back button */}
        <View style={{ width: 40 }} />
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeIn, transform: [{ translateY: slideY }] }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Order ID row */}
        <View style={s.orderIdRow}>
          <MaterialIcons name="receipt-long" size={16} color={C.textMid} />
          <Text style={s.orderIdText}>
            Order  <Text style={s.orderIdVal}>#{delivery.order_id?.slice(-8).toUpperCase()}</Text>
          </Text>
        </View>

        {/* Progress card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Delivery Progress</Text>
          {delivery.status === 'Cancelled' ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <MaterialIcons name="cancel" size={48} color="#EF4444" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#EF4444', marginTop: 12 }}>Delivery Cancelled</Text>
              <Text style={{ fontSize: 13, color: C.textMid, marginTop: 6, textAlign: 'center' }}>
                This delivery has been cancelled.
              </Text>
            </View>
          ) : (
            <ProgressTracker currentStatus={delivery.status} />
          )}
        </View>

        {/* Details card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Delivery Details</Text>
          <InfoRow icon="location-on"  label="Delivery Address" value={delivery.address} />
          <InfoRow icon="phone"         label="Phone Number"     value={delivery.phone}   />
          <InfoRow icon="event"         label="Date"             value={date}             />
          <InfoRow icon="access-time"   label="Time"             value={time}             />
        </View>

        {/* CTA */}
        {user?.isAdmin ? (
          <TouchableOpacity
            style={[s.updateBtn, { backgroundColor: meta.dot }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('UpdateDelivery', { delivery })}
          >
            <MaterialIcons name="edit" size={18} color="#fff" />
            <Text style={s.updateBtnText}>Update Status</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ gap: 12 }}>
            <View style={[s.statusNote, { backgroundColor: meta.bg, borderLeftColor: meta.dot }]}>
              <MaterialIcons name="info-outline" size={16} color={meta.dot} style={{ marginTop: 1 }} />
              <Text style={[s.statusNoteText, { color: meta.text }]}>
                {delivery.status === 'Delivered'
                  ? 'Your order has been delivered successfully. Thank you!'
                  : 'Your order is being processed. You will see live updates here.'}
              </Text>
            </View>
            
            {delivery.status === 'Pending' && (
              <TouchableOpacity
                style={s.cancelBtn}
                activeOpacity={0.8}
                onPress={handleCancelOrder}
              >
                <MaterialIcons name="cancel" size={18} color="#EF4444" />
                <Text style={s.cancelBtnText}>Cancel Order</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 24 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20 },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 24) + 10,
    paddingBottom: 28,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  backBtn:       { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start', marginTop: 2 },
  headerCenter:  { flex: 1, alignItems: 'center' },
  headerIconRing:{
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  headerStatus:  { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 3 },
  headerDesc:    { fontSize: 12, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

  // Order ID
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    alignSelf: 'flex-start',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  orderIdText: { fontSize: 13, color: C.textMid, fontWeight: '500' },
  orderIdVal:  { fontWeight: '800', color: C.textDark, letterSpacing: 0.4 },

  // Cards
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: C.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 18,
  },

  // Info rows
  infoRow:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  infoIconBox:{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFF2EE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoText:   { flex: 1, justifyContent: 'center' },
  infoLabel:  { fontSize: 11, color: C.textLight, fontWeight: '600', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.3 },
  infoValue:  { fontSize: 14, color: C.textDark, fontWeight: '600', lineHeight: 20 },

  // Update button
  updateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 14, paddingVertical: 16,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  updateBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  // Status note
  statusNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 12, padding: 14,
    borderLeftWidth: 4,
  },
  statusNoteText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 20 },
  
  // Cancel button
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1, borderColor: '#EF4444',
    backgroundColor: '#FFF0F0',
  },
  cancelBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
});

// ── Progress tracker styles ────────────────────────────────────────────────────
const pt = StyleSheet.create({
  wrap: { paddingLeft: 4 },
  row:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },

  iconCol: { width: 36, alignItems: 'center', marginRight: 14 },
  circle:  {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  line: {
    width: 2, flex: 1,
    backgroundColor: C.border,
    minHeight: 28,
    marginVertical: 4,
  },

  textCol:   { flex: 1, paddingTop: 6, paddingBottom: 24 },
  stepName:  { fontSize: 14, fontWeight: '500', color: C.textLight },
  stepDesc:  { fontSize: 12, fontWeight: '600', marginTop: 3, lineHeight: 17 },

  badge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginTop: 6 },
  badgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
});
