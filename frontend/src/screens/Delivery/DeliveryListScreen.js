import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

// ── Status colour map ──────────────────────────────────────────────────────────
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

export default function DeliveryListScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Admins see all deliveries; regular users see only their own
  const fetchDeliveries = useCallback(async () => {
    try {
      const url = user?.isAdmin
        ? `${BASE_URL}/deliveries`
        : `${BASE_URL}/deliveries/user/${user?._id}`;

      const res = await axios.get(url);
      setDeliveries(res.data.data || []);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load deliveries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // Re-fetch when the screen is focused (after returning from Update/Create)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchDeliveries);
    return unsubscribe;
  }, [navigation, fetchDeliveries]);

  const handleDelete = (id) => {
    Alert.alert('Delete Delivery', 'Are you sure you want to delete this delivery?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/deliveries/${id}`);
            setDeliveries((prev) => prev.filter((d) => d._id !== id));
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Delete failed');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const colors = STATUS_COLORS[item.status] || STATUS_COLORS.Pending;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('DeliveryDetail', { delivery: item })}
      >
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={styles.orderIdWrap}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.orderId} numberOfLines={1}>
              #{item.order_id}
            </Text>
          </View>
          {/* Status badge */}
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <View style={[styles.dot, { backgroundColor: colors.dot }]} />
            <Text style={[styles.badgeText, { color: colors.text }]}>{item.status}</Text>
          </View>
        </View>

        {/* Address */}
        <View style={styles.row}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.addressText} numberOfLines={2}>{item.address}</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => navigation.navigate('UpdateDelivery', { delivery: item })}
          >
            <Text style={styles.btnTextLight}>Update</Text>
          </TouchableOpacity>
          {user?.isAdmin && (
            <TouchableOpacity
              style={[styles.btn, styles.btnDanger]}
              onPress={() => handleDelete(item._id)}
            >
              <Text style={styles.btnTextLight}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚚 Deliveries</Text>
        {user?.isAdmin && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('CreateDelivery')}
          >
            <Text style={styles.addBtnText}>+ New</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={deliveries}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={deliveries.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDeliveries(); }} tintColor={C.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No deliveries found</Text>
            <Text style={styles.emptySubtitle}>
              {user?.isAdmin ? 'Create one using the + New button above.' : 'Your deliveries will appear here.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.textDark },
  addBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  listContent: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1 },

  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderIdWrap: { flex: 1, marginRight: 8 },
  label: { fontSize: 11, color: C.textMuted, fontWeight: '600', marginBottom: 2 },
  orderId: { fontSize: 15, fontWeight: '700', color: C.textDark },

  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  icon: { fontSize: 14, marginRight: 6, marginTop: 1 },
  addressText: { flex: 1, fontSize: 14, color: C.textDark, lineHeight: 20 },

  actionRow: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  btnPrimary: { backgroundColor: C.primary },
  btnDanger: { backgroundColor: '#FF3B30' },
  btnTextLight: { color: '#fff', fontWeight: '700', fontSize: 13 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: C.textMuted, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },
});
