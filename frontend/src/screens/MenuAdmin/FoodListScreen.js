// Author: IT24101033 - Professional UI Redesign
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image,
  TouchableOpacity, ActivityIndicator, Alert,
  StatusBar, SafeAreaView, RefreshControl,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const BASE_URL = 'http://192.168.8.169:5001/api/foods';

// ── Ultra Premium Modern Palette ──────────────────────
const C = {
  primary:     '#FA4A0C', // Vibrant Orange
  bg:          '#F9F9FB', // Very light cool gray background
  surface:     '#FFFFFF', // Cards & Elements
  textDark:    '#1A1A1A', // Deep black for crisp text
  textMuted:   '#9A9A9D', // Subtle gray
  danger:      '#FF4B4B',
  dangerBg:    '#FFF0F0',
  success:     '#2E7D32',
  successBg:   '#E8F5E9',
  border:      '#F0F0F0',
};

const CATEGORY_ICON = {
  Meals: 'restaurant',
  Drinks: 'local-cafe',
  Snacks: 'fastfood',
  Desserts: 'cake',
  Other: 'room-service',
};

const FoodListScreen = ({ navigation }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchFoods = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const response = await axios.get(BASE_URL);
      setFoods(response.data);
    } catch (err) {
      console.log('Error fetching foods:', err);
      setError('Could not connect to server.\\Check your IP and backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFoods();
    }, [])
  );

  const handleDelete = (id, name) => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to delete "${name}" from the menu?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/${id}`);
              fetchFoods();
            } catch {
              Alert.alert('Error', 'Failed to delete item.');
            }
          },
        },
      ]
    );
  };

  // ── Modern Floating Card Renderer ─────────────────────────────────────
  const renderItem = ({ item }) => (
    <View style={s.cardWrapper}>
      <View style={s.card}>
        {/* Image Area */}
        <View style={s.imageWrap}>
          <Image
            source={{
              uri: item.image
                ? item.image.startsWith('http')
                  ? item.image
                  : `http://192.168.8.169:5001${item.image}`
                : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            }}
            style={s.cardImage}
          />
          {/* Availability Badge Overlay */}
          <View style={[s.availBadge, !item.isAvailable && s.unavailBadge]}>
            <View style={[s.availDot, !item.isAvailable && s.unavailDot]} />
            <Text style={[s.availText, !item.isAvailable && s.unavailText]}>
              {item.isAvailable !== false ? 'Available' : 'Sold Out'}
            </Text>
          </View>
        </View>

        {/* Content Body */}
        <View style={s.cardBody}>
          <View style={s.titleRow}>
            <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={s.priceValue}>Rs. {(item.price || 0).toFixed(2)}</Text>
          </View>

          <View style={s.categoryRow}>
            <MaterialIcons 
              name={CATEGORY_ICON[item.category] || 'room-service'} 
              size={13} 
              color={C.textMuted} 
            />
            <Text style={s.categoryLabel}>{item.category || 'General'}</Text>
          </View>

          <Text style={s.itemDesc} numberOfLines={2}>
            {item.description || 'No description available.'}
          </Text>

          {/* Action Row */}
          <View style={s.actions}>
            <TouchableOpacity
              style={s.iconBtn}
              onPress={() => navigation.navigate('EditFood', { food: item })}
              activeOpacity={0.7}
            >
              <MaterialIcons name="edit" size={20} color={C.textDark} />
            </TouchableOpacity>

            <TouchableOpacity
              style={s.iconBtnAlert}
              onPress={() => handleDelete(item._id, item.name)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="delete-outline" size={20} color={C.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  // ── Loading State ─────────────────────────────────────
  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  // ── Main Layout ───────────────────────────────────────
  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Menu Items</Text>
          <Text style={s.headerSubtitle}>{foods.length} items total</Text>
        </View>
        <TouchableOpacity style={s.actionAddBtn} onPress={() => navigation.navigate('AddFood')} activeOpacity={0.8}>
          <MaterialIcons name="add" size={22} color={C.surface} />
          <Text style={s.actionAddText}>Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Error Banner */}
      {error ? (
        <View style={s.errorBanner}>
          <MaterialIcons name="error-outline" size={24} color={C.danger} style={{ marginRight: 10 }} />
          <View style={s.errorContent}>
            <Text style={s.errorTitle}>Connection Error</Text>
            <Text style={s.errorMsg}>{error}</Text>
          </View>
          <TouchableOpacity style={s.retryBtn} onPress={() => fetchFoods()}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={foods}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchFoods(true)}
            colors={[C.primary]}
            tintColor={C.primary}
          />
        }
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <View style={s.emptyIconBox}>
              <MaterialIcons name="restaurant-menu" size={48} color={C.primary} />
            </View>
            <Text style={s.emptyTitle}>Nothing here yet</Text>
            <Text style={s.emptySubtitle}>Start building your awesome menu by adding food items.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: C.bg,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: C.textDark, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: C.textMuted, marginTop: 4 },
  actionAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionAddText: { color: C.surface, fontWeight: '700', fontSize: 13, marginLeft: 4 },

  // List
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  
  // Modern Card
  cardWrapper: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageWrap: { position: 'relative' },
  cardImage: { width: '100%', height: 180, backgroundColor: C.border },
  availBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 30,
  },
  unavailBadge: { backgroundColor: 'rgba(255,240,240,0.95)' },
  availDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.success, marginRight: 6 },
  unavailDot: { backgroundColor: C.danger },
  availText: { fontSize: 11, fontWeight: '700', color: C.success, textTransform: 'uppercase' },
  unavailText: { color: C.danger },

  cardBody: { padding: 18 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  itemName: { fontSize: 18, fontWeight: '700', color: C.textDark, flex: 1, marginRight: 10 },
  priceValue: { fontSize: 18, fontWeight: '800', color: C.primary },
  
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: C.textMuted, marginLeft: 4, textTransform: 'uppercase' },
  itemDesc: { fontSize: 14, color: C.textMuted, lineHeight: 20, marginBottom: 16 },

  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 14 },
  iconBtn: { padding: 8, backgroundColor: '#F5F5F5', borderRadius: 12, marginLeft: 12 },
  iconBtnAlert: { padding: 8, backgroundColor: C.dangerBg, borderRadius: 12, marginLeft: 12 },

  // Error & Empty
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.dangerBg, padding: 16, marginHorizontal: 20, borderRadius: 16, marginBottom: 20 },
  errorContent: { flex: 1 },
  errorTitle: { fontSize: 14, fontWeight: '700', color: C.danger, marginBottom: 2 },
  errorMsg: { fontSize: 12, color: C.danger },
  retryBtn: { padding: 8 },
  retryText: { color: C.danger, fontWeight: '700', fontSize: 13 },
  
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 30 },
  emptyIconBox: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFEBE5', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.textDark, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 22 },
});

export default FoodListScreen;
