import React from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, SafeAreaView, StatusBar, Dimensions, Platform,
} from 'react-native';

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
  success:     '#2E7D32',
  successBg:   '#E8F5E9',
  danger:      '#C0392B',
  dangerBg:    '#FDEDEB',
};

const CATEGORY_EMOJI = {
  Meals:    '🍛',
  Drinks:   '☕',
  Snacks:   '🥨',
  Desserts: '🍰',
  Other:    '🍽️',
};

const FoodDetailScreen = ({ route, navigation }) => {
  const { food } = route.params;

  const imageUrl = food.image
    ? food.image.startsWith('http')
      ? food.image
      : `http://10.94.178.167:5001${food.image}`
    : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.mocha} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Image */}
        <View style={s.imageWrap}>
          <Image source={{ uri: imageUrl }} style={s.heroImage} />
          <View style={s.imageOverlay} />

          {/* Back button */}
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>

          {/* Category badge */}
          <View style={s.categoryBadge}>
            <Text style={s.categoryEmoji}>
              {CATEGORY_EMOJI[food.category] || '🍽️'}
            </Text>
            <Text style={s.categoryText}>{food.category || 'General'}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={s.content}>
          {/* Title & Price card */}
          <View style={s.titleCard}>
            <View style={s.titleRow}>
              <View style={s.titleLeft}>
                <Text style={s.foodName}>{food.name}</Text>
                <View style={s.metaRow}>
                  {food.rating > 0 && (
                    <View style={s.ratingBadge}>
                      <Text style={s.ratingStar}>★</Text>
                      <Text style={s.ratingVal}>{food.rating.toFixed(1)}</Text>
                      <Text style={s.ratingCount}>
                        ({food.numReviews} {food.numReviews === 1 ? 'review' : 'reviews'})
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      s.availPill,
                      food.isAvailable === false && s.unavailPill,
                    ]}
                  >
                    <View
                      style={[
                        s.availDot,
                        food.isAvailable === false && s.unavailDot,
                      ]}
                    />
                    <Text
                      style={[
                        s.availLabel,
                        food.isAvailable === false && s.unavailLabel,
                      ]}
                    >
                      {food.isAvailable !== false ? 'Available' : 'Sold Out'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={s.priceTag}>
                <Text style={s.priceSign}>$</Text>
                <Text style={s.priceValue}>{(food.price || 0).toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Description Card */}
          <View style={s.descCard}>
            <Text style={s.descTitle}>About this dish</Text>
            <Text style={s.descText}>
              {food.description || 'No description available for this item.'}
            </Text>
          </View>

          {/* Info Card */}
          <View style={s.infoCard}>
            <Text style={s.infoTitle}>Details</Text>
            <View style={s.infoGrid}>
              <View style={s.infoItem}>
                <Text style={s.infoIcon}>📂</Text>
                <Text style={s.infoLabel}>Category</Text>
                <Text style={s.infoValue}>{food.category || 'General'}</Text>
              </View>
              <View style={s.infoItem}>
                <Text style={s.infoIcon}>⭐</Text>
                <Text style={s.infoLabel}>Rating</Text>
                <Text style={s.infoValue}>
                  {food.rating > 0 ? food.rating.toFixed(1) : 'No ratings'}
                </Text>
              </View>
              <View style={s.infoItem}>
                <Text style={s.infoIcon}>💬</Text>
                <Text style={s.infoLabel}>Reviews</Text>
                <Text style={s.infoValue}>{food.numReviews || 0}</Text>
              </View>
              <View style={s.infoItem}>
                <Text style={s.infoIcon}>✅</Text>
                <Text style={s.infoLabel}>Status</Text>
                <Text style={s.infoValue}>
                  {food.isAvailable !== false ? 'In Stock' : 'Out of Stock'}
                </Text>
              </View>
            </View>
          </View>

          {/* Reviews section placeholder */}
          {food.reviews && food.reviews.length > 0 && (
            <View style={s.reviewsCard}>
              <Text style={s.reviewsTitle}>
                Customer Reviews ({food.reviews.length})
              </Text>
              {food.reviews.slice(0, 3).map((review, idx) => (
                <View key={idx} style={s.reviewItem}>
                  <View style={s.reviewHeader}>
                    <View style={s.reviewAvatar}>
                      <Text style={s.reviewAvatarText}>
                        {(review.name || 'U')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={s.reviewMeta}>
                      <Text style={s.reviewName}>{review.name}</Text>
                      <View style={s.reviewStars}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Text
                            key={n}
                            style={[
                              s.reviewStar,
                              n <= review.rating && s.reviewStarFilled,
                            ]}
                          >
                            ★
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={s.reviewComment}>{review.comment}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={s.bottomBar}>
        <View style={s.bottomPriceWrap}>
          <Text style={s.bottomPriceLabel}>Total Price</Text>
          <Text style={s.bottomPrice}>${(food.price || 0).toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[
            s.addToCartBtn,
            food.isAvailable === false && s.addToCartDisabled,
          ]}
          activeOpacity={0.85}
          disabled={food.isAvailable === false}
        >
          <Text style={s.addToCartText}>
            {food.isAvailable !== false ? '🛒  Add to Cart' : 'Sold Out'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24;

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.cream },

  // Image
  imageWrap: { position: 'relative' },
  heroImage: {
    width: '100%',
    height: 300,
    backgroundColor: C.fog,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(59,31,26,0.2)',
  },
  backBtn: {
    position: 'absolute',
    top: STATUSBAR_HEIGHT + 6,
    left: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,248,240,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 20, color: C.walnut, fontWeight: '700' },
  categoryBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,248,240,0.92)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  categoryEmoji: { fontSize: 14, marginRight: 5 },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.walnut,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Content
  content: {
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: C.cream,
    paddingHorizontal: 18,
    paddingTop: 24,
  },

  // Title card
  titleCard: {
    backgroundColor: C.milk,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleLeft: { flex: 1, marginRight: 14 },
  foodName: {
    fontSize: 24,
    fontWeight: '800',
    color: C.textDark,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingStar: { fontSize: 13, color: C.star, marginRight: 3 },
  ratingVal: { fontSize: 13, fontWeight: '700', color: C.walnut, marginRight: 3 },
  ratingCount: { fontSize: 11, color: C.textMuted },

  availPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unavailPill: { backgroundColor: C.dangerBg },
  availDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.success,
    marginRight: 5,
  },
  unavailDot: { backgroundColor: C.danger },
  availLabel: { fontSize: 11, fontWeight: '700', color: C.success },
  unavailLabel: { color: C.danger },

  priceTag: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.fog,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  priceSign: {
    fontSize: 14,
    fontWeight: '700',
    color: C.caramel,
    marginTop: 3,
    marginRight: 1,
  },
  priceValue: { fontSize: 24, fontWeight: '800', color: C.walnut },

  // Description
  descCard: {
    backgroundColor: C.milk,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  descTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 10,
  },
  descText: {
    fontSize: 14,
    color: C.textMuted,
    lineHeight: 22,
  },

  // Info grid
  infoCard: {
    backgroundColor: C.milk,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoItem: {
    width: '47%',
    backgroundColor: C.fog,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  infoIcon: { fontSize: 22, marginBottom: 6 },
  infoLabel: { fontSize: 11, color: C.textMuted, fontWeight: '600', marginBottom: 3 },
  infoValue: { fontSize: 14, fontWeight: '700', color: C.textDark },

  // Reviews
  reviewsCard: {
    backgroundColor: C.milk,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 14,
  },
  reviewItem: {
    borderTopWidth: 1,
    borderTopColor: C.fog,
    paddingTop: 14,
    marginTop: 10,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.walnut,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reviewAvatarText: { color: C.cream, fontWeight: '700', fontSize: 15 },
  reviewMeta: {},
  reviewName: { fontSize: 14, fontWeight: '600', color: C.textDark },
  reviewStars: { flexDirection: 'row', marginTop: 2 },
  reviewStar: { fontSize: 12, color: '#D4D4D4', marginRight: 2 },
  reviewStarFilled: { color: C.star },
  reviewComment: { fontSize: 13, color: C.textMuted, lineHeight: 19 },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.milk,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: C.fog,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomPriceWrap: { flex: 1 },
  bottomPriceLabel: { fontSize: 12, color: C.textMuted, fontWeight: '500' },
  bottomPrice: { fontSize: 22, fontWeight: '800', color: C.textDark },
  addToCartBtn: {
    backgroundColor: C.walnut,
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  addToCartDisabled: {
    backgroundColor: C.latte,
    shadowOpacity: 0,
  },
  addToCartText: {
    color: C.cream,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default FoodDetailScreen;
