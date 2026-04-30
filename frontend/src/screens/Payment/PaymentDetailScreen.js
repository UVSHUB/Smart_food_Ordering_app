import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, StatusBar, Platform
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

import { BASE_URL } from '../../services/api';

const C = {
  primary:   '#FA4A0C',
  bg:        '#F9F9FB',
  surface:   '#FFFFFF',
  textDark:  '#1A1A1A',
  textMuted: '#9A9A9D',
  success:   '#22C55E',
  pending:   '#F59E0B',
  danger:    '#FF4B4B',
  dangerBg:  '#FFF0F0',
  border:    '#E8E8E8',
};

const METHOD_ICONS = { Cash: 'payments', Card: 'credit-card', Online: 'phone-android' };

const PaymentDetailScreen = ({ route, navigation }) => {
  const { payment: initial } = route.params;
  const [payment, setPayment] = useState(initial);
  const [loading, setLoading] = useState(false);

  const isPaid = payment.status === 'Paid';
  const isCancelled = payment.order_status === 'Cancelled';

  const handleMarkPaid = async () => {
    if (isPaid) {
      Alert.alert('Already Paid', 'This payment has already been marked as Paid.');
      return;
    }
    Alert.alert(
      'Mark as Paid',
      'Are you sure you want to mark this payment as Paid?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setLoading(true);
              const { data } = await axios.put(`${BASE_URL}/payments/${payment._id}`, { status: 'Paid' });
              setPayment(data);
              Alert.alert('Success', 'Payment marked as Paid!');
            } catch (err) {
              Alert.alert('Error', 'Failed to update payment status.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

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
              setLoading(true);
              const { data } = await axios.put(`${BASE_URL}/payments/${payment._id}/cancel`, { cancellation_reason: 'Cancelled by user' });
              setPayment(data);
              Alert.alert('Cancelled', 'Your order has been cancelled.');
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to cancel order.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const date = new Date(payment.createdAt).toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={C.textDark} />
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Payment Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {isCancelled && (
          <View style={s.cancelledBanner}>
            <MaterialIcons name="cancel" size={24} color={C.danger} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.cancelledTitle}>Order Cancelled</Text>
              <Text style={s.cancelledReason}>{payment.cancellation_reason || 'Cancelled by admin'}</Text>
            </View>
          </View>
        )}

        {/* Status Hero */}
        <View style={[s.heroCard, { backgroundColor: isCancelled ? C.danger : (isPaid ? C.success : C.pending) }]}>
          <MaterialIcons
            name={isCancelled ? 'cancel' : (isPaid ? 'check-circle' : 'access-time')}
            size={48} color="#fff"
            style={{ marginBottom: 12 }}
          />
          <Text style={s.heroStatus}>{isCancelled ? 'Cancelled' : payment.status}</Text>
          <Text style={s.heroAmount}>Rs. {(payment.amount || 0).toFixed(2)}</Text>
          <Text style={s.heroDate}>{date}</Text>
        </View>

        {/* Order Progress Tracker */}
        {!isCancelled && (
          <View style={s.trackerCard}>
            <Text style={s.trackerTitle}>Order Progress</Text>
            <View style={s.trackerContainer}>
              {/* Step 1: Pending */}
              <TrackerStep 
                icon="receipt-long" 
                label="Received" 
                active={['Pending', 'Preparing', 'Delivered'].includes(payment.order_status || 'Pending')} 
                completed={['Preparing', 'Delivered'].includes(payment.order_status)}
              />
              <TrackerLine active={['Preparing', 'Delivered'].includes(payment.order_status)} />
              
              {/* Step 2: Preparing */}
              <TrackerStep 
                icon="restaurant" 
                label="Kitchen" 
                active={['Preparing', 'Delivered'].includes(payment.order_status)} 
                completed={['Delivered'].includes(payment.order_status)}
              />
              <TrackerLine active={['Delivered'].includes(payment.order_status)} />
              
              {/* Step 3: Delivered */}
              <TrackerStep 
                icon="verified" 
                label="Delivered" 
                active={['Delivered'].includes(payment.order_status)} 
                completed={false}
                isLast
              />
            </View>
          </View>
        )}

        {/* Detail Rows */}
        <View style={s.detailCard}>
          <DetailRow icon="tag" label="Payment ID" value={payment._id} mono />
          <DetailRow icon={METHOD_ICONS[payment.payment_method] || 'receipt'} label="Method" value={payment.payment_method} />
          <DetailRow icon="attach-money" label="Amount" value={`Rs. ${(payment.amount || 0).toFixed(2)}`} />
          <DetailRow icon="info" label="Payment Status" value={payment.status} />
          <DetailRow icon="restaurant" label="Order Status" value={payment.order_status || 'Pending'} last />
        </View>

        {/* Action Buttons */}
        {!isPaid && !isCancelled && (
          <TouchableOpacity
            style={[s.actionBtn, loading && { opacity: 0.7 }, { marginBottom: 16 }]}
            onPress={handleMarkPaid}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={s.actionText}>Mark as Paid</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {payment.order_status === 'Pending' && !isCancelled && (
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: C.dangerBg, shadowColor: C.danger }, loading && { opacity: 0.7 }]}
            onPress={handleCancelOrder}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={C.danger} />
            ) : (
              <>
                <MaterialIcons name="cancel" size={20} color={C.danger} style={{ marginRight: 8 }} />
                <Text style={[s.actionText, { color: C.danger }]}>Cancel Order</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {isPaid && !isCancelled && (
          <View style={s.paidBadge}>
            <MaterialIcons name="verified" size={20} color={C.success} style={{ marginRight: 8 }} />
            <Text style={s.paidBadgeText}>This payment is completed</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Reusable detail row
const DetailRow = ({ icon, label, value, mono = false, last = false }) => (
  <View style={[dr.row, !last && dr.border]}>
    <MaterialIcons name={icon} size={20} color={C.textMuted} style={{ marginRight: 12 }} />
    <View style={{ flex: 1 }}>
      <Text style={dr.label}>{label}</Text>
      <Text style={[dr.value, mono && dr.mono]} numberOfLines={2}>{value}</Text>
    </View>
  </View>
);

// Order Tracker Components
const TrackerStep = ({ icon, label, active, completed, isLast }) => (
  <View style={ts.stepWrap}>
    <View style={[ts.iconCircle, active && ts.activeCircle, completed && ts.completedCircle]}>
      <MaterialIcons 
        name={completed ? 'check' : icon} 
        size={18} 
        color={active ? '#fff' : C.textMuted} 
      />
    </View>
    <Text style={[ts.label, active && ts.activeLabel]}>{label}</Text>
  </View>
);

const TrackerLine = ({ active }) => (
  <View style={ts.lineWrap}>
    <View style={[ts.line, active && ts.activeLine]} />
  </View>
);

const ts = StyleSheet.create({
  stepWrap: { alignItems: 'center', width: 70 },
  iconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  activeCircle: { backgroundColor: C.primary, shadowColor: C.primary, shadowOpacity: 0.3, shadowRadius: 5, elevation: 3 },
  completedCircle: { backgroundColor: C.success },
  label: { fontSize: 10, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase' },
  activeLabel: { color: C.textDark },
  lineWrap: { flex: 1, height: 36, justifyContent: 'center', paddingHorizontal: 4 },
  line: { height: 2, backgroundColor: '#E5E7EB', borderRadius: 1 },
  activeLine: { backgroundColor: C.primary },
});

const dr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  border: { borderBottomWidth: 1, borderBottomColor: C.border },
  label: { fontSize: 12, color: C.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  value: { fontSize: 15, color: C.textDark, fontWeight: '700' },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', fontSize: 13 },
});

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  topBar: {
    backgroundColor: C.bg,
    paddingTop: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 24) + 10,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  topBarTitle: { fontSize: 18, fontWeight: '700', color: C.textDark },
  scroll: { padding: 20 },

  cancelledBanner: {
    backgroundColor: C.dangerBg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 75, 0.3)',
  },
  cancelledTitle: { fontSize: 15, fontWeight: '800', color: C.danger, marginBottom: 4 },
  cancelledReason: { fontSize: 13, color: C.danger, opacity: 0.8 },

  heroCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  heroStatus: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  heroAmount: { fontSize: 40, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: 8 },
  heroDate: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },

  detailCard: {
    elevation: 3,
    marginBottom: 24,
  },

  trackerCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  trackerTitle: { fontSize: 13, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 20, textAlign: 'center' },
  trackerContainer: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },

  actionBtn: {
    backgroundColor: C.success,
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  paidBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 18,
  },
  paidBadgeText: { color: C.success, fontSize: 15, fontWeight: '700' },
});

export default PaymentDetailScreen;
