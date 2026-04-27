import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, Platform,
} from 'react-native';
import { useNotifications } from '../../context/NotificationContext';
import { MaterialIcons } from '@expo/vector-icons';

const C = {
  primary:  '#FA4A0C',
  bg:       '#F4F4F6',
  surface:  '#FFFFFF',
  textDark: '#111827',
  textMid:  '#6B7280',
  border:   '#E5E7EB',
  info:     '#3B82F6',
  success:  '#22C55E',
  warning:  '#F59E0B',
};

const ICON_MAP = {
  info:    { name: 'info',          color: C.info,    bg: '#EFF6FF' },
  success: { name: 'check-circle',   color: C.success, bg: '#F0FDF4' },
  warning: { name: 'error-outline', color: C.warning, bg: '#FFFBEB' },
  order:   { name: 'local-shipping',color: C.primary, bg: '#FFF2EE' },
};

export default function NotificationScreen({ navigation }) {
  const { notifications, markAsRead, clearAll } = useNotifications();

  const renderItem = ({ item }) => {
    const meta = ICON_MAP[item.type] || ICON_MAP.info;
    
    return (
      <TouchableOpacity 
        style={[s.card, !item.read && s.cardUnread]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[s.iconCircle, { backgroundColor: meta.bg }]}>
          <MaterialIcons name={meta.name} size={22} color={meta.color} />
        </View>
        <View style={s.content}>
          <View style={s.row}>
            <Text style={[s.title, !item.read && s.titleUnread]}>{item.title}</Text>
            {!item.read && <View style={s.unreadDot} />}
          </View>
          <Text style={s.body}>{item.body}</Text>
          <Text style={s.time}>{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />
      
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color={C.textDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={clearAll}>
          <Text style={s.clearAll}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {notifications.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyCircle}>
            <MaterialIcons name="notifications-none" size={50} color={C.textMid} />
          </View>
          <Text style={s.emptyTitle}>No Notifications</Text>
          <Text style={s.emptySub}>You're all caught up! New updates will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 14,
    backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn:     { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.textDark },
  clearAll:    { fontSize: 13, color: C.primary, fontWeight: '700' },

  list: { padding: 16 },
  card: {
    flexDirection: 'row', backgroundColor: C.surface, borderRadius: 16,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardUnread: { backgroundColor: '#FDF2F0', borderWidth: 1, borderColor: '#FEE2E2' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  content:    { flex: 1 },
  row:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title:      { fontSize: 15, fontWeight: '600', color: C.textMid },
  titleUnread:{ color: C.textDark, fontWeight: '800' },
  unreadDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary },
  body:       { fontSize: 13, color: C.textMid, lineHeight: 18, marginBottom: 8 },
  time:       { fontSize: 11, color: C.textMid },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.textMid, textAlign: 'center', lineHeight: 22 },
});
