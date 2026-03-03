import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const menuItems = [
  { key: 'budget', title: 'Budget Limits', sub: 'Set monthly spending caps', icon: '₹' },
  { key: 'export', title: 'Export Data', sub: 'Download CSV of transactions', icon: '↓' },
  { key: 'sync', title: 'Cloud Sync', sub: 'Coming soon', icon: '↻' },
  { key: 'about', title: 'About SyncSpend', sub: 'Version 1.0.0', icon: 'i' },
];

export default function ProfileTab() {
  const router = useRouter();

  return (
    <ScrollView style={s.page} contentContainerStyle={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      {/* Avatar Card */}
      <View style={s.avatarCard}>
        <View style={s.avatarCircle}>
          <Text style={s.avatarLetter}>A</Text>
        </View>
        <View style={{ marginLeft: 16, flex: 1 }}>
          <Text style={s.name}>Aarya</Text>
          <Text style={s.email}>user@syncspend.app</Text>
        </View>
        <TouchableOpacity style={s.editBtn}>
          <Text style={s.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statValue}>—</Text>
          <Text style={s.statLabel}>Transactions</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statValue}>—</Text>
          <Text style={s.statLabel}>Categories</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statValue}>—</Text>
          <Text style={s.statLabel}>Months</Text>
        </View>
      </View>

      {/* Menu */}
      <Text style={s.sectionTitle}>Settings</Text>
      {menuItems.map(({ key, title, sub, icon }) => (
        <TouchableOpacity
          key={key}
          style={s.menuItem}
          activeOpacity={0.7}
          onPress={() => key === 'budget' ? router.push('/(tabs)/settings') : undefined}
        >
          <View style={s.menuIcon}>
            <Text style={s.menuIconText}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.menuTitle}>{title}</Text>
            <Text style={s.menuSub}>{sub}</Text>
          </View>
          <Text style={{ color: '#525252', fontSize: 18 }}>›</Text>
        </TouchableOpacity>
      ))}

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn}>
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  container: { paddingHorizontal: 16, paddingTop: 48, paddingBottom: 120 },

  header: { marginBottom: 24 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },

  avatarCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: '#121212', borderRadius: 16, borderWidth: 1, borderColor: '#262626',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { color: '#000', fontSize: 22, fontWeight: '800' },
  name: { color: '#fff', fontSize: 18, fontWeight: '800' },
  email: { color: '#9ca3af', fontSize: 13, marginTop: 2 },
  editBtn: { borderWidth: 1, borderColor: '#333', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  editBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: {
    flex: 1, backgroundColor: '#121212', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#262626', alignItems: 'center',
  },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#9ca3af', fontSize: 11, marginTop: 4, fontWeight: '600' },

  sectionTitle: { color: '#9ca3af', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12, marginLeft: 2 },

  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    backgroundColor: '#121212', borderRadius: 14, borderWidth: 1, borderColor: '#262626',
    marginBottom: 8,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  menuIconText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  menuTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  menuSub: { color: '#6b7280', fontSize: 12, marginTop: 1 },

  logoutBtn: {
    marginTop: 20, borderWidth: 1, borderColor: '#333', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },
});
