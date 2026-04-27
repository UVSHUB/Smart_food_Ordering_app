import React, { useState, useCallback, useContext } from 'react';
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
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');

const C = {
  primary:     '#FA4A0C',
  bg:          '#F4F4F6',
  surface:     '#FFFFFF',
  textDark:    '#111827',
  textMuted:   '#6B7280',
  textLight:   '#9CA3AF',
  star:        '#F59E0B',
  border:      '#E5E7EB',
};

const CATEGORIES = ['All', 'Meals', 'Drinks', 'Snacks', 'Desserts'];
const CATEGORY_ICON = {
  All:      'menu-book',
  Meals:    'restaurant',
  Drinks:   'local-cafe',
  Snacks:   'fastfood',
  Desserts: 'cake',
};

const PROMOTIONS = [
  { id: '1', title: '50% Off First Order', sub: 'Use code: FIRST50', color: '#FA4A0C', icon: 'local-offer' },
  { id: '2', title: 'Free Delivery', sub: 'On orders over Rs. 2000', color: '#3B82F6', icon: 'delivery-dining' },
  { id: '3', title: 'Weekend Special', sub: 'Buy 1 Get 1 Free on Snacks', color: '#8B5CF6', icon: 'celebration' },
];

const UserMenuScreen = ({ navigation }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const { isInWishlist, toggleWishlist } = useWishlist();
  const { cartCount } = useCart();

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

  const filtered = foods.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = !search || 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch && item.isAvailable !== false;
  });

  const renderPromotions = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={s.promoRow}
      snapToInterval={width * 0.85 + 16}
      decelerationRate="fast"
    >
      {PROMOTIONS.map(p => (
        <View key={p.id} style={[s.promoCard, { backgroundColor: p.color }]}>
          <View style={s.promoContent}>
            <Text style={s.promoTitle}>{p.title}</Text>
            <Text style={s.promoSub}>{p.sub}</Text>
            <TouchableOpacity style={s.promoBtn}>
              <Text style={[s.promoBtnText, { color: p.color }]}>Order Now</Text>
            </TouchableOpacity>
          </View>
          <MaterialIcons name={p.icon} size={80} color="rgba(255,255,255,0.15)" style={s.promoIcon} />
        </View>
      ))}
    </ScrollView>
  );

  const renderGridItem = ({ item }) => {
    const favorite = isInWishlist(item._id);
    return (
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
        <TouchableOpacity 
          style={s.heartBtn} 
          onPress={() => toggleWishlist(item)}
        >
          <MaterialIcons 
            name={favorite ? "favorite" : "favorite-border"} 
            size={18} 
            color={favorite ? C.primary : "#fff"} 
          />
        </TouchableOpacity>
        
        <View style={s.gridBody}>
          <Text style={s.gridCategory}>{item.category}</Text>
          <Text style={s.gridName} numberOfLines={1}>{item.name}</Text>
          <View style={s.gridFooter}>
            <Text style={s.gridPrice}>Rs. {(item.price || 0).toFixed(0)}</Text>
            <View style={s.ratingRow}>
              <MaterialIcons name="star" size={14} color={C.star} />
              <Text style={s.ratingVal}>{(item.rating || 0).toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      {/* Real Header with Address */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.addressLabel}>Delivering to</Text>
          <TouchableOpacity style={s.addressRow}>
            <MaterialIcons name="location-on" size={16} color={C.primary} />
            <Text style={s.addressText} numberOfLines={1}>SLIIT Malabe Campus, Kade</Text>
            <MaterialIcons name="keyboard-arrow-down" size={18} color={C.textMuted} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.headerProfile} onPress={() => navigation.navigate('ProfileTab')}>
          <MaterialIcons name="account-circle" size={32} color={C.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchFoods(true)} tintColor={C.primary} />
        }
      >
        {/* Search */}
        <View style={s.searchRow}>
          <View style={s.searchWrap}>
            <MaterialIcons name="search" size={20} color={C.textLight} />
            <TextInput
              style={s.searchInput}
              placeholder="Search for your favorite food"
              placeholderTextColor={C.textLight}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <MaterialIcons name="cancel" size={20} color={C.textLight} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={s.filterBtn}>
            <MaterialIcons name="tune" size={20} color={C.surface} />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[s.catItem, activeCategory === cat && s.catItemActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <MaterialIcons 
                name={CATEGORY_ICON[cat]} 
                size={20} 
                color={activeCategory === cat ? C.surface : C.textMuted} 
              />
              <Text style={[s.catText, activeCategory === cat && s.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promotions */}
        {renderPromotions()}

        {/* Popular Section */}
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Popular Today</Text>
          <TouchableOpacity>
            <Text style={s.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Grid List */}
        <View style={s.gridWrap}>
          {filtered.map(item => (
            <View key={item._id} style={s.gridCol}>
              {renderGridItem({ item })}
            </View>
          ))}
        </View>

        {filtered.length === 0 && (
          <View style={s.empty}>
            <MaterialIcons name="search-off" size={60} color={C.border} />
            <Text style={s.emptyText}>No results found</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <TouchableOpacity 
          style={s.floatingCart} 
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.9}
        >
          <View style={s.cartIconWrap}>
            <MaterialIcons name="shopping-basket" size={24} color={C.surface} />
            <View style={s.cartBadge}>
              <Text style={s.cartBadgeText}>{cartCount}</Text>
            </View>
          </View>
          <View style={s.cartTextWrap}>
            <Text style={s.cartTitle}>View Cart</Text>
            <Text style={s.cartSub}>Items added to your basket</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={C.surface} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.surface },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: C.surface,
  },
  addressLabel: { fontSize: 11, color: C.textLight, fontWeight: '700', textTransform: 'uppercase' },
  addressRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  addressText:  { fontSize: 14, fontWeight: '800', color: C.textDark, marginHorizontal: 4, maxWidth: width * 0.6 },
  headerProfile:{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  // Search
  searchRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginTop: 8 },
  searchWrap: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', 
    backgroundColor: C.bg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, gap: 8 
  },
  searchInput: { flex: 1, fontSize: 14, color: C.textDark },
  filterBtn: { 
    width: 48, height: 48, backgroundColor: C.primary, 
    borderRadius: 12, justifyContent: 'center', alignItems: 'center' 
  },

  // Categories
  catScroll: { paddingHorizontal: 20, paddingVertical: 18, gap: 12 },
  catItem: { 
    flexDirection: 'row', alignItems: 'center', gap: 8, 
    backgroundColor: C.bg, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 
  },
  catItemActive: { backgroundColor: C.primary },
  catText: { fontSize: 14, fontWeight: '700', color: C.textMuted },
  catTextActive: { color: C.surface },

  // Promotions
  promoRow: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  promoCard: { 
    width: width * 0.85, height: 160, borderRadius: 20, padding: 20, 
    flexDirection: 'row', justifyContent: 'space-between', overflow: 'hidden' 
  },
  promoContent: { flex: 1, justifyContent: 'center' },
  promoTitle: { fontSize: 20, fontWeight: '900', color: C.surface, marginBottom: 4 },
  promoSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
  promoBtn: { alignSelf: 'flex-start', backgroundColor: C.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  promoBtnText: { fontSize: 12, fontWeight: '800' },
  promoIcon: { position: 'absolute', right: -10, bottom: -10 },

  // Section
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: C.textDark },
  seeAll: { fontSize: 13, color: C.primary, fontWeight: '700' },

  // Grid
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  gridCol: { width: '50%', paddingHorizontal: 8, marginBottom: 16 },
  gridCard: { 
    backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  gridImage: { width: '100%', height: 120, backgroundColor: C.bg },
  heartBtn: { 
    position: 'absolute', top: 10, right: 10, 
    width: 32, height: 32, borderRadius: 16, 
    backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' 
  },
  gridBody: { padding: 12 },
  gridCategory: { fontSize: 10, color: C.primary, fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 },
  gridName: { fontSize: 15, fontWeight: '800', color: C.textDark, marginBottom: 6 },
  gridFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gridPrice: { fontSize: 16, fontWeight: '900', color: C.textDark },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingVal: { fontSize: 12, fontWeight: '700', color: C.textDark },

  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 15, color: C.textLight, marginTop: 10 },

  // Floating Cart
  floatingCart: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    backgroundColor: C.primary, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  cartIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  cartBadge: { 
    position: 'absolute', top: -5, right: -5, 
    backgroundColor: '#fff', width: 18, height: 18, borderRadius: 9, 
    justifyContent: 'center', alignItems: 'center' 
  },
  cartBadgeText: { color: C.primary, fontSize: 10, fontWeight: '900' },
  cartTextWrap: { flex: 1, marginLeft: 16 },
  cartTitle: { fontSize: 16, fontWeight: '800', color: C.surface },
  cartSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
});

export default UserMenuScreen;
