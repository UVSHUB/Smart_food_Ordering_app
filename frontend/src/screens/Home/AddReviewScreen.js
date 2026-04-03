import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, SafeAreaView, StatusBar, Platform
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24;
const BASE_URL = 'http://192.168.8.169:5001/api/reviews';

const C = {
  mocha:       '#4A2C2A',
  walnut:      '#6B4226',
  caramel:     '#A0673C',
  cream:       '#FFF8F0',
  milk:        '#FFFFFF',
  fog:         '#F5EDE4',
  textDark:    '#2D1810',
  textMuted:   '#8C7B6F',
  star:        '#FFB800'
};

const AddReviewScreen = ({ route, navigation }) => {
  const { foodId, foodName } = route.params;
  const { user } = useContext(AuthContext);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Missing Field', 'Please provide a comment for your review.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(BASE_URL, {
        food_id: foodId,
        rating,
        comment
      });
      Alert.alert('Success', 'Your review has been posted!', [
        { text: 'OK', onPress: () => navigation.goBack() }
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
    const stars = [];
    for (let i = 1; i <= 5; i++) {
       stars.push(
         <TouchableOpacity key={i} onPress={() => setRating(i)}>
           <Text style={[s.interactiveStar, { color: i <= rating ? C.star : '#DFD4C9' }]}>
             ★
           </Text>
         </TouchableOpacity>
       );
    }
    return <View style={s.starsContainer}>{stars}</View>;
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.mocha} />
      
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Write a Review</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.content}>
        <View style={s.formCard}>
          <Text style={s.reviewingTxt}>Reviewing:</Text>
          <Text style={s.foodName}>{foodName}</Text>

          <Text style={s.label}>Your Rating</Text>
          {renderInteractiveStars()}

          <Text style={s.label}>Your Comment</Text>
          <TextInput
            style={s.textArea}
            value={comment}
            onChangeText={setComment}
            placeholder="Share your thoughts about this item..."
            placeholderTextColor="#C4B8AC"
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[s.submitBtn, loading && s.submitBtnDisabled]}
            disabled={loading}
            onPress={handleSubmit}
          >
            {loading ? (
              <ActivityIndicator color={C.cream} />
            ) : (
              <Text style={s.submitBtnText}>Post Review</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.cream },
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
  
  content: { padding: 20 },
  formCard: {
    backgroundColor: C.milk,
    padding: 24,
    borderRadius: 20,
    shadowColor: C.mocha,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  reviewingTxt: { fontSize: 13, color: C.textMuted },
  foodName: { fontSize: 22, fontWeight: '800', color: C.textDark, marginBottom: 20 },
  
  label: { fontSize: 15, fontWeight: '700', color: C.textDark, marginBottom: 12 },
  
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  interactiveStar: {
    fontSize: 40,
    marginRight: 6,
  },
  
  textArea: {
    backgroundColor: C.fog,
    borderRadius: 14,
    padding: 16,
    height: 120,
    color: C.textDark,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8DDD3',
    marginBottom: 24,
  },

  submitBtn: {
    backgroundColor: C.walnut,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: C.mocha,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: C.cream, fontSize: 16, fontWeight: '700' }
});

export default AddReviewScreen;
