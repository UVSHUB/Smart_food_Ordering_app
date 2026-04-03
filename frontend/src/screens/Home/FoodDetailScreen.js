import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, Alert, FlatList, Platform
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useIsFocused } from '@react-navigation/native';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24;
const BASE_URL = 'http://192.168.8.169:5001/api';

const C = {
  espresso:    '#3B1F1A',
  mocha:       '#4A2C2A',
  walnut:      '#6B4226',
  caramel:     '#A0673C',
  cream:       '#FFF8F0',
  milk:        '#FFFFFF',
  fog:         '#F5EDE4',
  textDark:    '#2D1810',
  textMuted:   '#8C7B6F',
  danger:      '#E74C3C',
  star:        '#FFB800'
};

const FoodDetailScreen = ({ route, navigation }) => {
  const { food } = route.params;
  const { user, userToken } = useContext(AuthContext);
  const isFocused = useIsFocused();

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Derive initial values from the food object passed via props, but ideally re-fetch later
  const [currentRating, setCurrentRating] = useState(food.rating || 0);
  const [totalReviews, setTotalReviews] = useState(food.numReviews || 0);

  useEffect(() => {
    if (isFocused) {
      fetchReviews();
      // Optionally refetch food to update rating instantly, but reviews array tells us enough.
    }
  }, [isFocused]);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const { data } = await axios.get(`${BASE_URL}/reviews/food/${food._id}`);
      setReviews(data);
      
      // Calculate dynamic average manually just to keep UI hyper-fresh
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
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete your review?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
             try {
                await axios.delete(`${BASE_URL}/reviews/${reviewId}`);
                fetchReviews();
             } catch (e) {
                Alert.alert("Error", e.response?.data?.message || "Failed to delete");
             }
          }
        }
      ]
    );
  };

  const hasReviewed = user ? reviews.some(r => r.user_id && r.user_id._id === user._id) : false;

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
       stars.push(
         <Text key={i} style={[s.starIcon, { color: i <= Math.round(rating) ? C.star : '#DFD4C9' }]}>
           ★
         </Text>
       );
    }
    return <View style={s.starsRow}>{stars}</View>;
  };

  const renderReview = ({ item }) => {
    const isOwner = user && user._id === item.user_id?._id;
    const canDelete = isOwner || (user && user.isAdmin);

    return (
      <View style={s.reviewCard}>
        <View style={s.reviewHeaderRow}>
          <View>
            <Text style={s.reviewerName}>{item.user_id?.name || 'Anonymous'}</Text>
            {renderStars(item.rating)}
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

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.mocha} />
      
      {/* Custom Header */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Menu Item</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <>
            {/* Food Image */}
            <Image
              source={{
                uri: food.image && food.image.startsWith('http')
                  ? food.image
                  : `http://192.168.8.169:5001${food.image || '/images/sample-food.jpg'}`
              }}
              style={s.foodImage}
            />

            {/* Food Details */}
            <View style={s.detailsBlock}>
              <View style={s.titleRow}>
                <Text style={s.foodName}>{food.name}</Text>
                <Text style={s.foodPrice}>${(food.price || 0).toFixed(2)}</Text>
              </View>

              <View style={s.ratingHeroRow}>
                {renderStars(currentRating)}
                <Text style={s.ratingText}>
                  {currentRating.toFixed(1)} <Text style={s.reviewCountTxt}>({totalReviews} reviews)</Text>
                </Text>
              </View>

              <Text style={s.foodDesc}>{food.description}</Text>
            </View>

            {/* Add Review Action */}
            <View style={s.reviewsHeaderArea}>
              <Text style={s.reviewsTitle}>Customer Reviews</Text>
              
              {!userToken ? (
                <Text style={s.loginPrompt}>Log in to write a review</Text>
              ) : hasReviewed ? (
                <Text style={s.loggedInPrompt}>You have reviewed this item.</Text>
              ) : (
                <TouchableOpacity 
                  style={s.addReviewBtn}
                  onPress={() => navigation.navigate('AddReview', { foodId: food._id, foodName: food.name })}
                >
                  <Text style={s.addReviewBtnText}>Add Review</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {loadingReviews && (
               <ActivityIndicator color={C.caramel} style={{ marginTop: 20 }} />
            )}
            
            {!loadingReviews && reviews.length === 0 && (
               <View style={s.noReviewsBox}>
                 <Text style={s.noReviewsTxt}>No reviews yet. Be the first!</Text>
               </View>
            )}
          </>
        }
        renderItem={renderReview}
      />
    </View>
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
  
  foodImage: {
    width: '100%',
    height: 250,
    backgroundColor: C.fog,
  },
  detailsBlock: {
    backgroundColor: C.milk,
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  foodName: { fontSize: 24, fontWeight: '800', color: C.textDark, flex: 1, marginRight: 10 },
  foodPrice: { fontSize: 24, fontWeight: '800', color: C.caramel },
  
  ratingHeroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  ratingText: { fontSize: 15, fontWeight: '700', color: C.textDark, marginLeft: 8 },
  reviewCountTxt: { fontWeight: '400', color: C.textMuted },
  
  foodDesc: { fontSize: 15, lineHeight: 22, color: C.textMuted },

  reviewsHeaderArea: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsTitle: { fontSize: 19, fontWeight: '700', color: C.textDark },
  addReviewBtn: {
    backgroundColor: C.walnut,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addReviewBtnText: { color: C.cream, fontSize: 13, fontWeight: '700' },
  loginPrompt: { color: C.textMuted, fontSize: 13, fontStyle: 'italic' },
  loggedInPrompt: { color: C.caramel, fontSize: 13, fontWeight: '600' },

  noReviewsBox: { padding: 24, alignItems: 'center' },
  noReviewsTxt: { color: C.textMuted, fontSize: 15 },

  reviewCard: {
    backgroundColor: C.milk,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0EBE6'
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewerName: { fontSize: 15, fontWeight: '700', color: C.textDark, marginBottom: 2 },
  reviewDate: { fontSize: 12, color: '#B5A99A' },
  reviewComment: { fontSize: 14, color: C.textMuted, lineHeight: 20 },
  
  starsRow: { flexDirection: 'row' },
  starIcon: { fontSize: 16, marginRight: 2 },

  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5EDE4'
  },
  editAction: { color: C.latte, fontWeight: '600', marginRight: 16 },
  deleteAction: { color: C.danger, fontWeight: '600' },
});

export default FoodDetailScreen;
