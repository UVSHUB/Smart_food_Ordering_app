import React, { useContext, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, StatusBar, Animated, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  primary:   '#FA4A0C',
  bg:        '#F9F9FB',
  surface:   '#FFFFFF',
  textDark:  '#1A1A1A',
  textMuted: '#9A9A9D',
  border:    '#F0F0F0',
};

const STATUS_META = {
  Pending:            { bg: '#FFF3E0', text: '#E65100', dot: '#FF9800',  icon: 'hourglass-empty',  desc: 'Your order has been received.'         },
  Preparing:          { bg: '#E3F2FD', text: '#0D47A1', dot: '#2196F3',  icon: 'restaurant',       desc: 'Our kitchen is preparing your food.'   },
  'Out for Delivery': { bg: '#F3E5F5', text: '#6A1B9A', dot: '#9C27B0',  icon: 'delivery-dining',  desc: 'Your order is on the way!'             },
  Delivered:          { bg: '#E8F5E9', text: '#1B5E20', dot: '#4CAF50',  icon: 'check-circle',     desc: 'Delivered! Enjoy your meal. 🎉'        },
};

const STEPS = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];

// ── Animated step-progress tracker ────────────────────────────────────────────
function ProgressTracker({ currentStatus }) {
  const currentIndex = STEPS.indexOf(currentStatus);

  return (
    <View style={pt.container}>
      {STEPS.map((step, idx) => {
        const done    = idx <= currentIndex;
        const active  = idx === currentIndex;
        const meta    = STATUS_META[step];

        return (
          <View key={step} style={pt.stepRow}>
            {/* Line above (except first) */}
            {idx > 0 && (
              <View style={[pt.vertLine, done && { backgroundColor: meta.dot }]} />
            )}

            <View style={pt.stepContent}>
              {/* Icon circle */}
              <View style={[
                pt.iconCircle,
                done  && { backgroundColor: meta.dot, borderColor: meta.dot },
                active && { shadowColor: meta.dot, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },
              ]}>
                <MaterialIcons
                  name={meta.icon}
                  size={18}
                  color={done ? '#fff' : C.textMuted}
                />
              </View>

              {/* Label */}
              <View style={pt.labelWrap}>
                <Text style={[pt.stepLabel, done && { color: C.textDark, fontWeight: '800' }]}>
                  {step}
                </Text>
                {active && (
                  <Text style={[pt.stepDesc, { color: meta.text }]}>{meta.desc}</Text>
                )}
              </View>

              {/* Active pulse ring */}
              {active && (
                <View style={[pt.activeBadge, { backgroundColor: meta.bg }]}>
                  <Text style={[pt.activeBadgeText, { color: meta.text }]}>Now</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function DeliveryDetailScreen({ route, navigation }) {
  const { user } = useContext(AuthContext);
  const { delivery } = route.params;

  const meta   = STATUS_META[delivery.status] || STATUS_META.Pending;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0,  duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const date = new Date(delivery.createdAt).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
  const time = new Date(delivery.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={meta.dot} />

      {/* ── Coloured header banner ── */}
      <View style={[s.heroBanner, { backgroundColor: meta.dot }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={s.heroCenter}>
          <View style={s.heroIconRing}>
            <MaterialIcons name={meta.icon} size={36} color={meta.dot} />
          </View>
          <Text style={s.heroStatus}>{delivery.status}</Text>
          <Text style={s.heroDesc}>{meta.desc}</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <Animated.ScrollView
        style={{ opacity: fadeIn, transform: [{ translateY: slideY }] }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Order ID chip ── */}
        <View style={s.orderChip}>
          <MaterialIcons name="receipt" size={16} color={C.primary} />
          <Text style={s.orderChipText}>Order #{delivery.order_id?.slice(-8).toUpperCase()}</Text>
          <View style={[s.statusDot, { backgroundColor: meta.dot }]} />
        </View>

        {/* ── Progress tracker ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📍 Delivery Progress</Text>
          <ProgressTracker currentStatus={delivery.status} />
        </View>

        {/* ── Delivery details ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📦 Delivery Details</Text>

          <InfoRow icon="location-on"  label="Delivery Address" value={delivery.address} />
          <InfoRow icon="phone"         label="Phone Number"     value={delivery.phone} />
          <InfoRow icon="event"         label="Order Date"       value={date} />
          <InfoRow icon="access-time"   label="Order Time"       value={time} />
        </View>

        {/* ── Admin: Update button — users see read-only view only ── */}
        {user?.isAdmin ? (
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: meta.dot }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('UpdateDelivery', { delivery })}
          >
            <MaterialIcons name="edit" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={s.actionBtnText}>Update Delivery Status</Text>
          </TouchableOpacity>
        ) : (
          <View style={[s.infoNote, { backgroundColor: meta.bg, borderLeftColor: meta.dot }]}>
            <MaterialIcons name="info-outline" size={18} color={meta.dot} style={{ marginRight: 10 }} />
            <Text style={[s.infoNoteText, { color: meta.text }]}>
              {delivery.status === 'Delivered'
                ? 'Your order has been delivered. Thank you for ordering!'
                : 'Your order is being processed. You will be notified when it moves to the next stage.'}
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoIconBox}>
        <MaterialIcons name={icon} size={18} color={C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },

  heroBanner: {
    paddingTop: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 24) + 10,
    paddingBottom: 32,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  backBtn:     { width: 40, paddingTop: 4 },
  heroCenter:  { flex: 1, alignItems: 'center' },
  heroIconRing:{
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 6,
  },
  heroStatus: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 4 },
  heroDesc:   { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 18 },

  orderChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 30,
    paddingHorizontal: 16, paddingVertical: 10,
    marginBottom: 16,
    alignSelf: 'flex-start',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    gap: 8,
  },
  orderChipText: { fontSize: 14, fontWeight: '800', color: C.textDark },
  statusDot:     { width: 8, height: 8, borderRadius: 4 },

  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: C.textDark, marginBottom: 18 },

  infoRow:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  infoIconBox:{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF2EE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoLabel:  { fontSize: 11, color: C.textMuted, fontWeight: '600', marginBottom: 3 },
  infoValue:  { fontSize: 14, color: C.textDark, fontWeight: '600', lineHeight: 20 },

  actionBtn: {
    borderRadius: 16, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  infoNote: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: 14, padding: 14,
    borderLeftWidth: 4,
  },
  infoNoteText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 20 },
});

// ── Progress tracker styles ────────────────────────────────────────────────────
const pt = StyleSheet.create({
  container: { paddingLeft: 8 },

  stepRow:     { alignItems: 'flex-start', marginBottom: 4 },
  vertLine:    { width: 2, height: 20, backgroundColor: C.border, marginLeft: 18, marginBottom: 4 },
  stepContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },

  iconCircle: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 2, borderColor: C.border,
    backgroundColor: C.bg,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },

  labelWrap:  { flex: 1 },
  stepLabel:  { fontSize: 14, fontWeight: '600', color: C.textMuted },
  stepDesc:   { fontSize: 12, fontWeight: '600', marginTop: 2, lineHeight: 16 },

  activeBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  activeBadgeText: { fontSize: 11, fontWeight: '800' },
});
