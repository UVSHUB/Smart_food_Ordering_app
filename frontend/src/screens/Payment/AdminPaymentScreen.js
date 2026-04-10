import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, StatusBar, Platform
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const BASE_URL = 'http://10.94.178.167:5001/api';

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

const AdminPaymentScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/payments`);
      setPayments(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load payments.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPayments(); }, []));

  const handleDelete = (id, amount) => {
    Alert.alert(
      'Delete Payment?',
      `Are you sure you want to delete the payment of Rs. ${parseFloat(amount).toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/payments/${id}`);
              setPayments((prev) => prev.filter((p) => p._id !== id));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete payment.');
            }
          },
        },
      ]
    );
  };

  const handleUpdateOrderStatus = async (id, currentStatus) => {
    const nextStatusMap = {
      'Pending': 'Preparing',
      'Preparing': 'Delivered',
      'Delivered': 'Pending' // wrap around
    };
    const nextStatus = nextStatusMap[currentStatus] || 'Pending';

    try {
      const { data } = await axios.put(`${BASE_URL}/payments/${id}`, { order_status: nextStatus });
      setPayments((prev) => prev.map((p) => (p._id === id ? data : p)));
    } catch (err) {
      Alert.alert('Error', 'Failed to update order status.');
    }
  };

  const renderItem = ({ item }) => {
    const isPaid = item.status === 'Paid';
    const date = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

    return (
      <View style={s.card}>
        <View style={[s.iconBox, { backgroundColor: isPaid ? '#F0FDF4' : '#FFFBEB' }]}>
          <MaterialIcons
            name={METHOD_ICONS[item.payment_method] || 'receipt'}
            size={22}
            color={isPaid ? C.success : C.pending}
          />
        </View>

        <View style={s.cardBody}>
          <Text style={s.userName}>{item.user_id?.name || 'Unknown User'}</Text>
          <Text style={s.cardMeta}>{item.payment_method} · {date}</Text>
          
          <View style={s.badgeRow}>
            {/* Payment Status Badge */}
            <View style={[s.badge, { backgroundColor: isPaid ? '#F0FDF4' : '#FFFBEB' }]}>
              <Text style={[s.badgeText, { color: isPaid ? C.success : C.pending }]}>{item.status}</Text>
            </View>

            {/* Order Status Badge (Actionable) */}
            <TouchableOpacity 
              onPress={() => handleUpdateOrderStatus(item._id, item.order_status)}
              style={[s.statusUpdateBtn, { 
                backgroundColor: item.order_status === 'Delivered' ? '#F0FDF4' : (item.order_status === 'Preparing' ? '#EFF6FF' : '#FFFBEB') 
              }]}
            >
              <MaterialIcons 
                name={item.order_status === 'Delivered' ? 'check-circle' : (item.order_status === 'Preparing' ? 'restaurant' : 'schedule')} 
                size={14} 
                color={item.order_status === 'Delivered' ? C.success : (item.order_status === 'Preparing' ? '#3B82F6' : C.pending)} 
                style={{ marginRight: 4 }}
              />
              <Text style={[s.badgeText, { 
                color: item.order_status === 'Delivered' ? C.success : (item.order_status === 'Preparing' ? '#3B82F6' : C.pending) 
              }]}>
                {item.order_status || 'Pending'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Text style={s.amount}>Rs. {(item.amount || 0).toFixed(2)}</Text>
          <TouchableOpacity onPress={() => handleDelete(item._id, item.amount)} style={s.deleteBtn}>
            <MaterialIcons name="delete-outline" size={20} color={C.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={C.textDark} />
        </TouchableOpacity>
        <Text style={s.topBarTitle}>All Payments</Text>
        <TouchableOpacity onPress={fetchPayments}>
          <MaterialIcons name="refresh" size={24} color={C.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary strip */}
      <View style={s.summaryStrip}>
        <View style={s.stripItem}>
          <Text style={s.stripNum}>{payments.length}</Text>
          <Text style={s.stripLabel}>Total</Text>
        </View>
        <View style={s.stripDivider} />
        <View style={s.stripItem}>
          <Text style={[s.stripNum, { color: C.success }]}>{payments.filter(p => p.status === 'Paid').length}</Text>
          <Text style={s.stripLabel}>Paid</Text>
        </View>
        <View style={s.stripDivider} />
        <View style={s.stripItem}>
          <Text style={[s.stripNum, { color: C.pending }]}>{payments.filter(p => p.status === 'Pending').length}</Text>
          <Text style={s.stripLabel}>Pending</Text>
        </View>
        <View style={s.stripDivider} />
        <View style={s.stripItem}>
          <Text style={[s.stripNum, { color: C.primary }]}>
            Rs. {payments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(0)}
          </Text>
          <Text style={s.stripLabel}>Total Rev.</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.centered}><ActivityIndicator size="large" color={C.primary} /></View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.empty}>
              <MaterialIcons name="receipt-long" size={64} color={C.border} />
              <Text style={s.emptyText}>No payments found</Text>
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

  summaryStrip: {
    backgroundColor: C.surface,
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  stripItem: { flex: 1, alignItems: 'center' },
  stripNum: { fontSize: 16, fontWeight: '900', color: C.textDark },
  stripLabel: { fontSize: 11, color: C.textMuted, marginTop: 2, fontWeight: '600' },
  stripDivider: { width: 1, backgroundColor: C.border, alignSelf: 'stretch' },

  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  cardBody: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  cardMeta: { fontSize: 13, color: C.textMuted, marginBottom: 10 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusUpdateBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  badgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  amount: { fontSize: 15, fontWeight: '800', color: C.textDark },
  deleteBtn: { padding: 4 },

  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: C.textMuted, fontWeight: '600', marginTop: 16 },
});

export default AdminPaymentScreen;
