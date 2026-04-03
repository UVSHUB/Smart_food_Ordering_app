import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, Alert,
  Platform
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24;
const BASE_URL = 'http://192.168.8.169:5001/api';

const C = {
  mocha:    '#4A2C2A',
  walnut:   '#6B4226',
  caramel:  '#A0673C',
  cream:    '#FFF8F0',
  milk:     '#FFFFFF',
  fog:      '#F5EDE4',
  textDark: '#2D1810',
  textMuted:'#8C7B6F',
};

const EditProfileScreen = ({ navigation }) => {
  const { user, refreshUser } = useContext(AuthContext);

  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState(''); // leave blank
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name || !email) {
      Alert.alert('Missing Fields', 'Name and email are required.');
      return;
    }

    try {
      setLoading(true);
      const updateData = { name, email };
      if (password) updateData.password = password;

      await axios.put(`${BASE_URL}/users/${user._id}`, updateData);
      
      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.log('Update error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.mocha} />

      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.container}>
        <View style={s.formWrap}>
          <View style={s.field}>
            <Text style={s.label}>Full Name</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Email Address</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>New Password (Optional)</Text>
            <TextInput
              style={s.input}
              placeholder="Leave blank to keep current"
              placeholderTextColor="#C4B8AC"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            disabled={loading}
            onPress={handleUpdate}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={C.cream} />
            ) : (
              <Text style={s.btnText}>Save Changes ✅</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: C.cream,
    fontWeight: '700',
  },
  topBarTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: C.cream,
    letterSpacing: 0.3,
  },
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
  label: { fontSize: 14, fontWeight: '600', color: C.textDark, marginBottom: 8 },
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
    marginTop: 10,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDisabled: { backgroundColor: C.latte, shadowOpacity: 0 },
  btnText: { color: C.cream, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});

export default EditProfileScreen;
