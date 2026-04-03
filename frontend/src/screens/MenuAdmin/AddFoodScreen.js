import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

const BASE_URL = 'http://10.94.178.167:5000/api/foods';

const AddFoodScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddSubmit = async () => {
    if (!name || !price || !category || !description) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const foodData = {
        name,
        price: Number(price),
        description,
        category,
        image: image || '/images/sample-food.jpg', // fallback
      };

      // Since the backend uses protect and admin middlewares for POST /foods, 
      // a valid admin token must normally be passed. For testing purposes without auth:
      // You must temporarily disable the `protect` and `admin` middleware in `foodRoutes.js`
      // or implement dummy token insertion based on your project's auth.

      const config = {
        headers: {
          'Content-Type': 'application/json',
        }
      };

      await axios.post(BASE_URL, foodData, config);
      Alert.alert('Success', 'Food item added successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.log('Error adding food:', err);
      Alert.alert('Error', 'Failed to add food item. Make sure admin route protection is disabled or you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add New Menu Item</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Double Cheeseburger"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Price *</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="e.g. 9.99"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Category *</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="e.g. Meals, Drinks, Snacks"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Image URL (optional)</Text>
        <TextInput
          style={styles.input}
          value={image}
          onChangeText={setImage}
          placeholder="https://example.com/image.jpg"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter item description..."
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleAddSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Add Food Item</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 24, marginTop: 10 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: '#FF6C44',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    elevation: 2,
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default AddFoodScreen;
