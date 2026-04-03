import React, { useContext, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  StatusBar, Alert, Platform, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24;
const BASE_URL = 'http://192.168.8.169:5001/api';

// ── Palette ────────────────────────────────────────────
const C = {
  mocha:    '#4A2C2A',
  walnut:   '#6B4226',
  caramel:  '#A0673C',
  cream:    '#FFF8F0',
  milk:     '#FFFFFF',
  fog:      '#F5EDE4',
  textDark: '#2D1810',
  textMuted:'#8C7B6F',
  danger:   '#C0392B',
  dangerBg: '#FDEDEB',
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await axios.delete(`${BASE_URL}/users/${user._id}`);
              setLoading(false);
              logout(); // local cleanup after remote delete
            } catch (error) {
              setLoading(false);
              Alert.alert('Error', 'Failed to delete account.');
            }
          }
        }
      ]
    );
  };

  if (!user) return null;

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.mocha} />

      <View style={s.topBar}>
        <Text style={s.topBarTitle}>👤 Profile</Text>
      </View>

      <View style={s.container}>
        <View style={s.headerCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{(user.name || 'U')[0].toUpperCase()}</Text>
          </View>
          <Text style={s.name}>{user.name}</Text>
          <Text style={s.email}>{user.email}</Text>
          {user.isAdmin && (
            <View style={s.adminBadge}>
              <Text style={s.adminText}>Admin</Text>
            </View>
          )}
        </View>

        <View style={s.actionsCard}>
          <TouchableOpacity 
            style={s.actionBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={s.btnContent}>
              <Text style={s.btnIcon}>✏️</Text>
              <Text style={s.btnText}>Edit Profile</Text>
            </View>
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>

          <View style={s.divider} />

          <TouchableOpacity 
            style={s.actionBtn} 
            onPress={logout}
          >
            <View style={s.btnContent}>
              <Text style={s.btnIcon}>🚪</Text>
              <Text style={s.btnText}>Logout</Text>
            </View>
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={s.deleteBtn}
          onPress={handleDeleteAccount}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color={C.danger} />
          ) : (
             <>
               <Text style={s.deleteBtnIcon}>🗑️</Text>
               <Text style={s.deleteBtnText}>Delete Account</Text>
             </>
          )}
        </TouchableOpacity>

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
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: C.cream,
    letterSpacing: 0.3,
  },
  container: {
    padding: 20,
  },
  headerCard: {
    backgroundColor: C.milk,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.caramel,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: C.cream,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: C.textMuted,
    marginBottom: 10,
  },
  adminBadge: {
    backgroundColor: C.walnut,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminText: {
    color: C.cream,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  actionsCard: {
    backgroundColor: C.milk,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textDark,
  },
  arrow: {
    fontSize: 24,
    color: '#D1CBC4',
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EBE6',
    marginLeft: 54,
  },

  deleteBtn: {
    flexDirection: 'row',
    backgroundColor: C.dangerBg,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F5C6C2',
  },
  deleteBtnIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  deleteBtnText: {
    color: C.danger,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;
