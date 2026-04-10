import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, StatusBar, Platform
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { MaterialIcons } from '@expo/vector-icons';

const BASE_URL = 'http://10.94.178.167:5001/api';

// ── Ultra Premium Modern Palette ──────────────────────
const C = {
  primary:   '#FA4A0C',
  bg:        '#F9F9FB',
  surface:   '#FFFFFF',
  textDark:  '#1A1A1A',
  textMuted: '#9A9A9D',
  success:   '#22C55E',
  border:    '#E8E8E8',
};

const METHODS = [
  { key: 'Cash',   icon: 'payments',      label: 'Cash on Delivery' },
  { key: 'Card',   icon: 'credit-card',   label: 'Credit / Debit Card' },
  { key: 'Online', icon: 'phone-android', label: 'Online Transfer' },
];

const PaymentScreen = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const { clearCart } = useCart();
  const amount = route?.params?.amount || 0;

  const [method, setMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);

  const handleConfirmPayment = async () => {
    if (!user?._id) {
      Alert.alert('Error', 'You must be logged in to make a payment.');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Order amount must be greater than Rs. 0.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(`${BASE_URL}/payments`, {
        user_id: user._id,
        amount,
        payment_method: method,
      });

      clearCart(); // clear cart after successful payment

      Alert.alert(
        '🎉 Payment Submitted!',
        `Your payment of Rs. ${amount.toFixed(2)} via ${method} has been submitted.\nStatus: ${data.status}`,
        [{ text: 'View History', onPress: () => navigation.navigate('PaymentHistory') }]
      );
    } catch (err) {
      console.log(err);
      Alert.alert('Payment Failed', err.response?.data?.message || 'Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Top Bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={C.textDark} />
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Order Total Card */}
        <View style={s.totalCard}>
          <Text style={s.totalLabel}>Order Total</Text>
          <Text style={s.totalAmount}>Rs. {(amount || 0).toFixed(2)}</Text>
          <View style={s.restaurantRow}>
            <MaterialIcons name="restaurant" size={16} color={C.primary} />
            <Text style={s.restaurantText}>  SLIIT KADE</Text>
          </View>
        </View>

        {/* Payment Method */}
        <Text style={s.sectionTitle}>Payment Method</Text>
        {METHODS.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[s.methodCard, method === m.key && s.methodCardActive]}
            onPress={() => setMethod(m.key)}
            activeOpacity={0.8}
          >
            <View style={[s.methodIcon, method === m.key && s.methodIconActive]}>
              <MaterialIcons name={m.icon} size={24} color={method === m.key ? '#fff' : C.textMuted} />
            </View>
            <Text style={[s.methodLabel, method === m.key && s.methodLabelActive]}>{m.label}</Text>
            {method === m.key && (
              <MaterialIcons name="check-circle" size={22} color={C.primary} />
            )}
          </TouchableOpacity>
        ))}

        {/* Summary */}
        <View style={s.summaryCard}>
          <View style={s.summaryRow}>
            <Text style={s.summaryKey}>Subtotal</Text>
            <Text style={s.summaryVal}>Rs. {(amount || 0).toFixed(2)}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryKey}>Service Fee</Text>
            <Text style={s.summaryVal}>Rs. 0.00</Text>
          </View>
          <View style={[s.summaryRow, s.totalRow]}>
            <Text style={s.totalRowKey}>Total</Text>
            <Text style={s.totalRowVal}>Rs. {(amount || 0).toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.confirmBtn, loading && { opacity: 0.7 }]}
          onPress={handleConfirmPayment}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="lock" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={s.confirmText}>Confirm Payment · Rs. {(amount || 0).toFixed(2)}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  scroll: { padding: 20, paddingBottom: 120 },

  // Total card
  totalCard: {
    backgroundColor: C.primary,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  totalLabel: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginBottom: 8 },
  totalAmount: { fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  restaurantRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  restaurantText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },

  // Method selection
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.textDark, marginBottom: 14, letterSpacing: -0.3 },
  methodCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  methodCardActive: { borderColor: C.primary, backgroundColor: '#FFF5F2' },
  methodIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#F3F3F5',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  methodIconActive: { backgroundColor: C.primary },
  methodLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: C.textMuted },
  methodLabelActive: { color: C.textDark },

  // Summary
  summaryCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  summaryKey: { fontSize: 14, color: C.textMuted, fontWeight: '500' },
  summaryVal: { fontSize: 14, color: C.textDark, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 14, marginBottom: 0 },
  totalRowKey: { fontSize: 16, fontWeight: '800', color: C.textDark },
  totalRowVal: { fontSize: 16, fontWeight: '900', color: C.primary },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    backgroundColor: C.bg,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  confirmBtn: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default PaymentScreen;
