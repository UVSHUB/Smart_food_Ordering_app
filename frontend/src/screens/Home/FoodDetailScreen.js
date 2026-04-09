import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, FlatList, Platform
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const BASE_URL = 'http://192.168.8.169:5001/api';

const C = {
  primary:   '#FA4A0C',
  bg:        '#F9F9FB',
  surface:   '#FFFFFF',
  textDark:  '#1A1A1A',
  textMuted: '#9A9A9D',
  star:      '#FFB800',
  danger:    '#FF4B4B',
  border:    '#E8E8E8',
};

const FoodDetailScreen = ({ route, navigation }) => {
  const { food } = route.params;
  const { user, userToken } = useContext(AuthContext);
  const { addToCart, cartCount } = useCart();
  const isFocused = useIsFocused();

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [currentRating, setCurrentRating] = useState(food.rating || 0);
  const [totalReviews, setTotalReviews] = useState(food.numReviews || 0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (isFocused) fetchReviews();
  }, [isFocused]);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const { data } = await axios.get(`${BASE_URL}/reviews/food/${food._id}`);
      setReviews(data);
      if (data.length > 0) {
        const sum = data.reduce((acc, rev) => acc + rev.rating, 0);
        setCurrentRating(sum / data.length);
        setTotalReviews(data.length);
      } else {
        setCurrentRating(0);
        setTotalReviews(0);
      }
    } catch (err) {
      console.log('Error fetching reviews', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleDeleteReview = (reviewId) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete your review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/reviews/${reviewId}`);
            fetchReviews();
          } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(food);
    Alert.alert('Added to Cart! 🛒', `${qty}x ${food.name} added to your cart.`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addToCart(food);
    navigation.navigate('Cart');
  };

  const hasReviewed = user ? reviews.some((r) => r.user_id && r.user_id._id === user._id) : false;

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <MaterialIcons
        key={i}
        name={i < Math.round(rating) ? 'star' : 'star-border'}
        size={16}
        color={i < Math.round(rating) ? C.star : '#E0E0E0'}
        style={{ marginRight: 2 }}
      />
    ));

  const renderReview = ({ item }) => {
    const isOwner = user && user._id === item.user_id?._id;
    const canDelete = isOwner || (user && user.isAdmin);

    return (
      <View style={s.reviewCard}>
        <View style={s.reviewHeader}>
          <View style={s.reviewAvatar}>
            <Text style={s.reviewAvatarText}>{(item.user_id?.name || 'A')[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.reviewerName}>{item.user_id?.name || 'Anonymous'}</Text>
            <View style={{ flexDirection: 'row' }}>{renderStars(item.rating)}</View>
          </View>
          <Text style={s.reviewDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <Text style={s.reviewComment}>{item.comment}</Text>
        {(isOwner || canDelete) && (
          <View style={s.reviewActions}>
            {isOwner && (
              <TouchableOpacity onPress={() => navigation.navigate('EditReview', { review: item, foodName: food.name })}>
                <Text style={s.editAction}>Edit</Text>
              </TouchableOpacity>
            )}
            {canDelete && (
              <TouchableOpacity onPress={() => handleDeleteReview(item._id)}>
                <Text style={s.deleteAction}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const imageUri = food.image && food.image.startsWith('http')
    ? food.image
    : `http://192.168.8.169:5001${food.image || '/images/sample-food.jpg'}`;

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        ListHeaderComponent={
          <>
            {/* Hero Image */}
            <View style={s.heroWrap}>
              <Image source={{ uri: imageUri }} style={s.heroImage} />
              {/* Overlay Buttons */}
              <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back-ios" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={s.cartBtn} onPress={() => navigation.navigate('Cart')}>
                <MaterialIcons name="shopping-cart" size={22} color="#fff" />
                {cartCount > 0 && (
                  <View style={s.cartBadge}>
                    <Text style={s.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Info Card */}
            <View style={s.infoCard}>
              {/* Category chip */}
              <View style={s.categoryChip}>
                <Text style={s.categoryChipText}>{food.category}</Text>
              </View>

              <View style={s.titleRow}>
                <Text style={s.foodName}>{food.name}</Text>
                <Text style={s.foodPrice}>Rs. {(food.price || 0).toFixed(2)}</Text>
              </View>

              {/* Rating Row */}
              <View style={s.ratingRow}>
                <View style={{ flexDirection: 'row' }}>{renderStars(currentRating)}</View>
                <Text style={s.ratingText}>{currentRating.toFixed(1)}</Text>
                <Text style={s.ratingCount}>({totalReviews} reviews)</Text>
              </View>

              <Text style={s.foodDesc}>{food.description}</Text>

              {/* Quantity Selector */}
              <View style={s.qtySection}>
                <Text style={s.qtyLabel}>Quantity</Text>
                <View style={s.qtyRow}>
                  <TouchableOpacity
                    style={s.qtyBtn}
                    onPress={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <MaterialIcons name="remove" size={20} color={C.textDark} />
                  </TouchableOpacity>
                  <Text style={s.qtyValue}>{qty}</Text>
                  <TouchableOpacity
                    style={s.qtyBtn}
                    onPress={() => setQty((q) => q + 1)}
                  >
                    <MaterialIcons name="add" size={20} color={C.textDark} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Subtotal */}
              <View style={s.subtotalRow}>
                <Text style={s.subtotalLabel}>Subtotal</Text>
                <Text style={s.subtotalValue}>Rs. {(food.price * qty).toFixed(2)}</Text>
              </View>
            </View>

            {/* Reviews Header */}
            <View style={s.reviewsHeader}>
              <Text style={s.reviewsTitle}>Reviews</Text>
              {!userToken ? (
                <Text style={s.reviewPrompt}>Log in to review</Text>
              ) : hasReviewed ? (
                <Text style={s.reviewPrompt}>You've reviewed this</Text>
              ) : (
                <TouchableOpacity
                  style={s.addReviewBtn}
                  onPress={() => navigation.navigate('AddReview', { foodId: food._id, foodName: food.name })}
                >
                  <Text style={s.addReviewBtnText}>+ Write a Review</Text>
                </TouchableOpacity>
              )}
            </View>

            {loadingReviews && <ActivityIndicator color={C.primary} style={{ marginTop: 20 }} />}
            {!loadingReviews && reviews.length === 0 && (
              <View style={s.noReviews}>
                <MaterialIcons name="rate-review" size={36} color={C.border} />
                <Text style={s.noReviewsText}>No reviews yet. Be the first!</Text>
              </View>
            )}
          </>
        }
        renderItem={renderReview}
      />

      {/* Sticky Bottom CTA */}
      {userToken && (
        <View style={s.footer}>
          <TouchableOpacity style={s.addToCartBtn} onPress={handleAddToCart} activeOpacity={0.8}>
            <MaterialIcons name="add-shopping-cart" size={20} color={C.primary} />
            <Text style={s.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.buyNowBtn} onPress={handleBuyNow} activeOpacity={0.85}>
            <Text style={s.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },

  // Hero
  heroWrap: { position: 'relative' },
  heroImage: { width: '100%', height: 300, backgroundColor: C.border },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 24) + 10,
    left: 16,
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  cartBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 24) + 10,
    right: 16,
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: C.primary,
    width: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // Info Card
  infoCard: {
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 20,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0ED',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryChipText: { color: C.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  foodName: { fontSize: 22, fontWeight: '800', color: C.textDark, flex: 1, marginRight: 12, letterSpacing: -0.5 },
  foodPrice: { fontSize: 22, fontWeight: '900', color: C.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  ratingText: { fontSize: 14, fontWeight: '700', color: C.textDark, marginLeft: 6 },
  ratingCount: { fontSize: 13, color: C.textMuted, marginLeft: 4 },
  foodDesc: { fontSize: 14, lineHeight: 22, color: C.textMuted, marginBottom: 20 },

  // Qty
  qtySection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  qtyLabel: { fontSize: 15, fontWeight: '700', color: C.textDark },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: 14, padding: 4 },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  qtyValue: { fontSize: 17, fontWeight: '800', color: C.textDark, marginHorizontal: 16 },

  // Subtotal
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1, borderTopColor: C.border },
  subtotalLabel: { fontSize: 15, color: C.textMuted, fontWeight: '600' },
  subtotalValue: { fontSize: 18, fontWeight: '900', color: C.primary },

  // Reviews
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  reviewsTitle: { fontSize: 18, fontWeight: '800', color: C.textDark },
  addReviewBtn: { backgroundColor: '#FFF0ED', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addReviewBtnText: { color: C.primary, fontSize: 13, fontWeight: '700' },
  reviewPrompt: { color: C.textMuted, fontSize: 13 },
  noReviews: { alignItems: 'center', padding: 30 },
  noReviewsText: { color: C.textMuted, marginTop: 8, fontSize: 14 },

  reviewCard: {
    backgroundColor: C.surface, marginHorizontal: 16, marginBottom: 12,
    borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#FFF0ED', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  reviewAvatarText: { fontSize: 16, fontWeight: '800', color: C.primary },
  reviewerName: { fontSize: 14, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  reviewDate: { fontSize: 12, color: C.textMuted },
  reviewComment: { fontSize: 14, color: C.textMuted, lineHeight: 20 },
  reviewActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border },
  editAction: { color: C.primary, fontWeight: '600', marginRight: 16, fontSize: 13 },
  deleteAction: { color: C.danger, fontWeight: '600', fontSize: 13 },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: C.surface,
    borderTopWidth: 1, borderTopColor: C.border,
    gap: 12,
  },
  addToCartBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.primary, borderRadius: 16, paddingVertical: 16,
    gap: 8,
  },
  addToCartText: { color: C.primary, fontSize: 15, fontWeight: '800' },
  buyNowBtn: {
    flex: 1.5, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.primary, borderRadius: 16, paddingVertical: 16,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  buyNowText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default FoodDetailScreen;
