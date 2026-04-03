import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image,
  TouchableOpacity, ActivityIndicator,
  StatusBar, SafeAreaView, RefreshControl,
  TextInput, ScrollView, Dimensions, Platform,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const BASE_URL = 'http://192.168.8.169:5001/api/foods';
const { width } = Dimensions.get('window');

// ── Premium Brown & White Palette ──────────────────────
const C = {
  espresso:    '#3B1F1A',
  mocha:       '#4A2C2A',
  walnut:      '#6B4226',
  caramel:     '#A0673C',
  latte:       '#C49A6C',
  cream:       '#FFF8F0',
  milk:        '#FFFFFF',
  fog:         '#F5EDE4',
  textDark:    '#2D1810',
  textMuted:   '#8C7B6F',
  star:        '#E5A100',
};

const CATEGORIES = ['All', 'Meals', 'Drinks', 'Snacks', 'Desserts'];
const CATEGORY_EMOJI = {
  All:      '🍽️',
  Meals:    '🍛',
  Drinks:   '☕',
  Snacks:   '🥨',
  Desserts: '🍰',
};

const UserMenuScreen = ({ navigation }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchFoods = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const response = await axios.get(BASE_URL);
      setFoods(response.data);
    } catch (err) {
      console.log('Error fetching menu:', err);
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

  // Filter logic
  const filtered = foods.filter((item) => {
    const matchesCategory =
      activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());
    const isAvailable = item.isAvailable !== false;
    return matchesCategory && matchesSearch && isAvailable;
  });

  // ── Featured / Hero item (first item) ────────────────
  const renderHero = () => {
    if (filtered.length === 0) return null;
    const hero = filtered[0];
    return (
      <TouchableOpacity
        style={s.heroCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('FoodDetail', { food: hero })}
      >
        <Image
          source={{
            uri: hero.image
              ? hero.image.startsWith('http')
                ? hero.image
                : `http://192.168.8.169:5001${hero.image}`
              : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
          }}
          style={s.heroImage}
        />
        <View style={s.heroOverlay} />
        <View style={s.heroBadge}>
          <Text style={s.heroBadgeText}>⭐  Featured</Text>
        </View>
        <View style={s.heroContent}>
          <Text style={s.heroCategory}>
            {CATEGORY_EMOJI[hero.category] || '🍽️'} {hero.category}
          </Text>
          <Text style={s.heroName}>{hero.name}</Text>
          <View style={s.heroPriceRow}>
            <Text style={s.heroPrice}>${(hero.price || 0).toFixed(2)}</Text>
            <View style={s.heroViewBtn}>
              <Text style={s.heroViewText}>View →</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Grid Item ────────────────────────────────────────
  const renderGridItem = ({ item }) => (
    <TouchableOpacity
      style={s.gridCard}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('FoodDetail', { food: item })}
    >
      <Image
        source={{
          uri: item.image
            ? item.image.startsWith('http')
              ? item.image
              : `http://192.168.8.169:5001${item.image}`
            : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        }}
        style={s.gridImage}
      />
      <View style={s.gridBody}>
        <Text style={s.gridCategory}>
          {CATEGORY_EMOJI[item.category] || '🍽️'} {item.category || 'General'}
        </Text>
        <Text style={s.gridName} numberOfLines={1}>{item.name}</Text>
        <Text style={s.gridDesc} numberOfLines={2}>
          {item.description || 'Delicious food item'}
        </Text>
        <View style={s.gridFooter}>
          <Text style={s.gridPrice}>${(item.price || 0).toFixed(2)}</Text>
          {item.rating > 0 && (
            <View style={s.ratingRow}>
              <Text style={s.ratingStar}>★</Text>
              <Text style={s.ratingVal}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Grid data (skip first item since it's the hero)
  const gridData = filtered.length > 1 ? filtered.slice(1) : [];

  // ── Loading ──────────────────────────────────────────
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

  // ── Main ─────────────────────────────────────────────
  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.mocha} />

      {/* Top Header Bar */}
      <View style={s.topBar}>
        <Text style={s.topBarTitle}>☕  Smart Food</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchFoods(true)}
            tintColor={C.caramel}
            colors={[C.caramel]}
          />
        }
      >
        {/* Greeting */}
        <View style={s.greetingWrap}>
          <View>
            <Text style={s.greetingSub}>Welcome back 👋</Text>
            <Text style={s.greetingMain}>What would you like to eat?</Text>
          </View>
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search for food..."
            placeholderTextColor="#B5A99A"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={s.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categoryRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[s.catChip, activeCategory === cat && s.catChipActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={s.catEmoji}>{CATEGORY_EMOJI[cat]}</Text>
              <Text
                style={[
                  s.catLabel,
                  activeCategory === cat && s.catLabelActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Hero / Featured */}
        {renderHero()}

        {/* Section title */}
        {gridData.length > 0 && (
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Popular Items</Text>
            <Text style={s.sectionCount}>{gridData.length} items</Text>
          </View>
        )}

        {/* Grid */}
        {gridData.length > 0 ? (
          <View style={s.gridWrap}>
            {gridData.map((item) => (
              <View key={item._id} style={s.gridCol}>
                {renderGridItem({ item })}
              </View>
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.emptyWrap}>
            <View style={s.emptyCircle}>
              <Text style={s.emptyEmoji}>🍽️</Text>
            </View>
            <Text style={s.emptyTitle}>No items found</Text>
            <Text style={s.emptySub}>
              {search
                ? 'Try a different search term'
                : 'No items in this category yet'}
            </Text>
          </View>
        ) : null}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24;

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.cream },

  // Top header bar
  topBar: {
    backgroundColor: C.mocha,
    paddingTop: STATUSBAR_HEIGHT,
    paddingBottom: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: C.cream,
    letterSpacing: 0.3,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.cream,
  },
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
  loadingText: { marginTop: 14, color: C.textMuted, fontSize: 15, fontWeight: '500' },

  // Greeting
  greetingWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },
  greetingSub: { fontSize: 14, color: C.textMuted, marginBottom: 4 },
  greetingMain: {
    fontSize: 24,
    fontWeight: '800',
    color: C.textDark,
    letterSpacing: -0.5,
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.milk,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#E8DDD3',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.textDark,
    paddingVertical: 12,
  },
  searchClear: {
    fontSize: 16,
    color: C.textMuted,
    padding: 4,
  },

  // Categories
  categoryRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.milk,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E8DDD3',
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: C.walnut,
    borderColor: C.walnut,
  },
  catEmoji: { fontSize: 15, marginRight: 6 },
  catLabel: { fontSize: 13, fontWeight: '600', color: C.textMuted },
  catLabelActive: { color: C.cream },

  // Hero
  heroCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: C.milk,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  heroImage: {
    width: '100%',
    height: 210,
    backgroundColor: C.fog,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(59,31,26,0.35)',
  },
  heroBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(255,248,240,0.93)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.walnut,
    letterSpacing: 0.3,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
  },
  heroCategory: {
    fontSize: 12,
    color: 'rgba(255,248,240,0.85)',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '800',
    color: C.cream,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  heroPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: C.cream,
  },
  heroViewBtn: {
    backgroundColor: C.cream,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroViewText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.walnut,
  },

  // Section
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: C.textDark,
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: '500',
  },

  // Grid
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
  },
  gridCol: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 14,
  },
  gridCard: {
    backgroundColor: C.milk,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  gridImage: {
    width: '100%',
    height: 130,
    backgroundColor: C.fog,
  },
  gridBody: { padding: 12 },
  gridCategory: {
    fontSize: 10,
    color: C.caramel,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gridName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 4,
  },
  gridDesc: {
    fontSize: 11,
    color: C.textMuted,
    lineHeight: 16,
    marginBottom: 8,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: C.walnut,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: { fontSize: 12, color: C.star, marginRight: 2 },
  ratingVal: { fontSize: 12, fontWeight: '600', color: C.textMuted },

  // Empty
  emptyWrap: { alignItems: 'center', marginTop: 50, paddingHorizontal: 40 },
  emptyCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: C.fog,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.textDark, marginBottom: 6 },
  emptySub: { fontSize: 13, color: C.textMuted, textAlign: 'center', lineHeight: 19 },
});

export default UserMenuScreen;
