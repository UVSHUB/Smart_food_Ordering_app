import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, Alert, Switch, Image
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

// ── Ultra Premium Modern Palette ──────────────────────
const C = {
  primary:     '#FA4A0C', 
  bg:          '#FFFFFF', 
  surface:     '#F9F9FB', 
  textDark:    '#1A1A1A', 
  textMuted:   '#9A9A9D', 
  border:      '#E8E8E8',
};

const RegisterScreen = ({ navigation }) => {
  const { register } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      Alert.alert('Missing Fields', 'Please fill out all fields.');
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert('Invalid Name', 'Name must be at least 2 characters long.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long and include at least one letter and one number.');
      return;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone) {
      const phoneRegex = /^(0\d{9})$/;
      if (!phoneRegex.test(trimmedPhone)) {
        Alert.alert('Invalid Phone', 'Please enter a valid 10-digit Sri Lankan phone number starting with 0 (e.g. 0771234567).');
        return;
      }
    }


    setLoading(true);
    const result = await register(trimmedName, trimmedEmail, password, isAdmin, trimmedPhone);
    setLoading(false);


    if (!result.success) {
      Alert.alert('Registration Failed', result.message);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={s.container}>
        <View style={s.headerWrap}>
          <View style={s.logoWrap}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={s.logo}
              resizeMode="contain" 
            />
          </View>
          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Sign up to order delicious meals</Text>
        </View>

        <View style={s.formWrap}>
          <View style={s.field}>
            <Text style={s.label}>Full Name</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. John Doe"
              placeholderTextColor={C.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Email Address</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. user@example.com"
              placeholderTextColor={C.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={C.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Phone Number (Optional)</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 0771234567"
              placeholderTextColor={C.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>


          <View style={[s.field, s.switchRow]}>
            <View>
              <Text style={s.label}>Register as Administrator</Text>
              <Text style={s.metaText}>Gain access to dashboard commands</Text>
            </View>
            <Switch
              value={isAdmin}
              onValueChange={setIsAdmin}
              trackColor={{ false: '#E8E8E8', true: C.primary }}
              thumbColor={C.bg}
            />
          </View>

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            disabled={loading}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={C.bg} />
            ) : (
              <Text style={s.btnText}>Register</Text>
            )}
          </TouchableOpacity>

          <View style={s.footerWrap}>
            <Text style={s.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={s.footerLink}> Login here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  headerWrap: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  logoWrap: {
    width: 120, height: 120, marginBottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  logo: { width: '100%', height: '100%' },
  title: { fontSize: 28, fontWeight: '800', color: C.textDark, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: C.textMuted },
  formWrap: {},
  field: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: C.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#FBFBFB',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: C.textDark,
  },
  btn: {
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: C.bg, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  switchRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 10,
    marginBottom: 20
  },
  metaText: { fontSize: 12, color: C.textMuted, marginTop: 4 },
  footerWrap: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { fontSize: 14, color: C.textMuted },
  footerLink: { fontSize: 14, fontWeight: '700', color: C.primary },
});

export default RegisterScreen;
