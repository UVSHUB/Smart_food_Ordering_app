import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

// UPDATE THIS WITH YOUR LOCAL IP ADDRESS
const BASE_URL = 'http://172.28.9.153:5000/api/foods';

const FoodListScreen = ({ navigation }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(BASE_URL);
      setFoods(response.data);
    } catch (err) {
      console.log('Error fetching foods:', err);
      setError('Failed to fetch foods. Check API connection and IP address.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFoods();
    }, [])
  );

  const handleDelete = async (id) => {
    Alert.alert('Delete Food', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/${id}`);
            fetchFoods();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete food item.');
          }
        }
      }
    ]);
  };

  if (loading && foods.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6C44" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image ? (item.image.startsWith('http') ? item.image : `http://172.28.9.153:5000${item.image}`) : 'https://via.placeholder.com/150' }}
        style={styles.image}
      />
      <View style={styles.cardInfo}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>${(item.price || 0).toFixed(2)}</Text>
        </View>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.button, styles.editBtn]}
            onPress={() => navigation.navigate('EditFood', { food: item })}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteBtn]}
            onPress={() => handleDelete(item._id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={foods}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No food items found. Add some!</Text> : null}
        refreshing={loading}
        onRefresh={fetchFoods}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddFood')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16, paddingBottom: 80 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: { width: '100%', height: 160, backgroundColor: '#E0E0E0' },
  cardInfo: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#FF6C44' },
  category: { fontSize: 12, color: '#888', marginBottom: 8, textTransform: 'uppercase', fontWeight: '600' },
  description: { fontSize: 14, color: '#666', marginBottom: 16 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  button: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8 },
  editBtn: { backgroundColor: '#4A90E2' },
  deleteBtn: { backgroundColor: '#E02020' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6C44',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#FF6C44',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabText: { fontSize: 32, color: '#FFF', fontWeight: 'bold', marginTop: -4 },
  errorText: { color: '#E02020', textAlign: 'center', marginTop: 20 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
});

export default FoodListScreen;
