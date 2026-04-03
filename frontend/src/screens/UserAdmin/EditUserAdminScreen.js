import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, Alert,
  Platform, Switch
} from 'react-native';
import axios from 'axios';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24;
const BASE_URL = 'http://192.168.8.169:5001/api';

const C = {
  mocha:    '#4A2C2A',
  walnut:   '#6B4226',
  caramel:  '#A0673C',
  cream:    '#FFF8F0',
  milk:     '#FFFFFF',
  fog:      '#F5EDE4',
  danger:   '#C0392B',
  dangerBg: '#FDEDEB',
  textDark: '#2D1810',
  textMuted:'#8C7B6F',
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
      Alert.alert('Error', 'Failed to fetch user limits.');
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
        <ActivityIndicator size="large" color={C.mocha} />
      </View>
    );
  }

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.mocha} />

      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Edit User</Text>
        <TouchableOpacity style={s.deleteBtn} onPress={handleDelete}>
            <Text style={s.deleteIcon}>🗑️</Text>
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
              <Text style={s.label}>Administrator Privileges</Text>
              <Text style={s.metaText}>Toggle Admin dashboard access</Text>
            </View>
            <Switch
              value={isAdmin}
              onValueChange={setIsAdmin}
              trackColor={{ false: '#D1CBC4', true: C.success || '#2E7D32' }}
              thumbColor={C.milk}
            />
          </View>

          <TouchableOpacity
            style={[s.btn, saving && s.btnDisabled]}
            disabled={saving}
            onPress={handleUpdate}
          >
            {saving ? <ActivityIndicator color={C.cream} /> : <Text style={s.btnText}>Apply Changes</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.cream },
  centered: { justifyContent: 'center', alignItems: 'center' },
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
  deleteBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  deleteIcon: { fontSize: 20 },
  container: { flex: 1, padding: 24 },
  formWrap: {
    backgroundColor: C.milk,
    borderRadius: 20,
    padding: 24,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  field: { marginBottom: 20 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  label: { fontSize: 14, fontWeight: '600', color: C.textDark, marginBottom: 8 },
  metaText: { fontSize: 12, color: C.textMuted },
  input: {
    backgroundColor: C.fog,
    borderWidth: 1.5,
    borderColor: '#E8DDD3',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: C.textDark,
  },
  btn: {
    backgroundColor: C.walnut,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  btnDisabled: { backgroundColor: C.textMuted },
  btnText: { color: C.cream, fontSize: 16, fontWeight: '700' },
});

export default EditUserAdminScreen;
