import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, Alert,
  Platform, Switch
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

import { BASE_URL } from '../../services/api';

// ── Ultra Premium Modern Palette ──────────────────────
const C = {
  primary:     '#FA4A0C', 
  bg:          '#F9F9FB', 
  surface:     '#FFFFFF', 
  textDark:    '#1A1A1A', 
  textMuted:   '#9A9A9D', 
  danger:      '#FF4B4B',
  dangerBg:    '#FFF0F0',
  success:     '#2E7D32',
  border:      '#E8E8E8',
};

const EditUserAdminScreen = ({ route, navigation }) => {
  const { userId } = route.params;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/users/${userId}`);
      setName(data.name);
      setEmail(data.email);
      setIsAdmin(data.isAdmin);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch user data.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axios.put(`${BASE_URL}/users/${userId}`, { name, email, isAdmin });
      Alert.alert('Success', 'User updated successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Error', 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Are you sure?', 'This will permanently delete the user.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/users/${userId}`);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete user.');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={[s.safeArea, s.centered]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={C.textDark} />
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Edit User</Text>
        <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
            <MaterialIcons name="delete-outline" size={24} color={C.danger} />
        </TouchableOpacity>
      </View>

      <View style={s.container}>
        <View style={s.formWrap}>
          <View style={s.field}>
            <Text style={s.label}>Full Name</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Email Address</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[s.field, s.switchRow]}>
            <View>
              <Text style={s.label}>Administrator</Text>
              <Text style={s.metaText}>Toggle Admin dashboard access</Text>
            </View>
            <Switch
              value={isAdmin}
              onValueChange={setIsAdmin}
              trackColor={{ false: '#E8E8E8', true: C.primary }}
              thumbColor={C.surface}
            />
          </View>

          <TouchableOpacity
            style={[s.btn, saving && s.btnDisabled]}
            disabled={saving}
            onPress={handleUpdate}
          >
            {saving ? <ActivityIndicator color={C.bg} /> : <Text style={s.btnText}>Apply Changes</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  topBar: {
    backgroundColor: C.bg,
    paddingTop: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 24) + 10,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row' },
  topBarTitle: { fontSize: 18, fontWeight: '700', color: C.textDark },
  deleteBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  container: { flex: 1, padding: 24 },
  formWrap: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 4,
  },
  field: { marginBottom: 24 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  label: { fontSize: 13, fontWeight: '700', color: C.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaText: { fontSize: 12, color: C.textMuted, marginTop: 4 },
  input: {
    backgroundColor: '#FBFBFB',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: C.textDark,
  },
  btn: {
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: C.bg, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});

export default EditUserAdminScreen;
