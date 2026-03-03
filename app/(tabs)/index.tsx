import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';
import { getCategoryInfo } from '../../services/categoryEngine';
import { UpiTransaction } from '../../services/types';

function fmt(n: number) {
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

function TxnRow({ txn }: { txn: UpiTransaction }) {
  const cat = getCategoryInfo(txn.category);
  const isCredit = txn.type === 'credit';
  return (
    <View style={s.row}>
      <View style={s.iconWrap}>
        <Text style={s.iconLetter}>{cat.label[0]}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={s.rowTitle} numberOfLines={1}>{cat.label}</Text>
        <Text style={s.rowSub} numberOfLines={1}>{txn.merchant}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[s.amount, isCredit && { color: '#4ade80' }]}>
          {isCredit ? '+' : '-'}{fmt(txn.amount)}
        </Text>
        <Text style={s.time}>
          {txn.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

export default function HomeTab() {
  const { summary } = useTransactions();
  const balance = summary.totalReceived - summary.totalSpent;

  const sections = useMemo(() => {
    const all = summary.transactions.slice(0, 10);
    return {
      today: all.filter((t) => sectionForDate(t.date) === 'TODAY'),
      yesterday: all.filter((t) => sectionForDate(t.date) === 'YESTERDAY'),
      older: all.filter((t) => sectionForDate(t.date) === 'OLDER'),
    };
  }, [summary.transactions]);

  return (
    <ScrollView style={s.page} contentContainerStyle={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.brandRow}>
          <View style={s.avatar}><Text style={s.avatarText}>S</Text></View>
          <Text style={s.brandTitle}>SyncSpend</Text>
        </View>
        <View style={s.headerIcons}>
          <Text style={s.headerIcon}>🔍</Text>
          <Text style={s.headerIcon}>🔔</Text>
        </View>
      </View>

      {/* Balance */}
      <View style={s.balanceSection}>
        <Text style={s.balanceLabel}>Total balance</Text>
        <Text style={s.balanceValue}>{fmt(balance)}</Text>
      </View>

      {/* Spent / Received */}
      <View style={s.summaryCard}>
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>SPENT</Text>
          <Text style={s.summaryValue}>{fmt(summary.totalSpent)}</Text>
        </View>
        <View style={s.divider} />
        <View style={s.summaryCol}>
          <Text style={s.summaryLabel}>RECEIVED</Text>
          <Text style={[s.summaryValue, { color: '#4ade80' }]}>{fmt(summary.totalReceived)}</Text>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Recent Transactions</Text>
        <Text style={s.seeAll}>See All</Text>
      </View>

      {sections.today.length > 0 && (
        <>
          <Text style={s.dayLabel}>TODAY</Text>
          {sections.today.map((txn) => <TxnRow key={txn.id} txn={txn} />)}
        </>
      )}

      {sections.yesterday.length > 0 && (
        <>
          <Text style={[s.dayLabel, { marginTop: 16 }]}>YESTERDAY</Text>
          {sections.yesterday.map((txn) => <TxnRow key={txn.id} txn={txn} />)}
        </>
      )}

      {sections.older.length > 0 && (
        <>
          <Text style={[s.dayLabel, { marginTop: 16 }]}>OLDER</Text>
          {sections.older.map((txn) => <TxnRow key={txn.id} txn={txn} />)}
        </>
      )}
    </ScrollView>
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
  headerIcons: { flexDirection: 'row', gap: 12 },
  headerIcon: { fontSize: 20 },

  balanceSection: { alignItems: 'center', marginBottom: 24 },
  balanceLabel: { color: '#9ca3af', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  balanceValue: { color: '#fff', fontSize: 40, fontWeight: '800', letterSpacing: -1 },

  summaryCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#121212', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24,
    borderWidth: 1, borderColor: '#262626', marginBottom: 28,
  },
  summaryCol: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: '#9ca3af', fontSize: 10, letterSpacing: 1, fontWeight: '600', marginBottom: 4 },
  summaryValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  divider: { width: 1, height: 32, backgroundColor: '#333', marginHorizontal: 8 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  seeAll: { color: '#9ca3af', fontSize: 13, fontWeight: '600' },

  dayLabel: { color: '#6b7280', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12, marginLeft: 2 },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333',
    alignItems: 'center', justifyContent: 'center',
  },
  iconLetter: { color: '#fff', fontSize: 16, fontWeight: '700' },
  rowTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  rowSub: { color: '#9ca3af', fontSize: 12, marginTop: 1 },
  amount: { color: '#fff', fontSize: 15, fontWeight: '800' },
  time: { color: '#9ca3af', fontSize: 11, marginTop: 2 },
});
