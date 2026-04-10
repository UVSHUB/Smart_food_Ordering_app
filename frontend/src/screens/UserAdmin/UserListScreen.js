import React, { useState, useCallback, useContext } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, Alert, Platform
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
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
  success:     '#2E7D32',
  border:      '#E8E8E8',
};

const UserListScreen = ({ navigation }) => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/users`);
      setUsers(data);
    } catch (err) {
      console.log('Error fetching users:', err);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={s.userCard}
      onPress={() => navigation.navigate('EditUserAdmin', { userId: item._id })}
      activeOpacity={0.8}
    >
      <View style={s.avatar}>
        <Text style={s.avatarText}>{(item.name || 'U')[0].toUpperCase()}</Text>
      </View>
      <View style={s.userInfo}>
        <Text style={s.name}>
          {item.name} {item._id === currentUser._id && '(You)'}
        </Text>
        <Text style={s.email}>{item.email}</Text>
      </View>
      <View style={s.meta}>
        {item.isAdmin ? (
          <View style={[s.badge, { backgroundColor: '#E8F5E9' }]}>
            <Text style={[s.badgeText, { color: C.success }]}>Admin</Text>
          </View>
        ) : (
          <View style={[s.badge, { backgroundColor: '#F3F3F5' }]}>
            <Text style={[s.badgeText, { color: C.textMuted }]}>User</Text>
          </View>
        )}
        <MaterialIcons name="chevron-right" size={24} color={C.border} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={s.topBar}>
        <View style={s.topBarMain}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={20} color={C.textDark} />
          </TouchableOpacity>
          <View>
            <Text style={s.topBarTitle}>Manage Users</Text>
            <Text style={s.topBarSubtitle}>{users.length} active members</Text>
          </View>
        </View>
        <TouchableOpacity style={s.refreshBtn} onPress={fetchUsers}>
          <MaterialIcons name="refresh" size={22} color={C.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(it) => it._id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <MaterialIcons name="group-off" size={48} color={C.border} style={{ marginBottom: 10 }} />
              <Text style={s.empty}>No users found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  topBar: {
    backgroundColor: C.bg,
    paddingTop: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 24) + 10,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarMain: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  topBarTitle: { fontSize: 24, fontWeight: '800', color: C.textDark, letterSpacing: -0.5 },
  topBarSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2, fontWeight: '600' },
  refreshBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20 },
  userCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF0ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: C.primary },
  userInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  email: { fontSize: 13, color: C.textMuted },
  meta: { flexDirection: 'row', alignItems: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  empty: { textAlign: 'center', color: C.textMuted, fontSize: 14 },
});

export default UserListScreen;
