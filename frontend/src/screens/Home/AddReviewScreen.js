import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, StatusBar, Platform, ScrollView
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

const BASE_URL = 'http://10.94.178.167:5001/api/reviews';

// ── Ultra Premium Modern Palette ──────────────────────
const C = {
  primary: '#FA4A0C',
  bg: '#F9F9FB',
  surface: '#FFFFFF',
  textDark: '#1A1A1A',
  textMuted: '#9A9A9D',
  star: '#FFB800',
  border: '#E8E8E8',
  danger: '#FF4B4B',
};

const AddReviewScreen = ({ route, navigation }) => {
  const { foodId, foodName } = route.params;
  const { user, userToken } = useContext(AuthContext);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Missing Field', 'Please provide a comment for your review.');
      return;
    }

    if (!userToken) {
      Alert.alert('Session Expired', 'Please login again to post a review.');
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      };

      await axios.post(
        BASE_URL,
        {
          food_id: foodId,
          rating,
          comment,
        },
        config
      );

      Alert.alert('Success 🎉', 'Your review has been posted!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message) {
        Alert.alert('Oops!', err.response.data.message);
      } else {
        Alert.alert('Error', 'Failed to post review. Please try again.');
        console.log(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInteractiveStars = () => {
    return (
      <View style={s.starsContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i)} activeOpacity={0.7}>
            <MaterialIcons
              name={i <= rating ? 'star' : 'star-border'}
              size={44}
              color={i <= rating ? C.star : '#E0E0E0'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={C.textDark} />
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Write a Review</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.infoCard}>
          <Text style={s.reviewingTxt}>Reviewing</Text>
          <Text style={s.foodName}>{foodName}</Text>
        </View>

        <View style={s.formCard}>
          <Text style={s.label}>Tap to Rate</Text>
          {renderInteractiveStars()}

          <Text style={s.label}>Your Experience</Text>
          <TextInput
            style={s.textArea}
            value={comment}
            onChangeText={setComment}
            placeholder="What did you like or dislike?"
            placeholderTextColor={C.textMuted}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[s.submitBtn, loading && s.submitBtnDisabled]}
            disabled={loading}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={s.submitBtnText}>Post Review</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  topBarTitle: { fontSize: 18, fontWeight: '700', color: C.textDark },

  content: { padding: 20 },
  infoCard: {
    backgroundColor: C.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  reviewingTxt: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  foodName: { fontSize: 20, fontWeight: '800', color: C.textDark },

  formCard: {
    backgroundColor: C.surface,
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  label: { fontSize: 15, fontWeight: '700', color: C.textDark, marginBottom: 12 },

  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 8,
  },

  textArea: {
    backgroundColor: '#F7F7F9',
    borderRadius: 16,
    padding: 16,
    height: 140,
    color: C.textDark,
    fontSize: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 28,
  },

  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default AddReviewScreen;
