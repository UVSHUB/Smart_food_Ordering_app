import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, SafeAreaView, StatusBar, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const C = {
  primary:   '#FA4A0C',
  bg:        '#F9F9FB',
  surface:   '#FFFFFF',
  textDark:  '#1A1A1A',
  textMuted: '#9A9A9D',
  success:   '#22C55E',
  border:    '#E8E8E8',
};

const METHOD_ICONS = { Cash: 'payments', Card: 'credit-card', Online: 'phone-android' };
const METHOD_LABELS = { Cash: 'Cash on Delivery', Card: 'Credit / Debit Card', Online: 'Online Transfer' };

export default function OrderSuccessScreen({ route, navigation }) {
  const { payment, delivery, items = [], amount, method, address } = route.params || {};

  // ── Animations ──────────────────────────────────────────────────────────────
  const scale    = useRef(new Animated.Value(0)).current;
  const opacity  = useRef(new Animated.Value(0)).current;
  const slideUp  = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Circle pop-in
    Animated.spring(scale, {
      toValue: 1,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Content fade + slide
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0,  duration: 500, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const orderId = payment?._id?.slice(-8).toUpperCase() || '—';

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Animated checkmark ── */}
        <View style={s.heroWrap}>
          <Animated.View style={[s.successCircle, { transform: [{ scale }] }]}>
            <MaterialIcons name="check" size={56} color="#fff" />
          </Animated.View>
          <Animated.Text style={[s.heroTitle, { opacity, transform: [{ translateY: slideUp }] }]}>
            Order Placed! 🎉
          </Animated.Text>
          <Animated.Text style={[s.heroSub, { opacity, transform: [{ translateY: slideUp }] }]}>
            Your food is being prepared and will be delivered soon
          </Animated.Text>
        </View>

        <Animated.View style={{ opacity, transform: [{ translateY: slideUp }] }}>

          {/* ── Order ID badge ── */}
          <View style={s.orderIdCard}>
            <Text style={s.orderIdLabel}>Order ID</Text>
            <Text style={s.orderIdValue}>#{orderId}</Text>
          </View>

          {/* ── Items summary ── */}
          {items.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>🍽  Your Order</Text>
              {items.map((item, i) => (
                <View key={i} style={s.itemRow}>
                  <Text style={s.itemQty}>{item.qty}×</Text>
                  <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={s.itemTotal}>Rs. {(item.price * item.qty).toFixed(2)}</Text>
                </View>
              ))}
              <View style={s.divider} />
              <View style={s.itemRow}>
                <Text style={[s.itemName, { fontWeight: '800' }]}>Total Paid</Text>
                <Text style={[s.itemTotal, { color: C.primary, fontWeight: '900', fontSize: 16 }]}>
                  Rs. {Number(amount).toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          {/* ── Delivery info ── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>🚚  Delivery Info</Text>

            <InfoRow icon="location-on" label="Address" value={address || delivery?.address || '—'} />
            <InfoRow icon="phone" label="Phone" value={delivery?.phone || '—'} />
            <InfoRow
              icon={METHOD_ICONS[method] || 'payments'}
              label="Payment"
              value={METHOD_LABELS[method] || method || '—'}
            />
            <InfoRow icon="schedule" label="Status" value="Pending — We're on it!" color={C.primary} />
          </View>

          {/* ── Delivery status note ── */}
          <View style={s.noteCard}>
            <MaterialIcons name="info-outline" size={18} color="#2563EB" style={{ marginRight: 8 }} />
            <Text style={s.noteText}>
              You can track your delivery status in the <Text style={{ fontWeight: '800' }}>Delivery</Text> tab below.
            </Text>
          </View>

          {/* ── CTA buttons ── */}
          <TouchableOpacity
            style={s.primaryBtn}
            activeOpacity={0.85}
            onPress={() => {
              // Pop back to root tab and switch to Delivery tab
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            }}
          >
            <MaterialIcons name="local-shipping" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={s.primaryBtnText}>Track My Delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.secondaryBtn}
            activeOpacity={0.85}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            }}
          >
            <Text style={s.secondaryBtnText}>Back to Menu</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Info row helper ──────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, color }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoIconWrap}>
        <MaterialIcons name={icon} size={18} color={C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={[s.infoValue, color && { color }]}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 24, paddingBottom: 48 },

  // Hero
  heroWrap: { alignItems: 'center', paddingVertical: 32 },
  successCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: C.success,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowColor: C.success,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  heroTitle: { fontSize: 28, fontWeight: '900', color: C.textDark, marginBottom: 8, textAlign: 'center' },
  heroSub:   { fontSize: 15, color: C.textMuted, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },

  // Order ID badge
  orderIdCard: {
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderIdLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  orderIdValue: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 1 },

  // Cards
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: C.textDark, marginBottom: 14 },

  itemRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemQty:   { fontSize: 14, fontWeight: '700', color: C.primary, width: 28 },
  itemName:  { flex: 1, fontSize: 14, color: C.textDark, fontWeight: '500' },
  itemTotal: { fontSize: 14, fontWeight: '700', color: C.textDark },
  divider:   { height: 1, backgroundColor: C.border, marginVertical: 10 },

  // Info rows
  infoRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  infoIconWrap:{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#FFF2EE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoLabel:   { fontSize: 11, color: C.textMuted, fontWeight: '600', marginBottom: 2 },
  infoValue:   { fontSize: 14, color: C.textDark, fontWeight: '600', lineHeight: 20 },

  // Note
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },
  noteText: { flex: 1, fontSize: 13, color: '#1E40AF', lineHeight: 18 },

  // Buttons
  primaryBtn: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  secondaryBtn: {
    borderWidth: 2,
    borderColor: C.border,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryBtnText: { color: C.textDark, fontSize: 15, fontWeight: '700' },
});
