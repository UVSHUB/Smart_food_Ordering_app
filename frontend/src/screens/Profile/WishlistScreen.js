import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, SafeAreaView, StatusBar, Platform,
} from 'react-native';
import { useWishlist } from '../../context/WishlistContext';
import { MaterialIcons } from '@expo/vector-icons';
import { IMAGE_BASE_URL } from '../../services/api';

const C = {
  primary:  '#FA4A0C',
  bg:       '#F4F4F6',
  surface:  '#FFFFFF',
  textDark: '#111827',
  textMid:  '#6B7280',
  textLight:'#9CA3AF',
  star:     '#F59E0B',
  border:   '#E5E7EB',
};

export default function WishlistScreen({ navigation }) {
  const { wishlist, toggleWishlist } = useWishlist();

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={s.card}
        activeOpacity={0.8}
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
          style={s.image}
        />
        <View style={s.body}>
          <Text style={s.category}>{item.category}</Text>
          <Text style={s.name}>{item.name}</Text>
          <View style={s.footer}>
            <Text style={s.price}>Rs. {item.price}</Text>
            <TouchableOpacity 
              style={s.removeBtn} 
              onPress={() => toggleWishlist(item)}
            >
              <MaterialIcons name="favorite" size={20} color={C.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />
      
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color={C.textDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Favorites</Text>
        <View style={{ width: 40 }} />
      </View>

      {wishlist.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyCircle}>
            <MaterialIcons name="favorite-border" size={50} color={C.textLight} />
          </View>
          <Text style={s.emptyTitle}>No Favorites Yet</Text>
          <Text style={s.emptySub}>Tap the heart icon on any food item to save it here.</Text>
          <TouchableOpacity 
            style={s.browseBtn}
            onPress={() => navigation.navigate('UserMenu')}
          >
            <Text style={s.browseBtnText}>Explore Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 14,
    backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn:     { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.textDark },

  list: { padding: 20 },
  card: {
    flexDirection: 'row', backgroundColor: C.surface, borderRadius: 16,
    marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  image: { width: 100, height: 100, backgroundColor: C.bg },
  body: { flex: 1, padding: 12, justifyContent: 'center' },
  category: { fontSize: 10, fontWeight: '800', color: C.primary, textTransform: 'uppercase', marginBottom: 2 },
  name: { fontSize: 16, fontWeight: '800', color: C.textDark, marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '900', color: C.textDark },
  removeBtn: { padding: 4 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyCircle: { 
    width: 100, height: 100, borderRadius: 50, 
    backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 20 
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.textMid, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  browseBtn: {
    backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  browseBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
