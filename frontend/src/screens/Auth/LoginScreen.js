import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, Alert
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

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.message);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={s.container}>
        <View style={s.headerWrap}>
          <View style={s.iconWrap}>
            <MaterialIcons name="restaurant" size={48} color={C.primary} />
          </View>
          <Text style={s.title}>Welcome Back</Text>
          <Text style={s.subtitle}>Login to view your favorite foods</Text>
        </View>

        <View style={s.formWrap}>
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

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            disabled={loading}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={C.bg} />
            ) : (
              <Text style={s.btnText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={s.footerWrap}>
            <Text style={s.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={s.footerLink}> Register here</Text>
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
  headerWrap: { alignItems: 'center', marginBottom: 50 },
  iconWrap: {
    width: 90, height: 90, borderRadius: 30, backgroundColor: '#FFF0ED',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: '800', color: C.textDark, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: C.textMuted },
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
  footerWrap: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { fontSize: 14, color: C.textMuted },
  footerLink: { fontSize: 14, fontWeight: '700', color: C.primary },
});

export default LoginScreen;
