import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, SafeAreaView, StatusBar, Image, Platform
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24;
const BASE_URL = 'http://192.168.8.169:5001/api/foods';

// ── Ultra Premium Modern Palette ──────────────────────
const C = {
  primary:     '#FA4A0C', 
  bg:          '#F9F9FB', 
  surface:     '#FFFFFF', 
  textDark:    '#1A1A1A', 
  textMuted:   '#9A9A9D', 
  danger:      '#FF4B4B',
  success:     '#2E7D32',
  border:      '#E8E8E8',
};

const CATEGORIES = ['Meals', 'Drinks', 'Snacks', 'Desserts', 'Other'];
const CATEGORY_ICON = {
  Meals: 'restaurant',
  Drinks: 'local-cafe',
  Snacks: 'fastfood',
  Desserts: 'cake',
  Other: 'room-service',
};

const EditFoodScreen = ({ route, navigation }) => {
  const { food } = route.params;

  const [name, setName] = useState(food.name || '');
  const [price, setPrice] = useState(food.price ? food.price.toString() : '');
  const [description, setDescription] = useState(food.description || '');
  const [category, setCategory] = useState(food.category || 'Meals');
  const [image, setImage] = useState(food.image || '');
  const [loading, setLoading] = useState(false);

  const handleEditSubmit = async () => {
    if (!name.trim() || !price.trim() || !description.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (isNaN(parseFloat(price))) {
      Alert.alert('Invalid Price', 'Please enter a valid number for price.');
      return;
    }

    try {
      setLoading(true);
      const updatedFoodData = {
        name,
        price: Number(price),
        description,
        category,
        image,
      };

      const config = { headers: { 'Content-Type': 'application/json' } };
      await axios.put(`${BASE_URL}/${food._id}`, updatedFoodData, config);
      
      Alert.alert('Updated!', `"${name}" has been updated successfully.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.log('Error updating food:', err);
      Alert.alert('Error', 'Failed to update food item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      
      {/* Sleek Top Bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={C.textDark} />
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Edit Item</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        
        {/* Form Wrap */}
        <View style={s.formBlock}>
          
          <View style={s.field}>
            <Text style={s.label}>Item Name</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Margherita Pizza"
              placeholderTextColor={C.textMuted}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Price</Text>
            <View style={s.priceRow}>
              <View style={s.pricePrefix}>
                <Text style={s.pricePrefixText}>Rs.</Text>
              </View>
              <TextInput
                style={[s.input, s.priceInput]}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor={C.textMuted}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[s.chip, category === cat && s.chipSelected]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons 
                    name={CATEGORY_ICON[cat] || 'room-service'} 
                    size={16} 
                    color={category === cat ? C.surface : C.textMuted} 
                    style={{ marginRight: 6 }} 
                  />
                  <Text style={[s.chipText, category === cat && s.chipTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Image URL <Text style={s.optional}>(optional)</Text></Text>
            {image ? (
              <View style={s.imagePreviewWrap}>
                <Image source={{ uri: image }} style={s.imagePreview} />
              </View>
            ) : (
              <View style={[s.imagePreviewWrap, s.emptyImagePreview]}>
                <MaterialIcons name="image" size={32} color={C.border} style={{ marginBottom: 8 }} />
                <Text style={s.emptyImageText}>No preview</Text>
              </View>
            )}
            <TextInput
              style={s.input}
              value={image}
              onChangeText={setImage}
              placeholder="https://example.com/photo.jpg"
              placeholderTextColor={C.textMuted}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Description</Text>
            <TextInput
              style={[s.input, s.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe this delicious item..."
              placeholderTextColor={C.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
      
      {/* Floating Action Button-like Full Width Button */}
      <View style={s.footerContainer}>
        <TouchableOpacity
          style={[s.submitBtn, loading && s.submitBtnDisabled]}
          onPress={handleEditSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={C.surface} />
          ) : (
            <Text style={s.submitBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  topBar: {
    paddingTop: STATUSBAR_HEIGHT + 10,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.bg,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  topBarTitle: { fontSize: 18, fontWeight: '700', color: C.textDark },
  
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 100 },
  
  formBlock: {
    backgroundColor: C.surface,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 4,
  },

  field: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: C.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  optional: { textTransform: 'none', fontWeight: '400' },
  
  input: {
    backgroundColor: '#FBFBFB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: C.textDark,
    borderWidth: 1,
    borderColor: C.border,
  },

  priceRow: { flexDirection: 'row', alignItems: 'center' },
  pricePrefix: {
    backgroundColor: '#FBFBFB',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: C.border,
  },
  pricePrefixText: { fontSize: 16, color: C.textDark, fontWeight: '700' },
  priceInput: { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },

  chipRow: { flexDirection: 'row' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#FBFBFB',
    marginRight: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipSelected: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 14, color: C.textMuted, fontWeight: '600' },
  chipTextSelected: { color: C.surface },

  imagePreviewWrap: { width: '100%', height: 160, borderRadius: 16, marginBottom: 16, overflow: 'hidden', backgroundColor: '#FBFBFB' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  emptyImagePreview: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border, borderStyle: 'dashed' },
  emptyImageText: { color: C.textMuted, fontSize: 13, fontWeight: '600' },

  textArea: { height: 120, paddingTop: 16 },

  footerContainer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: C.surface,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: C.surface, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});

export default EditFoodScreen;
