import React, { useState, useCallback, useContext } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, Alert, Platform
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
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
  danger:   '#C0392B',
  success:  '#2E7D32',
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
          <View style={[s.badge, { backgroundColor: C.success }]}>
            <Text style={s.badgeText}>Admin</Text>
          </View>
        ) : (
          <View style={[s.badge, { backgroundColor: C.textMuted }]}>
            <Text style={s.badgeText}>User</Text>
          </View>
        )}
        <Text style={s.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.mocha} />

      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Manage Users</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={C.mocha} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(it) => it._id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <Text style={s.empty}>No users found.</Text>
          }
        />
      )}
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
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 24, color: C.cream, fontWeight: '700' },
  topBarTitle: { fontSize: 19, fontWeight: '700', color: C.cream },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  userCard: {
    backgroundColor: C.milk,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: C.espresso,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.fog,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: C.walnut },
  userInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: C.textDark, marginBottom: 2 },
  email: { fontSize: 13, color: C.textMuted },
  meta: { flexDirection: 'row', alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 10 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff', textTransform: 'uppercase' },
  arrow: { fontSize: 24, color: '#D1CBC4' },
  empty: { textAlign: 'center', marginTop: 40, color: C.textMuted },
});

export default UserListScreen;
