import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, StatusBar, Platform, ScrollView,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { BASE_URL } from '../../services/api';

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

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

export default function AddReviewScreen({ route, navigation }) {
  const { foodId, foodName } = route.params;
  const { userToken } = useContext(AuthContext);

  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting.');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Comment Required', 'Please write a short review comment.');
      return;
    }
    if (!userToken) {
      Alert.alert('Session Expired', 'Please log in again to post a review.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/reviews`,
        { food_id: foodId, rating, comment },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      navigation.goBack();
    } catch (err) {
      Alert.alert(
        'Could Not Submit',
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color={C.textDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Write a Review</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Food name card */}
        <View style={s.foodCard}>
          <View style={s.foodIcon}>
            <MaterialIcons name="restaurant" size={22} color={C.primary} />
          </View>
          <View style={s.foodCardText}>
            <Text style={s.foodCardLabel}>Reviewing</Text>
            <Text style={s.foodCardName} numberOfLines={2}>{foodName}</Text>
          </View>
        </View>

        {/* Star rating picker */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Your Rating</Text>

          <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => setRating(i)} activeOpacity={0.7}>
                <MaterialIcons
                  name={i <= rating ? 'star' : 'star-outline'}
                  size={46}
                  color={i <= rating ? C.star : C.border}
                />
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <View style={[s.ratingLabelBox, { backgroundColor: rating >= 4 ? '#F0FDF4' : rating === 3 ? '#FFFBEB' : '#FFF0F0' }]}>
              <Text style={[s.ratingLabelText, { color: rating >= 4 ? '#15803D' : rating === 3 ? '#92400E' : '#B91C1C' }]}>
                {RATING_LABELS[rating]}
              </Text>
              <View style={s.ratingDots}>
                {[1, 2, 3, 4, 5].map(i => (
                  <View key={i} style={[s.dot, { backgroundColor: i <= rating ? C.star : C.border }]} />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Comment */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Your Experience</Text>
          <TextInput
            style={s.textArea}
            value={comment}
            onChangeText={setComment}
            placeholder="What did you think about the food? Was it fresh, tasty, well-presented?"
            placeholderTextColor={C.textLight}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={s.charCount}>{comment.length}/500</Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[s.submitBtn, (loading || rating === 0) && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading || rating === 0}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <MaterialIcons name="send" size={18} color="#fff" />
                <Text style={s.submitText}>Submit Review</Text>
              </>
          }
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
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

  scroll: { padding: 20 },

  foodCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.surface,
    borderRadius: 14, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  foodIcon:     { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF2EE', justifyContent: 'center', alignItems: 'center' },
  foodCardText: { flex: 1 },
  foodCardLabel:{ fontSize: 11, fontWeight: '700', color: C.textLight, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  foodCardName: { fontSize: 16, fontWeight: '800', color: C.textDark, lineHeight: 22 },

  card: {
    backgroundColor: C.surface, borderRadius: 16, padding: 20,
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardTitle: { fontSize: 13, fontWeight: '800', color: C.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 18 },

  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 14 },

  ratingLabelBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  ratingLabelText:{ fontSize: 15, fontWeight: '800' },
  ratingDots:     { flexDirection: 'row', gap: 5 },
  dot:            { width: 8, height: 8, borderRadius: 4 },

  textArea: {
    backgroundColor: C.bg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    padding: 14, minHeight: 120,
    fontSize: 14, color: C.textDark,
    lineHeight: 22,
  },
  charCount: { textAlign: 'right', fontSize: 11, color: C.textLight, marginTop: 6 },

  submitBtn: {
    backgroundColor: C.primary, borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
