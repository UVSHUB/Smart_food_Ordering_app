import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image,
  TouchableOpacity, ActivityIndicator,
  StatusBar, SafeAreaView, RefreshControl,
  TextInput, ScrollView, Dimensions, Platform,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { BASE_URL, IMAGE_BASE_URL } from '../../services/api';

const { width } = Dimensions.get('window');

// ── Ultra Premium Modern Palette ──────────────────────
const C = {
  primary:     '#FA4A0C', // Vibrant Foodie Orange
  bg:          '#F9F9FB', // Very light cool gray
  surface:     '#FFFFFF', // Cards & Elements
  textDark:    '#1A1A1A', // Deep black for crisp text
  textMuted:   '#9A9A9D', // Subtle gray
  star:        '#FFC107', // Warning/Star Gold
  border:      '#F0F0F0',
};

const CATEGORIES = ['All', 'Meals', 'Drinks', 'Snacks', 'Desserts'];
const CATEGORY_ICON = {
  All:      'menu-book',
  Meals:    'restaurant',
  Drinks:   'local-cafe',
  Snacks:   'fastfood',
  Desserts: 'cake',
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
      const response = await axios.get(`${BASE_URL}/foods`);
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
      <View style={s.heroWrapper}>
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
                  : `${IMAGE_BASE_URL}${hero.image}`
                : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
            }}
            style={s.heroImage}
          />
          <View style={s.heroOverlay} />
          
          <View style={s.heroBadge}>
            <MaterialIcons name="star" size={12} color={C.primary} style={{ marginRight: 4 }} />
            <Text style={s.heroBadgeText}>Featured</Text>
          </View>
          
          <View style={s.heroContent}>
            <View style={s.heroCategoryRow}>
              <MaterialIcons name={CATEGORY_ICON[hero.category] || 'room-service'} size={12} color={'rgba(255,255,255,0.85)'} />
              <Text style={s.heroCategory}>{hero.category}</Text>
            </View>
            <Text style={s.heroName}>{hero.name}</Text>
            <View style={s.heroPriceRow}>
              <Text style={s.heroPrice}>Rs. {(hero.price || 0).toFixed(2)}</Text>
              <View style={s.heroViewBtn}>
                <Text style={s.heroViewText}>View Item</Text>
                <MaterialIcons name="arrow-forward" size={12} color={C.textDark} style={{ marginLeft: 4 }} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
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
              : `${IMAGE_BASE_URL}${item.image}`
            : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        }}
        style={s.gridImage}
      />
      <View style={s.gridBody}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <MaterialIcons name={CATEGORY_ICON[item.category] || 'room-service'} size={12} color={C.textMuted} style={{ marginRight: 4 }} />
          <Text style={s.gridCategory}>
            {item.category || 'General'}
          </Text>
        </View>
        <Text style={s.gridName} numberOfLines={1}>{item.name}</Text>
        <Text style={s.gridDesc} numberOfLines={2}>
          {item.description || 'Delicious food item'}
        </Text>
        <View style={s.gridFooter}>
          <Text style={s.gridPrice}>Rs. {(item.price || 0).toFixed(2)}</Text>
          {item.rating > 0 && (
            <View style={s.ratingRow}>
              <MaterialIcons name="star" size={14} color={C.star} />
              <Text style={s.ratingVal}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const gridData = filtered.length > 1 ? filtered.slice(1) : [];

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Top Header Bar */}
      <View style={s.topBar}>
        <Image 
          source={require('../../../assets/logo.png')} 
          style={s.topBarLogo}
          resizeMode="contain" 
        />
        <Text style={s.topBarTitle}>SLIIT KADE</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchFoods(true)}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
      >
        {/* Greeting */}
        <View style={s.greetingWrap}>
          <Text style={s.greetingSub}>Delivery within 30 min</Text>
          <Text style={s.greetingMain}>Delicious food ready to be delivered to you.</Text>
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <MaterialIcons name="search" size={22} color={C.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            style={s.searchInput}
            placeholder="What are you craving?"
            placeholderTextColor={C.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialIcons name="close" size={22} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categoryRow}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[s.catChip, isActive && s.catChipActive]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.7}
              >
                <MaterialIcons 
                  name={CATEGORY_ICON[cat]} 
                  size={18} 
                  color={isActive ? C.surface : C.textMuted} 
                  style={{ marginRight: 6 }} 
                />
                <Text style={[s.catLabel, isActive && s.catLabelActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Hero / Featured */}
        {renderHero()}

        {/* Section title */}
        {gridData.length > 0 && (
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Popular Choices</Text>
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
              <MaterialIcons name="dinner-dining" size={48} color={C.primary} />
            </View>
            <Text style={s.emptyTitle}>No items found</Text>
            <Text style={s.emptySub}>
              {search
                ? 'Try a different search term.'
                : 'No items in this category yet.'}
            </Text>
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },

  // Top header bar
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 24) + 10,
    paddingBottom: 10,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
  },
  topBarTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, letterSpacing: -0.5 },
  topBarLogo: { width: 32, height: 32, marginRight: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },

  // Greeting
  greetingWrap: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 10 },
  greetingSub: { fontSize: 13, color: C.primary, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  greetingMain: { fontSize: 28, fontWeight: '800', color: C.textDark, letterSpacing: -0.5, lineHeight: 36, paddingRight: 40 },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F5',
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchInput: { flex: 1, fontSize: 15, color: C.textDark },

  // Categories
  categoryRow: { paddingHorizontal: 24, paddingVertical: 20 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  catChipActive: { backgroundColor: C.primary },
  catLabel: { fontSize: 14, fontWeight: '600', color: C.textMuted },
  catLabelActive: { color: C.surface },

  // Hero
  heroWrapper: {
    paddingHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 6,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: C.surface,
  },
  heroImage: { width: '100%', height: 240, backgroundColor: C.border },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroBadge: {
    position: 'absolute',
    top: 16, left: 16,
    backgroundColor: C.surface,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 30,
    flexDirection: 'row', alignItems: 'center'
  },
  heroBadgeText: { fontSize: 11, fontWeight: '800', color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  heroCategoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  heroCategory: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4 },
  heroName: { fontSize: 26, fontWeight: '800', color: C.surface, marginBottom: 16, letterSpacing: -0.5 },
  heroPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroPrice: { fontSize: 22, fontWeight: '800', color: C.surface },
  heroViewBtn: { backgroundColor: C.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  heroViewText: { fontSize: 13, fontWeight: '800', color: C.textDark },

  // Section
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: C.textDark, letterSpacing: -0.5 },
  sectionCount: { fontSize: 14, color: C.textMuted, fontWeight: '600' },

  // Grid
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  gridCol: { width: '50%', paddingHorizontal: 8, marginBottom: 16 },
  gridCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  gridImage: { width: '100%', height: 140, backgroundColor: C.border },
  gridBody: { padding: 14 },
  gridCategory: { fontSize: 10, color: C.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  gridName: { fontSize: 16, fontWeight: '800', color: C.textDark, marginBottom: 4, letterSpacing: -0.3 },
  gridDesc: { fontSize: 12, color: C.textMuted, lineHeight: 18, marginBottom: 10 },
  gridFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gridPrice: { fontSize: 16, fontWeight: '800', color: C.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingVal: { fontSize: 12, fontWeight: '700', color: C.textDark, marginLeft: 2 },

  // Empty
  emptyWrap: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF0ED', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 22 },
});

export default UserMenuScreen;
