import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, RefreshControl, SafeAreaView, StatusBar,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { BASE_URL } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const STATUS_COLORS = {
  Pending:            { bg: '#FFF3E0', text: '#E65100', dot: '#FF9800'  },
  Preparing:          { bg: '#E3F2FD', text: '#0D47A1', dot: '#2196F3'  },
  'Out for Delivery': { bg: '#F3E5F5', text: '#6A1B9A', dot: '#9C27B0'  },
  Delivered:          { bg: '#E8F5E9', text: '#1B5E20', dot: '#4CAF50'  },
};

const STATUS_ICONS = {
  Pending:            'hourglass-empty',
  Preparing:          'restaurant',
  'Out for Delivery': 'delivery-dining',
  Delivered:          'check-circle',
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
  const [deliveries, setDeliveries]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

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

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchDeliveries);
    return unsub;
  }, [navigation, fetchDeliveries]);

  const handleDelete = (id) => {
    Alert.alert('Delete Delivery', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
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
    const icon   = STATUS_ICONS[item.status]  || 'local-shipping';
    const date   = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <TouchableOpacity
        style={s.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('DeliveryDetail', { delivery: item })}
      >
        {/* Icon + Status */}
        <View style={s.cardLeft}>
          <View style={[s.iconWrap, { backgroundColor: colors.bg }]}>
            <MaterialIcons name={icon} size={26} color={colors.dot} />
          </View>
        </View>

        {/* Main content */}
        <View style={s.cardBody}>
          <View style={s.cardTopRow}>
            <Text style={s.orderId} numberOfLines={1}>Order #{item.order_id?.slice(-8).toUpperCase()}</Text>
            <View style={[s.badge, { backgroundColor: colors.bg }]}>
              <View style={[s.dot, { backgroundColor: colors.dot }]} />
              <Text style={[s.badgeText, { color: colors.text }]}>{item.status}</Text>
            </View>
          </View>

          <View style={s.infoRow}>
            <MaterialIcons name="location-on" size={14} color={C.textMuted} />
            <Text style={s.infoText} numberOfLines={1}>{item.address}</Text>
          </View>
          <View style={s.infoRow}>
            <MaterialIcons name="phone" size={14} color={C.textMuted} />
            <Text style={s.infoText}>{item.phone}</Text>
          </View>
          <Text style={s.dateText}>{date}</Text>

          {/* Action buttons */}
          <View style={s.actionRow}>
            <TouchableOpacity
              style={[s.btn, s.btnPrimary]}
              onPress={() => navigation.navigate('DeliveryDetail', { delivery: item })}
            >
              <MaterialIcons name="visibility" size={14} color="#fff" />
              <Text style={s.btnText}>Track</Text>
            </TouchableOpacity>

            {user?.isAdmin && (
              <>
                <TouchableOpacity
                  style={[s.btn, s.btnSecondary]}
                  onPress={() => navigation.navigate('UpdateDelivery', { delivery: item })}
                >
                  <MaterialIcons name="edit" size={14} color={C.primary} />
                  <Text style={[s.btnText, { color: C.primary }]}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.btn, s.btnDanger]}
                  onPress={() => handleDelete(item._id)}
                >
                  <MaterialIcons name="delete-outline" size={14} color="#fff" />
                  <Text style={s.btnText}>Delete</Text>
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
          <Text style={s.headerTitle}>🚚 Deliveries</Text>
          <Text style={s.headerSub}>{user?.isAdmin ? 'All orders' : 'Your orders'}</Text>
        </View>
        {user?.isAdmin && (
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => navigation.navigate('CreateDelivery')}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={s.addBtnText}>New</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats strip (admin only) */}
      {user?.isAdmin && deliveries.length > 0 && (
        <View style={s.statsRow}>
          {['Pending', 'Preparing', 'Out for Delivery', 'Delivered'].map((status) => {
            const count  = deliveries.filter((d) => d.status === status).length;
            const colors = STATUS_COLORS[status];
            return (
              <View key={status} style={[s.statChip, { backgroundColor: colors.bg }]}>
                <Text style={[s.statCount, { color: colors.dot }]}>{count}</Text>
                <Text style={[s.statLabel, { color: colors.text }]} numberOfLines={1}>
                  {status === 'Out for Delivery' ? 'On Way' : status}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <FlatList
        data={deliveries}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={deliveries.length === 0 ? { flex: 1 } : s.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchDeliveries(); }}
            tintColor={C.primary}
          />
        }
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <MaterialIcons name="delivery-dining" size={80} color={C.border} />
            <Text style={s.emptyTitle}>No deliveries yet</Text>
            <Text style={s.emptySubtitle}>
              {user?.isAdmin
                ? 'Deliveries are created automatically when a customer places an order.'
                : 'Place an order from the Menu and your delivery will appear here.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  centered:{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.textDark },
  headerSub:   { fontSize: 13, color: C.textMuted, marginTop: 2 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.primary,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  statsRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.bg,
  },
  statChip: {
    flex: 1, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center',
  },
  statCount: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, fontWeight: '700', marginTop: 2, textAlign: 'center' },

  listContent: { padding: 16 },

  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardLeft: { marginRight: 14 },
  iconWrap:  { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardBody:  { flex: 1 },

  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId:    { fontSize: 14, fontWeight: '800', color: C.textDark, flex: 1, marginRight: 8 },
  badge:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  dot:        { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  badgeText:  { fontSize: 11, fontWeight: '700' },

  infoRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoText:  { fontSize: 13, color: C.textMuted, marginLeft: 4, flex: 1 },
  dateText:  { fontSize: 12, color: C.textMuted, marginTop: 4, marginBottom: 10 },

  actionRow: { flexDirection: 'row', gap: 8 },
  btn:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  btnPrimary:  { backgroundColor: C.primary },
  btnSecondary:{ backgroundColor: '#FFF2EE', borderWidth: 1, borderColor: C.primary },
  btnDanger:   { backgroundColor: '#FF3B30' },
  btnText:     { color: '#fff', fontWeight: '700', fontSize: 12 },

  emptyWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle:   { fontSize: 20, fontWeight: '800', color: C.textDark, marginTop: 16, marginBottom: 8 },
  emptySubtitle:{ fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 22 },
});
