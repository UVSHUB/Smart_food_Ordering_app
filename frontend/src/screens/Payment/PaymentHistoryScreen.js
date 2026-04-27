import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, StatusBar, Platform
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { BASE_URL } from '../../services/api';

const C = {
  primary:   '#FA4A0C',
  bg:        '#F9F9FB',
  surface:   '#FFFFFF',
  textDark:  '#1A1A1A',
  textMuted: '#9A9A9D',
  success:   '#22C55E',
  pending:   '#F59E0B',
  border:    '#E8E8E8',
};

const METHOD_ICONS = { Cash: 'payments', Card: 'credit-card', Online: 'phone-android' };

const PaymentHistoryScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/payments/user/${user._id}`);
      setPayments(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load payment history.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPayments(); }, []));

  const renderItem = ({ item }) => {
    const isPaid = item.status === 'Paid';
    const date = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });

    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => navigation.navigate('PaymentDetail', { payment: item })}
        activeOpacity={0.8}
      >
        <View style={[s.iconBox, { backgroundColor: isPaid ? '#F0FDF4' : '#FFFBEB' }]}>
          <MaterialIcons
            name={METHOD_ICONS[item.payment_method] || 'receipt'}
            size={24}
            color={isPaid ? C.success : C.pending}
          />
        </View>
        <View style={s.cardBody}>
          <Text style={s.cardTitle}>{item.payment_method} Payment</Text>
          <Text style={s.cardDate}>{date}</Text>
          <Text style={s.cardAmount}>Rs. {(item.amount || 0).toFixed(2)}</Text>
          <View style={s.badgeRow}>
            <View style={[s.statusBadge, { backgroundColor: isPaid ? '#F0FDF4' : '#FFFBEB' }]}>
              <Text style={[s.statusText, { color: isPaid ? C.success : C.pending }]}>{item.status}</Text>
            </View>
            <View style={[s.statusBadge, {
              backgroundColor: item.order_status === 'Delivered' ? '#F0FDF4' : (item.order_status === 'Preparing' ? '#EFF6FF' : '#FFFBEB')
            }]}>
              <Text style={[s.statusText, {
                color: item.order_status === 'Delivered' ? C.success : (item.order_status === 'Preparing' ? '#3B82F6' : C.pending)
              }]}>
                {item.order_status || 'Pending'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={s.trackBtn}
            onPress={() => navigation.navigate('DeliveryHistory')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="local-shipping" size={13} color={C.primary} />
            <Text style={s.trackBtnText}>Track Delivery</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={C.textDark} />
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Payment History</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.empty}>
              <MaterialIcons name="receipt-long" size={64} color={C.border} />
              <Text style={s.emptyText}>No payments yet</Text>
              <Text style={s.emptySubText}>Your payment history will appear here.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20 },

  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  iconBox: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  cardDate: { fontSize: 13, color: C.textMuted },
  cardAmount: { fontSize: 16, fontWeight: '800', color: C.textDark },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },

  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '700', color: C.textMuted, marginTop: 16 },
  emptySubText: { fontSize: 13, color: C.textMuted, marginTop: 6, textAlign: 'center' },

  trackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF2EE',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1, borderColor: C.primary,
  },
  trackBtnText: { fontSize: 12, fontWeight: '700', color: C.primary },
});

export default PaymentHistoryScreen;
