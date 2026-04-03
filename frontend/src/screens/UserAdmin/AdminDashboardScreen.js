import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 24;

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

const AdminDashboardScreen = ({ navigation }) => {
  return (
    <View style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.mocha} />

      <View style={s.topBar}>
        <Text style={s.topBarTitle}>Dashboard Workspace</Text>
      </View>

      <View style={s.container}>
        <Text style={s.sectionHeader}>Admin Controls</Text>

        <TouchableOpacity 
          style={s.card}
          onPress={() => navigation.navigate('FoodList')}
          activeOpacity={0.8}
        >
          <View style={s.cardIconBox}><Text style={s.cardIcon}>☕</Text></View>
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>Manage Menu</Text>
            <Text style={s.cardSub}>Add, edit, or remove food items</Text>
          </View>
          <Text style={s.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={s.card}
          onPress={() => navigation.navigate('UserList')}
          activeOpacity={0.8}
        >
          <View style={[s.cardIconBox, { backgroundColor: '#E8F5E9' }]}><Text style={s.cardIcon}>👥</Text></View>
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>Manage Users</Text>
            <Text style={s.cardSub}>View profiles, promote admins, delete</Text>
          </View>
          <Text style={s.arrow}>›</Text>
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
  topBarTitle: { fontSize: 19, fontWeight: '700', color: C.cream },
  container: { padding: 20 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', marginBottom: 14, letterSpacing: 1 },
  card: {
    backgroundColor: C.milk,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: C.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardIconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: C.fog, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardIcon: { fontSize: 24 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  cardSub: { fontSize: 13, color: C.textMuted },
  arrow: { fontSize: 26, color: '#D1CBC4' },
});

export default AdminDashboardScreen;
