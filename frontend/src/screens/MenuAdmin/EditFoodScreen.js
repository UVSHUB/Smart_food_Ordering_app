import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, SafeAreaView, StatusBar, Image, Platform
} from 'react-native';
import axios from 'axios';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24;

const BASE_URL = 'http://192.168.8.169:5001/api/foods';

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
};

const CATEGORIES = ['Meals', 'Drinks', 'Snacks', 'Desserts', 'Other'];
const CATEGORY_EMOJI = {
  Meals: '🍛',
  Drinks: '☕',
  Snacks: '🥨',
  Desserts: '🍰',
  Other: '🍽️',
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
    if (!name || !price || !category || !description) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
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

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      await axios.put(`${BASE_URL}/${food._id}`, updatedFoodData, config);
      Alert.alert('Updated! ✅', `"${name}" has been updated successfully.`, [
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
      <StatusBar barStyle="light-content" backgroundColor={C.mocha} />
      
      {/* Custom Top Bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Edit Item</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header card */}
        <View style={s.headerCard}>
          <Text style={s.headerEmoji}>✏️</Text>
          <View style={s.headerText}>
            <Text style={s.headerTitle}>Edit Menu Item</Text>
            <Text style={s.headerSub}>Update the details for "{food.name}"</Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={s.formCard}>
          {/* Name */}
          <View style={s.field}>
            <Text style={s.label}>
              Item Name <Text style={s.required}>*</Text>
            </Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Margherita Pizza"
              placeholderTextColor="#C4B8AC"
            />
          </View>

          {/* Price */}
          <View style={s.field}>
            <Text style={s.label}>
              Price <Text style={s.required}>*</Text>
            </Text>
            <View style={s.priceRow}>
              <View style={s.pricePrefix}>
                <Text style={s.pricePrefixText}>$</Text>
              </View>
              <TextInput
                style={[s.input, s.priceInput]}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor="#C4B8AC"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Category */}
          <View style={s.field}>
            <Text style={s.label}>
              Category <Text style={s.required}>*</Text>
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.chipRow}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[s.chip, category === cat && s.chipSelected]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={s.chipEmoji}>
                    {CATEGORY_EMOJI[cat]}
                  </Text>
                  <Text style={[s.chipText, category === cat && s.chipTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Image URL with Live Preview */}
          <View style={s.field}>
            <Text style={s.label}>
              Image URL <Text style={s.optional}>(optional)</Text>
            </Text>

            {image ? (
              <View style={s.imagePreviewWrap}>
                <Image source={{ uri: image }} style={s.imagePreview} />
              </View>
            ) : (
              <View style={[s.imagePreviewWrap, s.emptyImagePreview]}>
                <Text style={s.emptyImageText}>🖼️  No preview available</Text>
              </View>
            )}

            <TextInput
              style={s.input}
              value={image}
              onChangeText={setImage}
              placeholder="https://example.com/photo.jpg"
              placeholderTextColor="#C4B8AC"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* Description */}
          <View style={s.field}>
            <Text style={s.label}>
              Description <Text style={s.required}>*</Text>
            </Text>
            <TextInput
              style={[s.input, s.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe this delicious item..."
              placeholderTextColor="#C4B8AC"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[s.submitBtn, loading && s.submitBtnDisabled]}
          onPress={handleEditSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={s.submitBtnText}>Save Changes  ✅</Text>
          )}
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.cream,
  },
  topBar: {
    backgroundColor: C.mocha,
    paddingTop: STATUSBAR_HEIGHT,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 24, color: C.cream, fontWeight: '700' },
  topBarTitle: { fontSize: 19, fontWeight: '700', color: C.cream },

  scroll: { flex: 1 },
  content: {
    padding: 18,
    paddingBottom: 40,
  },

  // Header card
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.milk,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  headerEmoji: {
    fontSize: 36,
    marginRight: 14,
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textDark,
    letterSpacing: -0.2,
  },
  headerSub: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 2,
  },

  // Form card
  formCard: {
    backgroundColor: C.milk,
    borderRadius: 18,
    padding: 20,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },

  field: { marginBottom: 22 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textDark,
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  required: { color: C.caramel },
  optional: { color: C.textMuted, fontWeight: '400', fontSize: 12 },

  input: {
    backgroundColor: C.fog,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: C.textDark,
    borderWidth: 1.5,
    borderColor: '#E8DDD3',
  },

  priceRow: { flexDirection: 'row', alignItems: 'center' },
  pricePrefix: {
    backgroundColor: C.walnut,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pricePrefixText: { fontSize: 16, color: C.cream, fontWeight: '700' },
  priceInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeftWidth: 0,
  },

  chipRow: { flexDirection: 'row', marginTop: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: C.fog,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#E8DDD3',
  },
  chipSelected: {
    backgroundColor: C.walnut,
    borderColor: C.walnut,
  },
  chipEmoji: { fontSize: 14, marginRight: 5 },
  chipText: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: '600',
  },
  chipTextSelected: { color: C.cream },

  imagePreviewWrap: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: C.fog,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emptyImagePreview: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8DDD3',
    borderStyle: 'dashed',
  },
  emptyImageText: {
    color: C.textMuted,
    fontSize: 14,
    fontWeight: '600'
  },

  textArea: { height: 110, paddingTop: 14 },

  submitBtn: {
    backgroundColor: C.walnut,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 22,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  submitBtnDisabled: {
    backgroundColor: C.latte,
    shadowOpacity: 0,
  },
  submitBtnText: {
    color: C.cream,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default EditFoodScreen;
