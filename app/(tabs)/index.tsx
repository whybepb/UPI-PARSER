import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';
import { getCategoryInfo } from '../../services/categoryEngine';
import { UpiTransaction } from '../../services/types';

function formatMoney(n: number) {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function sectionForDate(date: Date): 'TODAY' | 'YESTERDAY' | 'OLDER' {
  const now = new Date();
  const d = new Date(date);
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 86400000;
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (t >= startToday) return 'TODAY';
  if (t >= startYesterday) return 'YESTERDAY';
  return 'OLDER';
}

function iconForCategory(category: string): string {
  const iconMap: Record<string, string> = {
    food: 'restaurant',
    travel: 'directions-car',
    shopping: 'shopping-bag',
    groceries: 'shopping-cart',
    fuel: 'local-gas-station',
    entertainment: 'subscriptions',
    bills: 'receipt-long',
    health: 'fitness-center',
    education: 'school',
    subscription: 'subscriptions',
    salary: 'payments',
    transfer: 'swap-horiz',
    person_sent: 'send',
    person_received: 'payments',
    uncategorized: 'help-outline',
  };
  return iconMap[category] ?? 'help-outline';
}

function TxnRow({ txn, onDelete }: { txn: UpiTransaction; onDelete?: (id: string) => void }) {
  const cat = getCategoryInfo(txn.category);
  const isCredit = txn.type === 'credit';

  const handleLongPress = () => {
    if (!onDelete) return;
    Alert.alert(
      'Remove Transaction',
      `Delete ${cat.label} — ${formatMoney(txn.amount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(txn.id) },
      ],
    );
  };

  return (
    <TouchableOpacity onLongPress={handleLongPress} activeOpacity={0.7} delayLongPress={400}>
      <View style={s.row}>
        <View style={s.iconWrap}>
          <MaterialIcons name={iconForCategory(txn.category) as never} size={22} color="#fff" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.rowTitle} numberOfLines={1}>
            {cat.label}
          </Text>
          <Text style={s.rowSub} numberOfLines={1}>
            {txn.merchant}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[s.amount, isCredit && { color: '#4ade80' }]}>
            {isCredit ? '+' : '-'}
            {formatMoney(txn.amount)}
          </Text>
          <Text style={s.time}>
            {txn.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeTab() {
  const router = useRouter();
  const {
    summary,
    budget,
    hasPermission,
    isUnsupported,
    requestPermissionAndScan,
    deleteTransaction,
  } = useTransactions();

  const [searchVisible, setSearchVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [query, setQuery] = useState('');

  const balance = summary.totalReceived - summary.totalSpent;

  const sections = useMemo(() => {
    const all = summary.transactions.slice(0, 10);
    return {
      today: all.filter((t) => sectionForDate(t.date) === 'TODAY'),
      yesterday: all.filter((t) => sectionForDate(t.date) === 'YESTERDAY'),
      older: all.filter((t) => sectionForDate(t.date) === 'OLDER'),
    };
  }, [summary.transactions]);

  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return summary.transactions.slice(0, 30);

    return summary.transactions.filter((txn) => {
      const label = getCategoryInfo(txn.category).label.toLowerCase();
      const amountText = txn.amount.toFixed(2);
      return (
        txn.merchant.toLowerCase().includes(trimmed) ||
        label.includes(trimmed) ||
        amountText.includes(trimmed)
      );
    });
  }, [query, summary.transactions]);

  const alerts = useMemo(() => {
    const items: { id: string; title: string; message: string; actionLabel: string; onPress: () => void }[] = [];

    if (budget && budget.amount > 0) {
      const usedPct = Math.round((summary.totalSpent / budget.amount) * 100);
      if (usedPct >= 80) {
        items.push({
          id: 'budget',
          title: usedPct >= 100 ? 'Budget exceeded' : 'Budget warning',
          message: `${usedPct}% of your monthly budget is used.`,
          actionLabel: 'Open Budget',
          onPress: () => {
            setNotificationVisible(false);
            router.push('/(tabs)/settings');
          },
        });
      }
    }

    const reviewCount = summary.transactions.filter((txn) => txn.parseStatus === 'review_needed').length;
    if (reviewCount > 0) {
      items.push({
        id: 'review',
        title: 'Transactions need review',
        message: `${reviewCount} transaction${reviewCount > 1 ? 's' : ''} need category fixes.`,
        actionLabel: 'Open SMS Feed',
        onPress: () => {
          setNotificationVisible(false);
          router.push('/(tabs)/sms-feed');
        },
      });
    }

    if (!isUnsupported && !hasPermission) {
      items.push({
        id: 'permission',
        title: 'SMS permission is off',
        message: 'Grant SMS access to auto-import new UPI transactions.',
        actionLabel: 'Grant Permission',
        onPress: async () => {
          await requestPermissionAndScan();
          setNotificationVisible(false);
        },
      });
    }

    if (items.length === 0) {
      items.push({
        id: 'all-good',
        title: 'All caught up',
        message: 'No budget or review alerts right now.',
        actionLabel: 'Close',
        onPress: () => setNotificationVisible(false),
      });
    }

    return items;
  }, [budget, hasPermission, isUnsupported, requestPermissionAndScan, router, summary.totalSpent, summary.transactions]);

  return (
    <>
      <ScrollView style={s.page} contentContainerStyle={s.container}>
        <View style={s.header}>
          <View style={s.brandRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>S</Text>
            </View>
            <Text style={s.brandTitle}>SyncSpend</Text>
          </View>
          <View style={s.headerIcons}>
            <TouchableOpacity
              onPress={() => setSearchVisible(true)}
              style={s.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="search" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setNotificationVisible(true)}
              style={s.iconButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="notifications" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.balanceSection}>
          <Text style={s.balanceLabel}>Total balance</Text>
          <Text style={s.balanceValue}>{formatMoney(balance)}</Text>
        </View>

        <View style={s.summaryCard}>
          <View style={s.summaryCol}>
            <Text style={s.summaryLabel}>SPENT</Text>
            <Text style={s.summaryValue}>{formatMoney(summary.totalSpent)}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.summaryCol}>
            <Text style={s.summaryLabel}>RECEIVED</Text>
            <Text style={[s.summaryValue, { color: '#4ade80' }]}>{formatMoney(summary.totalReceived)}</Text>
          </View>
        </View>

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => setSearchVisible(true)}>
            <Text style={s.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {sections.today.length > 0 && (
          <>
            <Text style={s.dayLabel}>TODAY</Text>
            {sections.today.map((txn) => (
              <TxnRow key={txn.id} txn={txn} onDelete={deleteTransaction} />
            ))}
          </>
        )}

        {sections.yesterday.length > 0 && (
          <>
            <Text style={[s.dayLabel, { marginTop: 16 }]}>YESTERDAY</Text>
            {sections.yesterday.map((txn) => (
              <TxnRow key={txn.id} txn={txn} onDelete={deleteTransaction} />
            ))}
          </>
        )}

        {sections.older.length > 0 && (
          <>
            <Text style={[s.dayLabel, { marginTop: 16 }]}>OLDER</Text>
            {sections.older.map((txn) => (
              <TxnRow key={txn.id} txn={txn} onDelete={deleteTransaction} />
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={searchVisible} transparent animationType="fade" onRequestClose={() => setSearchVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.searchModal}>
            <View style={s.searchHeader}>
              <Text style={s.modalTitle}>Search Transactions</Text>
              <TouchableOpacity onPress={() => setSearchVisible(false)}>
                <MaterialIcons name="close" size={22} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <View style={s.searchInputWrap}>
              <MaterialIcons name="search" size={20} color="#6b7280" />
              <TextInput
                style={s.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Merchant, category, amount"
                placeholderTextColor="#6b7280"
                autoFocus
              />
            </View>
            <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ paddingTop: 8 }}>
              {searchResults.length === 0 ? (
                <Text style={s.emptySearch}>No matching transactions.</Text>
              ) : (
                searchResults.slice(0, 30).map((txn) => <TxnRow key={txn.id} txn={txn} />)
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={notificationVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotificationVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.bottomSheet}>
            <View style={s.sheetHeader}>
              <Text style={s.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotificationVisible(false)}>
                <MaterialIcons name="close" size={22} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            {alerts.map((alert) => (
              <View key={alert.id} style={s.alertCard}>
                <Text style={s.alertTitle}>{alert.title}</Text>
                <Text style={s.alertMessage}>{alert.message}</Text>
                <TouchableOpacity onPress={alert.onPress} style={s.alertBtn}>
                  <Text style={s.alertBtnText}>{alert.actionLabel}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  container: { paddingHorizontal: 16, paddingTop: 48, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#000', fontWeight: '800', fontSize: 14 },
  brandTitle: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  balanceSection: { alignItems: 'center', marginBottom: 24 },
  balanceLabel: { color: '#9ca3af', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  balanceValue: { color: '#fff', fontSize: 40, fontWeight: '800', letterSpacing: -1 },

  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 28,
  },
  summaryCol: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: '#9ca3af', fontSize: 10, letterSpacing: 1, fontWeight: '600', marginBottom: 4 },
  summaryValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  divider: { width: 1, height: 32, backgroundColor: '#333', marginHorizontal: 8 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  seeAll: { color: '#9ca3af', fontSize: 13, fontWeight: '600' },

  dayLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 2,
  },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  rowSub: { color: '#9ca3af', fontSize: 12, marginTop: 1 },
  amount: { color: '#fff', fontSize: 15, fontWeight: '800' },
  time: { color: '#9ca3af', fontSize: 11, marginTop: 2 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  searchModal: {
    width: '100%',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 16,
    padding: 16,
  },
  searchHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  searchInputWrap: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    backgroundColor: '#000',
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 12 },
  emptySearch: { color: '#9ca3af', textAlign: 'center', paddingVertical: 24 },

  bottomSheet: {
    width: '100%',
    backgroundColor: '#121212',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: '#262626',
    padding: 16,
    paddingBottom: 28,
    alignSelf: 'flex-end',
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  alertCard: {
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  alertTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  alertMessage: { color: '#9ca3af', marginTop: 4, lineHeight: 18 },
  alertBtn: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  alertBtnText: { color: '#000', fontWeight: '700' },
});
