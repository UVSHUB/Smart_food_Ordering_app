import React, { useContext, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  StatusBar, Alert, Platform, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

const BASE_URL = 'http://10.94.178.167:5001/api';

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
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={s.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="person" size={24} color={C.primary} style={{ marginRight: 8 }} />
          <Text style={s.topBarTitle}>Profile</Text>
        </View>
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
              <MaterialIcons name="verified-user" size={12} color={C.success} style={{ marginRight: 4 }} />
              <Text style={s.adminText}>Administrator</Text>
            </View>
          )}
        </View>

        <View style={s.actionsCard}>
          <TouchableOpacity 
            style={s.actionBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={s.btnContent}>
              <MaterialIcons name="edit" size={22} color={C.textMuted} style={{ marginRight: 14 }} />
              <Text style={s.btnText}>Edit Profile</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={C.border} />
          </TouchableOpacity>

          <View style={s.divider} />

          <TouchableOpacity 
            style={s.actionBtn}
            onPress={() => navigation.navigate('PaymentHistory')}
          >
            <View style={s.btnContent}>
              <MaterialIcons name="receipt-long" size={22} color={C.textMuted} style={{ marginRight: 14 }} />
              <Text style={s.btnText}>Payment History</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={C.border} />
          </TouchableOpacity>

          <View style={s.divider} />

          <TouchableOpacity 
            style={s.actionBtn} 
            onPress={logout}
          >
            <View style={s.btnContent}>
              <MaterialIcons name="logout" size={22} color={C.textMuted} style={{ marginRight: 14 }} />
              <Text style={s.btnText}>Logout</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={C.border} />
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
               <MaterialIcons name="delete-outline" size={20} color={C.danger} style={{ marginRight: 8 }} />
               <Text style={s.deleteBtnText}>Delete Account</Text>
             </>
          )}
        </TouchableOpacity>

      </View>
    </View>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  topBar: {
    backgroundColor: C.bg,
    paddingTop: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 24) + 10,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: C.textDark,
    letterSpacing: -0.5,
  },
  container: {
    padding: 24,
  },
  headerCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: C.primary,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: 14,
    color: C.textMuted,
    marginBottom: 12,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  adminText: {
    color: C.success,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  actionsCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 24,
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
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 56,
  },

  deleteBtn: {
    flexDirection: 'row',
    backgroundColor: C.dangerBg,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: C.danger,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;
