import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, Alert, Switch
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

// ── Premium Brown & White Palette ──────────────────────
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

const RegisterScreen = ({ navigation }) => {
  const { register } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill out all fields.');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, isAdmin);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Registration Failed', result.message);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={s.container}>
        <View style={s.headerWrap}>
          <Text style={s.emoji}>👋</Text>
          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Sign up to order delicious meals</Text>
        </View>

        <View style={s.formWrap}>
          <View style={s.field}>
            <Text style={s.label}>Full Name</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. John Doe"
              placeholderTextColor="#C4B8AC"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Email Address</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. uvs@example.com"
              placeholderTextColor="#C4B8AC"
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
              placeholderTextColor="#C4B8AC"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
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
              trackColor={{ false: '#D1CBC4', true: C.caramel }}
              thumbColor={C.milk}
            />
          </View>

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            disabled={loading}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={C.cream} />
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
  safeArea: { flex: 1, backgroundColor: C.cream },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  headerWrap: { alignItems: 'center', marginBottom: 50 },
  emoji: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: C.textDark, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: C.textMuted },
  formWrap: {},
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: C.textDark, marginBottom: 8 },
  input: {
    backgroundColor: C.milk,
    borderWidth: 1.5,
    borderColor: '#E8DDD3',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: C.textDark,
  },
  btn: {
    backgroundColor: C.caramel,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: C.mocha,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  btnDisabled: { backgroundColor: '#E8DDD3', shadowOpacity: 0 },
  btnText: { color: C.cream, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  switchRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 10,
    marginBottom: 20
  },
  metaText: { fontSize: 12, color: C.textMuted },
  footerWrap: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { fontSize: 14, color: C.textMuted },
  footerLink: { fontSize: 14, fontWeight: '700', color: C.caramel },
});

export default RegisterScreen;
