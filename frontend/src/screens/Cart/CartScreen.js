import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Image, StatusBar, Platform, Alert, TextInput
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { MaterialIcons } from '@expo/vector-icons';
import { IMAGE_BASE_URL } from '../../services/api';

const C = {
  primary:   '#FA4A0C',
  bg:        '#F9F9FB',
  surface:   '#FFFFFF',
  textDark:  '#1A1A1A',
  textMuted: '#9A9A9D',
  textLight: '#D1D5DB',
  danger:    '#FF4B4B',
  border:    '#E8E8E8',
};

const CartScreen = ({ navigation }) => {
  const { cartItems, addToCart, removeFromCart, deleteFromCart, clearCart, cartTotal, cartCount } = useCart();
  const [promoCode, setPromoCode] = useState('');

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  const handleApplyPromo = () => {
    const trimmedPromo = promoCode.trim();
    if (!trimmedPromo) {
      Alert.alert('Invalid Promo Code', 'Please enter a promo code before applying.');
      return;
    }
    Alert.alert('Promo Code', `Promo code "${trimmedPromo}" applied successfully.`);
  };

  const renderItem = ({ item }) => {
    const imageUri = item.image && item.image.startsWith('http')
      ? item.image
      : `${IMAGE_BASE_URL}${item.image || ''}`;

    return (
      <View style={s.card}>
        <Image source={{ uri: imageUri }} style={s.itemImage} />
        <View style={s.itemBody}>
          <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={s.itemPrice}>Rs. {(item.price || 0).toFixed(2)} each</Text>
          
          {/* Qty Controls */}
          <View style={s.qtyRow}>
            <TouchableOpacity style={s.qtyBtn} onPress={() => removeFromCart(item._id)}>
              <MaterialIcons name="remove" size={18} color={C.textDark} />
            </TouchableOpacity>
            <Text style={s.qtyVal}>{item.qty}</Text>
            <TouchableOpacity style={s.qtyBtn} onPress={() => addToCart(item)}>
              <MaterialIcons name="add" size={18} color={C.textDark} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Text style={s.lineTotal}>Rs. {(item.price * item.qty).toFixed(2)}</Text>
          <TouchableOpacity style={s.deleteBtn} onPress={() => deleteFromCart(item._id)}>
            <MaterialIcons name="delete-outline" size={20} color={C.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Top Bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={C.textDark} />
        </TouchableOpacity>
        <Text style={s.topBarTitle}>My Cart ({cartCount})</Text>
        {cartItems.length > 0 ? (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={s.clearText}>Clear</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={s.empty}>
          <MaterialIcons name="shopping-cart" size={80} color={C.border} />
          <Text style={s.emptyTitle}>Your cart is empty</Text>
          <Text style={s.emptySubtitle}>Add items from the menu to get started</Text>
          <TouchableOpacity style={s.browseBtn} onPress={() => navigation.navigate('UserMenu')}>
            <Text style={s.browseBtnText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View style={s.promoInputRow}>
                <View style={s.promoInputWrap}>
                  <MaterialIcons name="local-offer" size={18} color={C.textLight} style={{ marginRight: 8 }} />
                  <TextInput
                    style={s.promoInput}
                    placeholder="Enter Promo Code"
                    placeholderTextColor={C.textLight}
                    value={promoCode}
                    onChangeText={setPromoCode}
                    autoCapitalize="characters"
                  />
                </View>
                <TouchableOpacity style={s.applyBtn} onPress={handleApplyPromo}>
                  <Text style={s.applyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            }
          />

          {/* Order Summary Footer */}
          <View style={s.footer}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>{cartCount} item{cartCount > 1 ? 's' : ''}</Text>
              <Text style={s.summaryValue}>Rs. {cartTotal.toFixed(2)}</Text>
            </View>
            <View style={[s.summaryRow, s.totalRow]}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalValue}>Rs. {cartTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={s.checkoutBtn}
              onPress={() => navigation.navigate('Payment', { amount: cartTotal })}
              activeOpacity={0.85}
            >
              <MaterialIcons name="lock" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={s.checkoutText}>Proceed to Payment</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  topBar: {
    backgroundColor: C.bg,
    paddingTop: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 24) + 10,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  topBarTitle: { fontSize: 18, fontWeight: '700', color: C.textDark },
  clearText: { fontSize: 14, color: C.danger, fontWeight: '700' },

  list: { padding: 16, paddingBottom: 240 },
  card: {
    backgroundColor: C.surface, borderRadius: 20, padding: 16, marginBottom: 14,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 3,
  },
  itemImage: { width: 80, height: 80, borderRadius: 16, backgroundColor: C.border, marginRight: 14 },
  itemBody: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  itemPrice: { fontSize: 13, color: C.textMuted, marginBottom: 10 },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: C.bg,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  qtyVal: { fontSize: 16, fontWeight: '800', color: C.textDark, marginHorizontal: 12 },
  lineTotal: { fontSize: 16, fontWeight: '800', color: C.primary, marginBottom: 8 },
  deleteBtn: { padding: 4 },

  // Empty
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginTop: 20 },
  emptySubtitle: { fontSize: 14, color: C.textMuted, marginTop: 8, textAlign: 'center' },
  browseBtn: {
    marginTop: 24, backgroundColor: C.primary, borderRadius: 16,
    paddingHorizontal: 32, paddingVertical: 14,
  },
  browseBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // Promo
  promoInputRow: { 
    flexDirection: 'row', alignItems: 'center', gap: 12, 
    marginTop: 10, marginBottom: 20 
  },
  promoInputWrap: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', 
    backgroundColor: C.surface, borderRadius: 12, 
    paddingHorizontal: 12, paddingVertical: 12,
    borderWidth: 1, borderColor: C.border,
  },
  promoInput: { flex: 1, fontSize: 14, color: C.textDark },
  applyBtn: { 
    backgroundColor: C.textDark, borderRadius: 12, 
    paddingHorizontal: 20, paddingVertical: 12 
  },
  applyText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 10,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: C.textMuted, fontWeight: '500' },
  summaryValue: { fontSize: 14, color: C.textDark, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12, marginBottom: 18 },
  totalLabel: { fontSize: 17, fontWeight: '800', color: C.textDark },
  totalValue: { fontSize: 17, fontWeight: '900', color: C.primary },
  checkoutBtn: {
    backgroundColor: C.primary, borderRadius: 18, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default CartScreen;
