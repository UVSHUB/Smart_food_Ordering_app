import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const STATUS_COLORS = {
  Pending:            { bg: '#FFF3E0', text: '#E65100', dot: '#FF9800' },
  Preparing:          { bg: '#E3F2FD', text: '#0D47A1', dot: '#2196F3' },
  'Out for Delivery': { bg: '#F3E5F5', text: '#6A1B9A', dot: '#9C27B0' },
  Delivered:          { bg: '#E8F5E9', text: '#1B5E20', dot: '#4CAF50' },
};

const C = {
  primary:   '#FA4A0C',
  bg:        '#F9F9FB',
  surface:   '#FFFFFF',
  textDark:  '#1A1A1A',
  textMuted: '#9A9A9D',
  border:    '#E8E8E8',
};

// ── Status progress bar ───────────────────────────────────────────────────────
const STEPS = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];

function StatusProgress({ currentStatus }) {
  const currentIndex = STEPS.indexOf(currentStatus);
  return (
    <View style={progress.wrap}>
      {STEPS.map((step, idx) => {
        const done    = idx <= currentIndex;
        const colors  = STATUS_COLORS[step];
        return (
          <View key={step} style={progress.stepWrap}>
            <View style={[progress.circle, done && { backgroundColor: colors.dot }]}>
              {done && <Text style={progress.checkmark}>✓</Text>}
            </View>
            <Text style={[progress.label, done && { color: colors.text, fontWeight: '700' }]}>{step}</Text>
            {idx < STEPS.length - 1 && (
              <View style={[progress.line, idx < currentIndex && { backgroundColor: '#4CAF50' }]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function DeliveryDetailScreen({ route, navigation }) {
  const { delivery } = route.params;
  const colors = STATUS_COLORS[delivery.status] || STATUS_COLORS.Pending;

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Delivery Details</Text>

        {/* Status badge */}
        <View style={[styles.statusCard, { backgroundColor: colors.bg }]}>
          <View style={[styles.dot, { backgroundColor: colors.dot }]} />
          <Text style={[styles.statusText, { color: colors.text }]}>{delivery.status}</Text>
        </View>

        {/* Progress tracker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Progress</Text>
          <StatusProgress currentStatus={delivery.status} />
        </View>

        {/* Details card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Info</Text>
          <InfoRow icon="📦" label="Order ID"   value={`#${delivery.order_id}`} />
          <InfoRow icon="📍" label="Address"    value={delivery.address} />
          <InfoRow icon="📞" label="Phone"      value={delivery.phone} />
          <InfoRow icon="🕐" label="Created At" value={new Date(delivery.createdAt).toLocaleString()} />
        </View>

        {/* Update button */}
        <TouchableOpacity
          style={styles.updateBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('UpdateDelivery', { delivery })}
        >
          <Text style={styles.updateBtnText}>✏️  Update Delivery</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },

  backBtn:  { marginBottom: 16 },
  backText: { fontSize: 16, color: C.primary, fontWeight: '600' },

  title: { fontSize: 26, fontWeight: '800', color: C.textDark, marginBottom: 16 },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginBottom: 24,
  },
  dot:        { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusText: { fontSize: 15, fontWeight: '800' },

  section:      { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.textDark, marginBottom: 14 },

  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  infoRow:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  infoIcon:  { fontSize: 20, marginRight: 12, marginTop: 2 },
  infoText:  { flex: 1 },
  infoLabel: { fontSize: 12, color: C.textMuted, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 15, color: C.textDark, fontWeight: '600', lineHeight: 22 },

  updateBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  updateBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

// ── Progress styles ────────────────────────────────────────────────────────────
const progress = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepWrap: { flex: 1, alignItems: 'center', position: 'relative' },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  label: { fontSize: 10, color: C.textMuted, textAlign: 'center', lineHeight: 13 },
  line: {
    position: 'absolute',
    top: 14,
    left: '60%',
    right: '-60%',
    height: 2,
    backgroundColor: C.border,
  },
});
