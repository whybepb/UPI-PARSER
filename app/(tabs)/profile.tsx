import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTransactions } from '../../hooks/useTransactions';
import { exportTransactionsCsv } from '../../services/exportService';

type MenuItem = {
  key: 'budget' | 'export' | 'sync' | 'about';
  title: string;
  sub: string;
  icon: string;
};

const menuItems: MenuItem[] = [
  { key: 'budget', title: 'Budget Limits', sub: 'Set monthly spending caps', icon: 'currency-rupee' },
  { key: 'export', title: 'Export Data', sub: 'Download CSV of transactions', icon: 'file-download' },
  { key: 'sync', title: 'Cloud Sync', sub: 'Coming soon', icon: 'sync' },
  { key: 'about', title: 'About SyncSpend', sub: `Version ${Constants.expoConfig?.version ?? '1.0.0'}`, icon: 'info-outline' },
];

export default function ProfileTab() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { summary } = useTransactions();
  const [isExporting, setIsExporting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName = user?.displayName?.trim() || 'SyncSpend User';
  const email = user?.email ?? 'user@syncspend.app';
  const initial = (displayName[0] ?? 'S').toUpperCase();

  const totalTransactions = summary.transactionCount;
  const totalCategories = useMemo(
    () => new Set(summary.transactions.filter((txn) => txn.category !== 'uncategorized').map((txn) => txn.category)).size,
    [summary.transactions],
  );
  const totalMonths = useMemo(
    () =>
      new Set(
        summary.transactions.map((txn) => `${txn.date.getFullYear()}-${String(txn.date.getMonth() + 1).padStart(2, '0')}`),
      ).size,
    [summary.transactions],
  );

  const onPressMenu = async (key: MenuItem['key']) => {
    if (key === 'budget') {
      router.push('/(tabs)/settings');
      return;
    }

    if (key === 'export') {
      if (isExporting) return;
      setIsExporting(true);
      const result = await exportTransactionsCsv(summary.transactions);
      setIsExporting(false);

      if (!result.ok) {
        Alert.alert('Export failed', result.error ?? 'Unable to export data.');
        return;
      }

      Alert.alert(
        'Export complete',
        result.path ? `CSV generated at:\n${result.path}` : 'CSV export is ready.',
      );
      return;
    }

    if (key === 'sync') {
      Alert.alert('Cloud Sync', 'Cloud sync enhancements are coming soon.');
      return;
    }

    Alert.alert('About SyncSpend', `Version ${Constants.expoConfig?.version ?? '1.0.0'}`);
  };

  const onSignOut = async () => {
    if (isSigningOut) return;
    try {
      setIsSigningOut(true);
      await signOut();
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Sign out failed', e?.message ?? 'Unable to sign out right now.');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <ScrollView style={s.page} contentContainerStyle={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      <View style={s.avatarCard}>
        <View style={s.avatarCircle}>
          <Text style={s.avatarLetter}>{initial}</Text>
        </View>
        <View style={s.avatarMeta}>
          <Text style={s.name}>{displayName}</Text>
          <Text style={s.email}>{email}</Text>
        </View>
        <TouchableOpacity style={s.editBtn} activeOpacity={0.8}>
          <Text style={s.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statValue}>{totalTransactions}</Text>
          <Text style={s.statLabel}>Transactions</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statValue}>{totalCategories}</Text>
          <Text style={s.statLabel}>Categories</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statValue}>{totalMonths}</Text>
          <Text style={s.statLabel}>Months</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Settings</Text>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={s.menuItem}
          activeOpacity={0.75}
          onPress={() => void onPressMenu(item.key)}
          disabled={item.key === 'export' && isExporting}
        >
          <View style={s.menuIcon}>
            <MaterialIcons name={item.icon as never} size={18} color="#ffffff" />
          </View>
          <View style={s.menuMeta}>
            <Text style={s.menuTitle}>{item.key === 'export' && isExporting ? 'Exporting...' : item.title}</Text>
            <Text style={s.menuSub}>{item.sub}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#525252" />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={s.logoutBtn} onPress={() => void onSignOut()} disabled={isSigningOut}>
        <Text style={s.logoutText}>{isSigningOut ? 'Signing out...' : 'Sign Out'}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#121212',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: '#000', fontSize: 22, fontWeight: '800' },
  avatarMeta: { marginLeft: 16, flex: 1 },
  name: { color: '#fff', fontSize: 18, fontWeight: '800' },
  email: { color: '#9ca3af', fontSize: 13, marginTop: 2 },
  editBtn: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  editBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
  },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#9ca3af', fontSize: 11, marginTop: 4, fontWeight: '600' },

  sectionTitle: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 2,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#121212',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 8,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuMeta: { flex: 1 },
  menuTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  menuSub: { color: '#6b7280', fontSize: 12, marginTop: 1 },

  logoutBtn: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },
});
