import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, Alert, Image
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// ── Ultra Premium Modern Palette ──────────────────────
const C = {
  primary:     '#FA4A0C', 
  bg:          '#FFFFFF', 
  surface:     '#F9F9FB', 
  textDark:    '#1A1A1A', 
  textMuted:   '#9A9A9D', 
  border:      '#E8E8E8',
  google:      '#4285F4',
};

const LoginScreen = ({ navigation }) => {
  const { login, googleLogin } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '283392568548-ckg1v4dk17onir90u0ojqs3p7j0snqu2.apps.googleusercontent.com',
      offlineAccess: true, 
    });
  }, []);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const result = await login(trimmedEmail, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // Get the ID Token - handle different versions of the library
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      
      if (!idToken) {
        throw new Error('No ID Token received from Google. Ensure you have configured webClientId correctly.');
      }

      const result = await googleLogin(idToken);
      
      if (!result.success) {
        Alert.alert('Google Login Failed', result.message);
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Play Services Not Available', 'Please install or update Google Play Services.');
      } else {
        console.error('Google Sign-In Error:', error);
        // Show the specific error code to help debugging
        Alert.alert('Google Sign-In Error', `Code: ${error.code}\nMessage: ${error.message}`);
      }
    } finally {
      setGoogleLoading(false);
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
            style={[s.btn, (loading || googleLoading) && s.btnDisabled]}
            disabled={loading || googleLoading}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={C.bg} />
            ) : (
              <Text style={s.btnText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={s.dividerWrap}>
            <View style={s.divider} />
            <Text style={s.dividerText}>OR</Text>
            <View style={s.divider} />
          </View>

          <TouchableOpacity
            style={[s.googleBtn, (loading || googleLoading) && s.btnDisabled]}
            disabled={loading || googleLoading}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator color={C.google} />
            ) : (
              <View style={s.googleBtnContent}>
                <FontAwesome5 name="google" size={18} color={C.google} style={s.googleIcon} />
                <Text style={s.googleBtnText}>Continue with Google</Text>
              </View>
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
  headerWrap: { alignItems: 'center', marginBottom: 40 },
  logoWrap: {
    width: 120, height: 120, marginBottom: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  logo: { width: '100%', height: '100%' },
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
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
  },
  googleBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  googleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    marginRight: 12,
  },
  googleBtnText: {
    color: C.textDark,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerWrap: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { fontSize: 14, color: C.textMuted },
  footerLink: { fontSize: 14, fontWeight: '700', color: C.primary },
});

export default LoginScreen;
