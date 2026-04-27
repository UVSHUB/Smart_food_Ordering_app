import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, RefreshControl, SafeAreaView,
  StatusBar, Platform,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { BASE_URL } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const STATUS = {
  Pending:            { bg: '#FFF8F0', text: '#C2410C', dot: '#F97316', icon: 'schedule'         },
  Preparing:          { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6', icon: 'restaurant'       },
  'Out for Delivery': { bg: '#FAF5FF', text: '#7E22CE', dot: '#A855F7', icon: 'delivery-dining'  },
  Delivered:          { bg: '#F0FDF4', text: '#15803D', dot: '#22C55E', icon: 'check-circle'     },
};

const C = {
  primary:   '#FA4A0C',
  bg:        '#F4F4F6',
  surface:   '#FFFFFF',
  textDark:  '#111827',
  textMid:   '#6B7280',
  textLight: '#9CA3AF',
  border:    '#E5E7EB',
  shadow:    '#000',
};

export default function DeliveryListScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeliveries = useCallback(async () => {
    try {
      const url = user?.isAdmin
        ? `${BASE_URL}/deliveries`
        : `${BASE_URL}/deliveries/user/${user?._id}`;
      const res = await axios.get(url);
      setDeliveries(res.data.data || []);
    } catch {
      Alert.alert('Error', 'Could not load deliveries. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchDeliveries);
    return unsub;
  }, [navigation, fetchDeliveries]);

  const handleDelete = (id) => {
    Alert.alert('Delete Delivery', 'This action cannot be undone. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/deliveries/${id}`);
            setDeliveries(prev => prev.filter(d => d._id !== id));
          } catch {
            Alert.alert('Error', 'Failed to delete delivery.');
          }
        },
      },
    ]);
  };

  // ── Stat row (admin only) ──────────────────────────────────────────────────
  const StatRow = () => {
    if (!user?.isAdmin || deliveries.length === 0) return null;
    return (
      <View style={s.statStrip}>
        {Object.entries(STATUS).map(([label, meta]) => (
          <View key={label} style={s.statItem}>
            <Text style={[s.statCount, { color: meta.dot }]}>
              {deliveries.filter(d => d.status === label).length}
            </Text>
            <Text style={s.statLabel} numberOfLines={1}>
              {label === 'Out for Delivery' ? 'On Way' : label}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // ── Card ──────────────────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const meta = STATUS[item.status] || STATUS.Pending;
    const date = new Date(item.createdAt).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={s.card}
        activeOpacity={0.92}
        onPress={() => navigation.navigate('DeliveryDetail', { delivery: item })}
      >
        {/* Left accent bar */}
        <View style={[s.cardAccent, { backgroundColor: meta.dot }]} />

        <View style={s.cardInner}>
          {/* Top row */}
          <View style={s.cardHead}>
            <View style={s.cardHeadLeft}>
              <Text style={s.cardOrderId}>
                #{item.order_id?.slice(-8).toUpperCase() || 'N/A'}
              </Text>
              <Text style={s.cardDate}>{date}</Text>
            </View>
            <View style={[s.statusPill, { backgroundColor: meta.bg }]}>
              <View style={[s.pillDot, { backgroundColor: meta.dot }]} />
              <Text style={[s.pillText, { color: meta.text }]}>{item.status}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={s.cardDivider} />

          {/* Info rows */}
          <View style={s.cardInfoRow}>
            <MaterialIcons name="location-on" size={14} color={C.textLight} />
            <Text style={s.cardInfoText} numberOfLines={1}>{item.address}</Text>
          </View>
          <View style={[s.cardInfoRow, { marginTop: 5 }]}>
            <MaterialIcons name="phone" size={14} color={C.textLight} />
            <Text style={s.cardInfoText}>{item.phone}</Text>
          </View>

          {/* Action buttons */}
          <View style={s.cardActions}>
            <TouchableOpacity
              style={s.actionPrimary}
              onPress={() => navigation.navigate('DeliveryDetail', { delivery: item })}
            >
              <MaterialIcons name="visibility" size={14} color="#fff" />
              <Text style={s.actionPrimaryText}>Track</Text>
            </TouchableOpacity>

            {user?.isAdmin && (
              <>
                <TouchableOpacity
                  style={s.actionOutline}
                  onPress={() => navigation.navigate('UpdateDelivery', { delivery: item })}
                >
                  <MaterialIcons name="edit" size={14} color={C.primary} />
                  <Text style={s.actionOutlineText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.actionDanger}
                  onPress={() => handleDelete(item._id)}
                >
                  <MaterialIcons name="delete-outline" size={14} color="#fff" />
                  <Text style={s.actionPrimaryText}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Deliveries</Text>
          <Text style={s.headerSub}>
            {user?.isAdmin ? `${deliveries.length} total records` : 'Your active orders'}
          </Text>
        </View>
        {user?.isAdmin && (
          <TouchableOpacity
            style={s.newBtn}
            onPress={() => navigation.navigate('CreateDelivery')}
          >
            <MaterialIcons name="add" size={18} color="#fff" />
            <Text style={s.newBtnText}>New</Text>
          </TouchableOpacity>
        )}
      </View>

      <StatRow />

      <FlatList
        data={deliveries}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={
          deliveries.length === 0 ? s.emptyContainer : s.list
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchDeliveries(); }}
            tintColor={C.primary}
          />
        }
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <View style={s.emptyIconBox}>
              <MaterialIcons name="local-shipping" size={40} color={C.textLight} />
            </View>
            <Text style={s.emptyTitle}>No deliveries found</Text>
            <Text style={s.emptySub}>
              {user?.isAdmin
                ? 'Deliveries are created automatically when customers place orders.'
                : 'Place an order and your delivery will appear here.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  centered:{ flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.textDark, letterSpacing: -0.4 },
  headerSub:   { fontSize: 13, color: C.textMid, marginTop: 2 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.primary,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 22,
  },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Stats
  statStrip: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 12,
  },
  statItem:  { flex: 1, alignItems: 'center' },
  statCount: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 10, color: C.textMid, fontWeight: '600', textAlign: 'center' },

  list:          { padding: 16, gap: 12 },
  emptyContainer:{ flex: 1 },

  // Card
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardAccent: { width: 4 },
  cardInner:  { flex: 1, padding: 16 },

  cardHead:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeadLeft: { flex: 1, marginRight: 12 },
  cardOrderId:  { fontSize: 15, fontWeight: '800', color: C.textDark, letterSpacing: 0.3 },
  cardDate:     { fontSize: 12, color: C.textLight, marginTop: 2 },

  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
  pillDot:    { width: 6, height: 6, borderRadius: 3 },
  pillText:   { fontSize: 11, fontWeight: '700' },

  cardDivider: { height: 1, backgroundColor: C.border, marginVertical: 12 },

  cardInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardInfoText:{ flex: 1, fontSize: 13, color: C.textMid, lineHeight: 18 },

  cardActions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.primary,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 8,
  },
  actionOutline: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: C.primary,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 8,
  },
  actionDanger: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 8,
  },
  actionPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  actionOutlineText: { color: C.primary, fontWeight: '700', fontSize: 12 },

  // Empty
  emptyWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: C.border, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle:   { fontSize: 18, fontWeight: '800', color: C.textDark, marginBottom: 8 },
  emptySub:     { fontSize: 14, color: C.textMid, textAlign: 'center', lineHeight: 22 },
});
