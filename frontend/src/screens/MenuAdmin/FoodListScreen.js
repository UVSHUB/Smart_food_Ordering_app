// Author: pamindi024 - Food Menu Management Module
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image,
  TouchableOpacity, ActivityIndicator, Alert,
  StatusBar, SafeAreaView, RefreshControl,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const BASE_URL = 'http://192.168.8.169:5001/api/foods';

// ── Premium Brown & White Palette ──────────────────────
const C = {
  espresso:    '#3B1F1A',   // deepest brown - headers
  mocha:       '#4A2C2A',   // dark brown - accents
  walnut:      '#6B4226',   // rich walnut
  caramel:     '#A0673C',   // warm caramel
  latte:       '#C49A6C',   // latte highlight
  cream:       '#FFF8F0',   // warm off-white background
  milk:        '#FFFFFF',   // pure white cards
  fog:         '#F5EDE4',   // subtle divider / badge bg
  textDark:    '#2D1810',   // near-black for titles
  textMuted:   '#8C7B6F',   // muted brown-grey
  danger:      '#C0392B',   // delete red (kept for semantics)
  dangerBg:    '#FDEDEB',
  successBg:   '#E8F5E9',
  success:     '#2E7D32',
};

const CATEGORY_EMOJI = {
  Meals: '🍛',
  Drinks: '☕',
  Snacks: '🥨',
  Desserts: '🍰',
  Other: '🍽️',
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
      setError('Could not connect to server.\nCheck your IP and backend.');
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

  // ── Card Renderer ─────────────────────────────────────
  const renderItem = ({ item }) => (
    <View style={s.card}>
      {/* Image */}
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
        {/* Gradient-style overlay at bottom of image */}
        <View style={s.imageOverlay} />

        {/* Category pill */}
        <View style={s.categoryPill}>
          <Text style={s.categoryEmoji}>
            {CATEGORY_EMOJI[item.category] || '🍽️'}
          </Text>
          <Text style={s.categoryLabel}>{item.category || 'General'}</Text>
        </View>

        {/* Availability badge */}
        <View style={[s.availBadge, !item.isAvailable && s.unavailBadge]}>
          <View style={[s.availDot, !item.isAvailable && s.unavailDot]} />
          <Text style={[s.availText, !item.isAvailable && s.unavailText]}>
            {item.isAvailable !== false ? 'Available' : 'Sold Out'}
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={s.cardBody}>
        <View style={s.titleRow}>
          <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
          <View style={s.priceTag}>
            <Text style={s.priceSign}>$</Text>
            <Text style={s.priceValue}>{(item.price || 0).toFixed(2)}</Text>
          </View>
        </View>

        <Text style={s.itemDesc} numberOfLines={2}>
          {item.description || 'No description available.'}
        </Text>

        {/* Divider */}
        <View style={s.divider} />

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity
            style={s.editBtn}
            onPress={() => navigation.navigate('EditFood', { food: item })}
            activeOpacity={0.7}
          >
            <Text style={s.editIcon}>✏️</Text>
            <Text style={s.editText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.deleteBtn}
            onPress={() => handleDelete(item._id, item.name)}
            activeOpacity={0.7}
          >
            <Text style={s.deleteIcon}>🗑️</Text>
            <Text style={s.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ── Loading State ─────────────────────────────────────
  if (loading) {
    return (
      <View style={s.centered}>
        <View style={s.loadingCard}>
          <ActivityIndicator size="large" color={C.caramel} />
          <Text style={s.loadingText}>Loading Menu...</Text>
        </View>
      </View>
    );
  }

  // ── Main Screen ───────────────────────────────────────
  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.mocha} />

      {/* Error Banner */}
      {error ? (
        <View style={s.errorBanner}>
          <Text style={s.errorEmoji}>⚠️</Text>
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
            colors={[C.caramel]}
            tintColor={C.caramel}
            progressBackgroundColor={C.cream}
          />
        }
        ListHeaderComponent={
          <View style={s.listHeaderWrap}>
            <Text style={s.listHeaderTitle}>Your Menu</Text>
            <View style={s.countBadge}>
              <Text style={s.countText}>
                {foods.length} {foods.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <View style={s.emptyIconCircle}>
              <Text style={s.emptyIcon}>🍽️</Text>
            </View>
            <Text style={s.emptyTitle}>Your Menu is Empty</Text>
            <Text style={s.emptySubtitle}>
              Tap the + button below to add your first delicious item!
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('AddFood')}
        activeOpacity={0.85}
      >
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.cream,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.cream,
  },

  // Loading
  loadingCard: {
    backgroundColor: C.milk,
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 50,
    alignItems: 'center',
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  loadingText: {
    marginTop: 14,
    color: C.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.dangerBg,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F5C6C2',
  },
  errorEmoji: { fontSize: 22, marginRight: 10 },
  errorContent: { flex: 1 },
  errorTitle: { fontSize: 14, fontWeight: '700', color: C.danger, marginBottom: 2 },
  errorMsg: { fontSize: 12, color: '#9B3B30', lineHeight: 17 },
  retryBtn: {
    backgroundColor: C.danger,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 12 },

  // List
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 6,
  },
  listHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
    paddingHorizontal: 2,
  },
  listHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.textDark,
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: C.fog,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.caramel,
  },

  // Card
  card: {
    backgroundColor: C.milk,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 5,
  },

  // Image area
  imageWrap: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 190,
    backgroundColor: C.fog,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(59,31,26,0.15)',
  },

  // Category pill
  categoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,248,240,0.92)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  categoryEmoji: { fontSize: 13, marginRight: 5 },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.walnut,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  // Availability badge
  availBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232,245,233,0.92)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  unavailBadge: {
    backgroundColor: 'rgba(253,237,235,0.92)',
  },
  availDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.success,
    marginRight: 5,
  },
  unavailDot: {
    backgroundColor: C.danger,
  },
  availText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.success,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  unavailText: {
    color: C.danger,
  },

  // Card body
  cardBody: { padding: 16 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textDark,
    flex: 1,
    marginRight: 10,
    letterSpacing: -0.2,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.fog,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  priceSign: {
    fontSize: 12,
    fontWeight: '700',
    color: C.caramel,
    marginTop: 2,
    marginRight: 1,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: C.walnut,
  },
  itemDesc: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 20,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: C.fog,
    marginBottom: 14,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.fog,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8DDD3',
  },
  editIcon: { fontSize: 13, marginRight: 6 },
  editText: {
    color: C.walnut,
    fontWeight: '600',
    fontSize: 13,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.dangerBg,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F5C6C2',
  },
  deleteIcon: { fontSize: 13, marginRight: 6 },
  deleteText: {
    color: C.danger,
    fontWeight: '600',
    fontSize: 13,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    marginTop: 70,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.fog,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: { fontSize: 44 },
  emptyTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 21,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 22,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.walnut,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 10,
  },
  fabIcon: {
    fontSize: 34,
    color: C.cream,
    fontWeight: '300',
    lineHeight: 38,
  },
});

export default FoodListScreen;
