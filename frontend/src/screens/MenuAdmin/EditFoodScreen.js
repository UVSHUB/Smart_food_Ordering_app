import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

const BASE_URL = 'http://172.28.9.153:5000/api/foods';

const EditFoodScreen = ({ route, navigation }) => {
  const { food } = route.params;

  const [name, setName] = useState(food.name || '');
  const [price, setPrice] = useState(food.price ? food.price.toString() : '');
  const [description, setDescription] = useState(food.description || '');
  const [category, setCategory] = useState(food.category || '');
  const [image, setImage] = useState(food.image || '');
  const [loading, setLoading] = useState(false);

  const handleEditSubmit = async () => {
    if (!name || !price || !category || !description) {
      Alert.alert('Error', 'Please fill in all required fields.');
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
        }
      };

      await axios.put(`${BASE_URL}/${food._id}`, updatedFoodData, config);
      Alert.alert('Success', 'Food item updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.log('Error updating food:', err);
      Alert.alert('Error', 'Failed to update food item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit Menu Item</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Price *</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Category *</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Image URL (optional)</Text>
        <TextInput
          style={styles.input}
          value={image}
          onChangeText={setImage}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleEditSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Update Food Item</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 24, marginTop: 10 },
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
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    elevation: 2,
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default EditFoodScreen;
