import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24;

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

const AdminDashboardScreen = ({ navigation }) => {
  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={s.topBar}>
        <View style={s.headerMain}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={s.topBarLogo}
            resizeMode="contain" 
          />
          <Text style={s.topBarTitle}>Admin Dashboard</Text>
        </View>
      </View>

      <View style={s.container}>
        <Text style={s.sectionHeader}>Workspace Controls</Text>

        <TouchableOpacity 
          style={s.card}
          onPress={() => navigation.navigate('FoodList')}
          activeOpacity={0.8}
        >
          <View style={[s.cardIconBox, { backgroundColor: '#FFF0F0' }]}>
            <MaterialIcons name="restaurant-menu" size={24} color={C.primary} />
          </View>
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>Manage Menu</Text>
            <Text style={s.cardSub}>Add, edit, or remove food items</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={C.border} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={s.card}
          onPress={() => navigation.navigate('UserList')}
          activeOpacity={0.8}
        >
          <View style={[s.cardIconBox, { backgroundColor: '#E8F5E9' }]}>
            <MaterialIcons name="people" size={24} color={C.success} />
          </View>
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>Manage Users</Text>
            <Text style={s.cardSub}>View profiles, promote admins, delete</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={C.border} />
        </TouchableOpacity>

      </View>
    </View>
  );
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  topBar: {
    backgroundColor: C.bg,
    paddingTop: STATUSBAR_HEIGHT + 10,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  headerMain: { flexDirection: 'row', alignItems: 'center' },
  topBarLogo: { width: 36, height: 36, marginRight: 10 },
  topBarTitle: { fontSize: 24, fontWeight: '800', color: C.textDark, letterSpacing: -0.5 },
  container: { padding: 24 },
  sectionHeader: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: C.textMuted, 
    textTransform: 'uppercase', 
    marginBottom: 16, 
    letterSpacing: 1 
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 3,
  },
  cardIconBox: { 
    width: 48, height: 48, borderRadius: 24, 
    justifyContent: 'center', alignItems: 'center', 
    marginRight: 16 
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  cardSub: { fontSize: 13, color: C.textMuted },
});

export default AdminDashboardScreen;
