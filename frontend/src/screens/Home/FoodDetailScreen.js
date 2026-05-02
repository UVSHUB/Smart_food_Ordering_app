import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, FlatList, Platform
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { BASE_URL, IMAGE_BASE_URL } from '../../services/api';

const C = {
  primary:   '#FA4A0C',
  bg:        '#F4F4F6',
  surface:   '#FFFFFF',
  textDark:  '#111827',
  textMuted: '#6B7280',
  star:      '#F59E0B',
  danger:    '#EF4444',
  border:    '#E5E7EB',
};

// ── Rating breakdown bar chart ─────────────────────────────────────────────────
function RatingBreakdown({ reviews }) {
  if (!reviews.length) return null;
  const total = reviews.length;
  const counts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / total;

  return (
    <View style={rb.wrap}>
      {/* Left: big number */}
      <View style={rb.scoreWrap}>
        <Text style={rb.score}>{avg.toFixed(1)}</Text>
        <View style={rb.starsSmall}>
          {[1,2,3,4,5].map(i => (
            <MaterialIcons key={i} name={i <= Math.round(avg) ? 'star' : 'star-border'} size={12} color={C.star} />
          ))}
        </View>
        <Text style={rb.totalText}>{total} {total === 1 ? 'review' : 'reviews'}</Text>
      </View>

      {/* Right: bars */}
      <View style={rb.bars}>
        {counts.map(({ star, count }) => {
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <View key={star} style={rb.barRow}>
              <Text style={rb.barLabel}>{star}</Text>
              <MaterialIcons name="star" size={11} color={C.star} style={{ marginRight: 5 }} />
              <View style={rb.barBg}>
                <View style={[rb.barFill, { width: `${pct}%` }]} />
              </View>
              <Text style={rb.barCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const rb = StyleSheet.create({
  wrap:      { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 18 },
  scoreWrap: { alignItems: 'center', width: 72 },
  score:     { fontSize: 40, fontWeight: '900', color: C.textDark, lineHeight: 44 },
  starsSmall:{ flexDirection: 'row', marginVertical: 4 },
  totalText: { fontSize: 11, color: C.textMuted, textAlign: 'center', lineHeight: 14 },
  bars:      { flex: 1, gap: 5 },
  barRow:    { flexDirection: 'row', alignItems: 'center' },
  barLabel:  { fontSize: 11, fontWeight: '700', color: C.textMuted, width: 10, textAlign: 'right', marginRight: 3 },
  barBg:     { flex: 1, height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden', marginRight: 6 },
  barFill:   { height: '100%', backgroundColor: C.star, borderRadius: 3 },
  barCount:  { fontSize: 11, color: C.textMuted, width: 16, textAlign: 'right' },
});

const FoodDetailScreen = ({ route, navigation }) => {
  const { food } = route.params;
  const { user, userToken } = useContext(AuthContext);
  const { addToCart, cartCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
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
            const config = {
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            };
            await axios.delete(`${BASE_URL}/reviews/${reviewId}`, config);
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
    Alert.alert('Added to Cart', `${qty}x ${food.name} added to your cart.`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addToCart(food);
    navigation.navigate('Cart');
  };

  const [sortBy, setSortBy] = useState('newest'); // newest | highest | lowest

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest')  return a.rating - b.rating;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

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
    const isOwner  = user && user._id === item.user_id?._id;
    const canDelete= isOwner || (user && user.isAdmin);
    const initial  = (item.user_id?.name || 'A')[0].toUpperCase();
    const dateStr  = new Date(item.createdAt).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
    // Star colour per rating
    const starColor = item.rating >= 4 ? '#15803D' : item.rating === 3 ? '#92400E' : '#B91C1C';
    const starBg    = item.rating >= 4 ? '#F0FDF4' : item.rating === 3 ? '#FFFBEB' : '#FFF0F0';

    return (
      <View style={s.reviewCard}>
        {/* Review header */}
        <View style={s.reviewHead}>
          <View style={s.reviewAvatar}>
            <Text style={s.reviewAvatarText}>{initial}</Text>
          </View>
          <View style={s.reviewMeta}>
            <Text style={s.reviewerName}>{item.user_id?.name || 'Anonymous'}</Text>
            <Text style={s.reviewDate}>{dateStr}</Text>
          </View>
          {/* Star rating badge */}
          <View style={[s.ratingBadge, { backgroundColor: starBg }]}>
            <MaterialIcons name="star" size={13} color={starColor} />
            <Text style={[s.ratingBadgeText, { color: starColor }]}>{item.rating}.0</Text>
          </View>
        </View>

        {/* Comment */}
        <Text style={s.reviewComment}>{item.comment}</Text>

        {/* Actions */}
        {(isOwner || canDelete) && (
          <View style={s.reviewActions}>
            {isOwner && (
              <TouchableOpacity
                style={s.editBtn}
                onPress={() => navigation.navigate('EditReview', { review: item, foodName: food.name })}
              >
                <MaterialIcons name="edit" size={13} color={C.primary} />
                <Text style={s.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
            {canDelete && (
              <TouchableOpacity
                style={s.deleteBtn}
                onPress={() => handleDeleteReview(item._id)}
              >
                <MaterialIcons name="delete-outline" size={13} color={C.danger} />
                <Text style={s.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const imageUri = food.image && food.image.startsWith('http')
    ? food.image
    : `${IMAGE_BASE_URL}${food.image ? (food.image.startsWith('/') ? '' : '/') + food.image : '/images/sample-food.jpg'}`;

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
              <TouchableOpacity 
                style={s.wishBtn} 
                onPress={() => toggleWishlist(food)}
              >
                <MaterialIcons 
                  name={isInWishlist(food._id) ? "favorite" : "favorite-border"} 
                  size={22} 
                  color={isInWishlist(food._id) ? C.primary : "#fff"} 
                />
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

            {/* Reviews section */}
            <View style={s.reviewsSection}>
              {/* Header row */}
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
                    <MaterialIcons name="add" size={14} color={C.primary} />
                    <Text style={s.addReviewBtnText}>Write a Review</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Rating breakdown */}
              {!loadingReviews && reviews.length > 0 && (
                <RatingBreakdown reviews={reviews} />
              )}

              {/* Sort controls */}
              {reviews.length > 1 && (
                <View style={s.sortRow}>
                  {[['newest','New'],['highest','Top'],['lowest','Low']].map(([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      style={[s.sortChip, sortBy === key && s.sortChipActive]}
                      onPress={() => setSortBy(key)}
                    >
                      <Text style={[s.sortChipText, sortBy === key && s.sortChipTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {loadingReviews && <ActivityIndicator color={C.primary} style={{ marginVertical: 20 }} />}
              {!loadingReviews && reviews.length === 0 && (
                <View style={s.noReviews}>
                  <View style={s.noReviewsIcon}>
                    <MaterialIcons name="rate-review" size={28} color={C.border} />
                  </View>
                  <Text style={s.noReviewsTitle}>No reviews yet</Text>
                  <Text style={s.noReviewsSub}>Be the first to share your experience!</Text>
                </View>
              )}
            </View>
          </>
        }
        renderItem={renderReview}
        data={sortedReviews}
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
  wishBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 24) + 10,
    right: 70,
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },

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
  reviewsSection: { paddingHorizontal: 16, marginBottom: 16 },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  reviewsTitle: { fontSize: 18, fontWeight: '800', color: C.textDark },
  addReviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF0ED', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addReviewBtnText: { color: C.primary, fontSize: 13, fontWeight: '700' },
  reviewPrompt: { color: C.textMuted, fontSize: 13 },

  sortRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  sortChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.border },
  sortChipActive: { backgroundColor: C.primary },
  sortChipText: { fontSize: 12, fontWeight: '700', color: C.textMuted },
  sortChipTextActive: { color: '#fff' },

  noReviews: { alignItems: 'center', paddingVertical: 32 },
  noReviewsIcon: { width: 64, height: 64, borderRadius: 18, backgroundColor: C.border, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  noReviewsTitle: { fontSize: 16, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  noReviewsSub: { fontSize: 13, color: C.textMuted, textAlign: 'center' },

  reviewCard: {
    backgroundColor: C.surface,
    marginBottom: 10,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  reviewHead:     { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewAvatar:   { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFF0ED', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  reviewAvatarText:{ fontSize: 16, fontWeight: '800', color: C.primary },
  reviewMeta:     { flex: 1 },
  reviewerName:   { fontSize: 14, fontWeight: '700', color: C.textDark, marginBottom: 2 },
  reviewDate:     { fontSize: 11, color: C.textMuted },
  ratingBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  ratingBadgeText:{ fontSize: 13, fontWeight: '800' },
  reviewComment:  { fontSize: 14, color: C.textMuted, lineHeight: 22 },
  reviewActions:  { flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border },
  editBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FFF0ED' },
  editBtnText:    { fontSize: 12, fontWeight: '700', color: C.primary },
  deleteBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FFF0F0' },
  deleteBtnText:  { fontSize: 12, fontWeight: '700', color: C.danger },

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
    borderWidth: 2, borderColor: C.primary, borderRadius: 16, paddingVertical: 16, gap: 8,
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
