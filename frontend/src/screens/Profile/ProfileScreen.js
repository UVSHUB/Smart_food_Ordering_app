import React, { useContext, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  StatusBar, Alert, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { MaterialIcons } from '@expo/vector-icons';
import { BASE_URL } from '../../services/api';

const C = {
  primary:   '#FA4A0C',
  bg:        '#F9F9FB',
  surface:   '#FFFFFF',
  textDark:  '#1A1A1A',
  textMuted: '#9A9A9D',
  danger:    '#FF4B4B',
  dangerBg:  '#FFF0F0',
  border:    '#F0F0F0',
};

// ── Menu row ──────────────────────────────────────────────────────────────────
function MenuRow({ icon, label, subtitle, iconBg, iconColor, onPress, danger }) {
  return (
    <TouchableOpacity style={s.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.menuIcon, { backgroundColor: iconBg || '#F3F3F5' }]}>
        <MaterialIcons name={icon} size={20} color={iconColor || C.textMuted} />
      </View>
      <View style={s.menuBody}>
        <Text style={[s.menuLabel, danger && { color: C.danger }]}>{label}</Text>
        {subtitle && <Text style={s.menuSub}>{subtitle}</Text>}
      </View>
      <MaterialIcons name="chevron-right" size={22} color={C.border} />
    </TouchableOpacity>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { wishlist } = useWishlist();
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const initial = (user.name || 'U')[0].toUpperCase();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await axios.delete(`${BASE_URL}/users/${user._id}`);
              logout();
            } catch {
              Alert.alert('Error', 'Failed to delete account.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Premium orange header ── */}
        <View style={s.heroSection}>
          <View style={s.avatarWrap}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>

          <Text style={s.heroName}>{user.name}</Text>
          <Text style={s.heroEmail}>{user.email}</Text>

          {user.isAdmin ? (
            <View style={s.adminPill}>
              <MaterialIcons name="admin-panel-settings" size={14} color={C.primary} style={{ marginRight: 5 }} />
              <Text style={s.adminPillText}>Administrator</Text>
            </View>
          ) : (
            <View style={s.userPill}>
              <MaterialIcons name="person" size={14} color="#fff" style={{ marginRight: 5 }} />
              <Text style={s.userPillText}>Customer</Text>
            </View>
          )}
        </View>

        {/* ── Stats strip ── */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statVal}>0</Text>
            <Text style={s.statLabel}>Orders</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Text style={s.statVal}>0</Text>
            <Text style={s.statLabel}>Deliveries</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Text style={s.statVal}>{wishlist.length}</Text>
            <Text style={s.statLabel}>Favorites</Text>
          </View>
        </View>

        {/* ── Account section ── */}
        <View style={s.section}>
          <Text style={s.sectionHeader}>Account</Text>
          <View style={s.menuCard}>
            <MenuRow
              icon="edit"
              label="Edit Profile"
              subtitle="Update your name and password"
              iconBg="#FFF2EE"
              iconColor={C.primary}
              onPress={() => navigation.navigate('EditProfile')}
            />
            <View style={s.divider} />
            <MenuRow
              icon="receipt-long"
              label="Payment History"
              subtitle="View all your past payments"
              iconBg="#F0FDF4"
              iconColor="#22C55E"
              onPress={() => navigation.navigate('PaymentHistory')}
            />
            <View style={s.divider} />
            <MenuRow
              icon="favorite"
              label="My Favorites"
              subtitle={`${wishlist.length} items saved for later`}
              iconBg="#FFF0F5"
              iconColor="#E91E63"
              onPress={() => navigation.navigate('Wishlist')}
            />
            <View style={s.divider} />
            <MenuRow
              icon="local-shipping"
              label="My Deliveries"
              subtitle="Track your active orders"
              iconBg="#EFF6FF"
              iconColor="#3B82F6"
              onPress={() => navigation.navigate('DeliveryHistory')}
            />
          </View>
        </View>

        {/* ── Admin section ── */}
        {user.isAdmin && (
          <View style={s.section}>
            <Text style={s.sectionHeader}>Administration</Text>
            <View style={[s.menuCard, { borderLeftWidth: 3, borderLeftColor: C.primary }]}>
              <MenuRow
                icon="admin-panel-settings"
                label="Admin Dashboard"
                subtitle="Manage food, users & payments"
                iconBg="#FFF2EE"
                iconColor={C.primary}
                onPress={() => {}}
              />
            </View>
          </View>
        )}

        {/* ── Session section ── */}
        <View style={s.section}>
          <Text style={s.sectionHeader}>Session</Text>
          <View style={s.menuCard}>
            <MenuRow
              icon="logout"
              label="Logout"
              subtitle="Sign out from this device"
              iconBg="#FFF3E0"
              iconColor="#FF9800"
              onPress={handleLogout}
            />
            <View style={s.divider} />
            <MenuRow
              icon="delete-outline"
              label="Delete Account"
              subtitle="Permanently remove your account"
              iconBg="#FFF0F0"
              iconColor={C.danger}
              onPress={handleDeleteAccount}
              danger
            />
          </View>
        </View>

        <Text style={s.versionText}>Smart Food Ordering · v1.0.0</Text>
        <View style={{ height: 32 }} />

      </ScrollView>

      {loading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Hero
  heroSection: {
    backgroundColor: C.primary,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight || 24) + 20,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  avatarWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
  },
  avatarText:  { fontSize: 36, fontWeight: '900', color: '#fff' },
  heroName:    { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
  heroEmail:   { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 14 },
  adminPill:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  adminPillText: { color: C.primary, fontWeight: '800', fontSize: 12 },
  userPill:    { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  userPillText:  { color: '#fff', fontWeight: '700', fontSize: 12 },

  // Stats strip
  statsRow: {
    flexDirection: 'row', backgroundColor: C.surface,
    marginHorizontal: 20, marginTop: -18,
    borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
    marginBottom: 8,
  },
  statBox:     { flex: 1, alignItems: 'center', gap: 2 },
  statVal:     { fontSize: 18, fontWeight: '900', color: C.textDark },
  statLabel:   { fontSize: 11, fontWeight: '700', color: C.textLight, textTransform: 'uppercase' },
  statDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  // Sections
  section:       { paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: { fontSize: 13, fontWeight: '800', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  menuCard: {
    backgroundColor: C.surface, borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  menuRow:  { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuBody: { flex: 1 },
  menuLabel:{ fontSize: 15, fontWeight: '700', color: C.textDark, marginBottom: 2 },
  menuSub:  { fontSize: 12, color: C.textMuted },
  divider:  { height: 1, backgroundColor: C.border, marginLeft: 72 },

  versionText:    { textAlign: 'center', fontSize: 12, color: C.textMuted, marginTop: 24 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },
});
