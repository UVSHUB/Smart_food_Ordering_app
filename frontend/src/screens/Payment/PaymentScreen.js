import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView, StatusBar, Platform,
  TextInput, KeyboardAvoidingView, Image
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useAddresses } from '../../context/AddressContext';
import { useNotifications } from '../../context/NotificationContext';
import { MaterialIcons } from '@expo/vector-icons';
import { BASE_URL } from '../../services/api';
import MapPickerModal from '../../components/MapPickerModal';
import * as ImagePicker from 'expo-image-picker';



const C = {
  primary:   '#FA4A0C',
  bg:        '#F9F9FB',
  surface:   '#FFFFFF',
  textDark:  '#1A1A1A',
  textMuted: '#9A9A9D',
  textMid:   '#4A4A4D',
  success:   '#22C55E',
  danger:    '#FF4B4B',
  border:    '#E8E8E8',
};

const METHODS = [
  { key: 'Cash',   icon: 'payments',      label: 'Cash on Delivery' },
  { key: 'Card',   icon: 'credit-card',   label: 'Credit / Debit Card' },
  { key: 'Online', icon: 'phone-android', label: 'Online Transfer' },
];

const SectionTitle = ({ title }) => (
  <Text style={s.sectionTitle}>{title}</Text>
);

const PaymentScreen = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const { cartItems, clearCart, cartTotal } = useCart();
  const { addresses } = useAddresses();
  const { addNotification } = useNotifications();
  const amount = route?.params?.amount || cartTotal || 0;

  const [method,  setMethod]  = useState('Cash');
  const [address, setAddress] = useState('');
  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [proofImage, setProofImage] = useState(null);

  const pickProofImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload payment proof.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setProofImage(result.assets[0]);
    }
  };



  const handleConfirmPayment = async () => {
    if (!user?._id) {
      Alert.alert('Error', 'You must be logged in to place an order.');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Order amount must be greater than Rs. 0.');
      return;
    }
    
    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      Alert.alert('Missing Address', 'Please enter your delivery address.');
      return;
    }
    if (trimmedAddress.length < 5) {
      Alert.alert('Invalid Address', 'Delivery address must be at least 5 characters long.');
      return;
    }
    
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      Alert.alert('Missing Phone', 'Please enter your phone number.');
      return;
    }
    // Sri Lankan phone validation: 10 digits starting with 0
    const phoneRegex = /^(0\d{9})$/;
    if (!phoneRegex.test(trimmedPhone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit Sri Lankan phone number starting with 0 (e.g. 0771234567).');
      return;
    }

    if (method === 'Online' && !proofImage) {
      Alert.alert('Proof Required', 'Please upload a screenshot or photo of your payment proof for online transfers.');
      return;
    }



    try {
      setLoading(true);

      // Build items snapshot from cart
      const items = cartItems.map((item) => ({
        name:  item.name,
        price: item.price,
        qty:   item.qty,
      }));

      const formData = new FormData();
      formData.append('user_id', user._id);
      formData.append('amount', amount);
      formData.append('payment_method', method);
      formData.append('address', trimmedAddress);
      formData.append('phone', trimmedPhone);
      formData.append('items', JSON.stringify(items));

      if (method === 'Online' && proofImage) {
        const uriParts = proofImage.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('payment_proof', {
          uri: Platform.OS === 'android' ? proofImage.uri : proofImage.uri.replace('file://', ''),
          name: `proof-${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const { data } = await axios.post(`${BASE_URL}/payments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      
      // Add notification
      addNotification({
        title: 'Order Placed!',
        body: `Your order #${data.payment._id.slice(-8).toUpperCase()} for Rs. ${amount.toFixed(2)} was successful.`,
        type: 'success'
      });

      // Clear cart
      clearCart();

      // Navigate to success screen with full order info
      navigation.replace('OrderSuccess', {
        payment:  data.payment,
        delivery: data.delivery,
        items,
        amount,
        method,
        address: trimmedAddress,
      });
    } catch (err) {
      Alert.alert('Payment Failed', err.response?.data?.message || 'Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

        {/* Top Bar */}
        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={20} color={C.textDark} />
          </TouchableOpacity>
          <Text style={s.topBarTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Order Total Card */}
          <View style={s.totalCard}>
            <Text style={s.totalLabel}>Order Total</Text>
            <Text style={s.totalAmount}>Rs. {(amount || 0).toFixed(2)}</Text>
            <View style={s.restaurantRow}>
              <MaterialIcons name="restaurant" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={s.restaurantText}>  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} · SLIIT KADE</Text>
            </View>
          </View>

          {/* Items Summary */}
          {cartItems.length > 0 && (
            <>
              <SectionTitle title="Your Order" />
              <View style={s.itemsCard}>
                {cartItems.map((item) => (
                  <View key={item._id} style={s.itemRow}>
                    <Text style={s.itemQty}>{item.qty}×</Text>
                    <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={s.itemPrice}>Rs. {(item.price * item.qty).toFixed(2)}</Text>
                  </View>
                ))}
                <View style={s.divider} />
                <View style={s.itemRow}>
                  <Text style={[s.itemName, { fontWeight: '800' }]}>Total</Text>
                  <Text style={[s.itemPrice, { color: C.primary, fontWeight: '900' }]}>
                    Rs. {(amount).toFixed(2)}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Delivery Details */}
          <SectionTitle title="Delivery Details" />
          
          {/* Saved Addresses Picker */}
          {addresses.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.addrScroll}>
              {addresses.map(a => (
                <TouchableOpacity 
                  key={a.id} 
                  style={[s.addrChip, address === a.address && s.addrChipActive]}
                  onPress={() => setAddress(a.address)}
                >
                  <MaterialIcons 
                    name={a.label.toLowerCase() === 'home' ? 'home' : 'place'} 
                    size={16} 
                    color={address === a.address ? '#fff' : C.textMid} 
                  />
                  <Text style={[s.addrChipText, address === a.address && s.addrChipTextActive]}>{a.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={[s.addrChip, address === '' && s.addrChipActive]}
                onPress={() => setAddress('')}
              >
                <MaterialIcons name="edit" size={16} color={address === '' ? '#fff' : C.textMid} />
                <Text style={[s.addrChipText, address === '' && s.addrChipTextActive]}>Custom</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          <View style={s.formCard}>
            <View style={{ position: 'relative' }}>
              <View style={s.inputRow}>
                <View style={s.inputIcon}>
                  <MaterialIcons name="location-on" size={20} color={C.primary} />
                </View>
                <TextInput
                  style={s.input}
                  placeholder="Delivery address (street, city)"
                  placeholderTextColor={C.textMuted}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                />
              </View>
              <TouchableOpacity 
                style={s.mapPickerBtn} 
                onPress={() => setMapVisible(true)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="map" size={16} color={C.primary} />
                <Text style={s.mapPickerBtnText}>Select on Map</Text>
              </TouchableOpacity>
            </View>


            <View style={[s.inputRow, { marginTop: 12 }]}>
              <View style={s.inputIcon}>
                <MaterialIcons name="phone" size={20} color={C.primary} />
              </View>
              <TextInput
                style={s.input}
                placeholder="Phone number"
                placeholderTextColor={C.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Payment Method */}
          <SectionTitle title="Payment Method" />
          {METHODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[s.methodCard, method === m.key && s.methodCardActive]}
              onPress={() => setMethod(m.key)}
              activeOpacity={0.8}
            >
              <View style={[s.methodIcon, method === m.key && s.methodIconActive]}>
                <MaterialIcons name={m.icon} size={24} color={method === m.key ? '#fff' : C.textMuted} />
              </View>
              <Text style={[s.methodLabel, method === m.key && s.methodLabelActive]}>{m.label}</Text>
              {method === m.key && (
                <MaterialIcons name="check-circle" size={22} color={C.primary} />
              )}
            </TouchableOpacity>
          ))}

          {/* Online Transfer Proof Upload */}
          {method === 'Online' && (
            <View style={s.proofCard}>
              <Text style={s.proofTitle}>Payment Proof</Text>
              <Text style={s.proofSub}>Please upload a screenshot of your bank transfer</Text>
              
              {proofImage ? (
                <View style={s.proofPreviewWrap}>
                  <Image source={{ uri: proofImage.uri }} style={s.proofPreview} />
                  <TouchableOpacity style={s.removeProofBtn} onPress={() => setProofImage(null)}>
                    <MaterialIcons name="cancel" size={24} color={C.danger} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={s.uploadBtn} onPress={pickProofImage}>
                  <MaterialIcons name="cloud-upload" size={32} color={C.primary} />
                  <Text style={s.uploadBtnText}>Upload Receipt / Screenshot</Text>
                </TouchableOpacity>
              )}
            </View>
          )}


          <View style={{ height: 120 }} />
        </ScrollView>

        <MapPickerModal
          visible={mapVisible}
          onClose={() => setMapVisible(false)}
          onLocationSelect={(addr) => setAddress(addr)}
        />


        {/* Confirm Button */}
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.confirmBtn, loading && { opacity: 0.7 }]}
            onPress={handleConfirmPayment}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="lock" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={s.confirmText}>Place Order · Rs. {(amount || 0).toFixed(2)}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  topBar: {
    backgroundColor: C.bg,
    paddingTop: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 24) + 10,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  topBarTitle: { fontSize: 18, fontWeight: '700', color: C.textDark },
  scroll: { padding: 20, paddingBottom: 40 },

  totalCard: {
    backgroundColor: C.primary,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  totalLabel:      { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginBottom: 8 },
  totalAmount:     { fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  restaurantRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  restaurantText:  { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.textDark, marginBottom: 12, letterSpacing: -0.3 },

  itemsCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  itemRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemQty:   { fontSize: 14, fontWeight: '700', color: C.primary, width: 28 },
  itemName:  { flex: 1, fontSize: 14, color: C.textDark, fontWeight: '500' },
  itemPrice: { fontSize: 14, fontWeight: '700', color: C.textDark },
  divider:   { height: 1, backgroundColor: C.border, marginVertical: 10 },


  addrScroll: { paddingBottom: 12, gap: 10 },
  addrChip: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, 
    backgroundColor: C.surface, paddingHorizontal: 16, paddingVertical: 10, 
    borderRadius: 12, borderWidth: 1, borderColor: C.border 
  },
  addrChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  addrChipText: { fontSize: 13, fontWeight: '700', color: C.textMid },
  addrChipTextActive: { color: '#fff' },
  formCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputIcon: { marginRight: 10, paddingTop: 2 },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.textDark,
    minHeight: 40,
    textAlignVertical: 'top',
  },

  methodCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  methodCardActive: { borderColor: C.primary, backgroundColor: '#FFF5F2' },
  methodIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#F3F3F5',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  methodIconActive: { backgroundColor: C.primary },
  methodLabel:       { flex: 1, fontSize: 15, fontWeight: '700', color: C.textMuted },
  methodLabelActive: { color: C.textDark },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    backgroundColor: C.bg,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  confirmBtn: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // Map Picker Button
  mapPickerBtn: {
    position: 'absolute',
    right: 0,
    top: -24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  mapPickerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primary,
  },

  // Proof Upload Styles
  proofCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 20,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
  },
  proofTitle: { fontSize: 15, fontWeight: '800', color: C.textDark, marginBottom: 4 },
  proofSub: { fontSize: 12, color: C.textMuted, marginBottom: 16 },
  uploadBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  uploadBtnText: { marginTop: 8, fontSize: 13, color: C.primary, fontWeight: '700' },
  proofPreviewWrap: { position: 'relative', width: '100%', height: 200, borderRadius: 12, overflow: 'hidden' },
  proofPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeProofBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', borderRadius: 12 },
});



export default PaymentScreen;
