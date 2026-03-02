import { Bell, Car, Clapperboard, Search, ShoppingBag, UtensilsCrossed, Wallet } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { useTransactions } from '../../hooks/useTransactions';
import { UpiTransaction } from '../../services/types';

const iconMap: Record<string, React.ReactNode> = {
  shopping: <ShoppingBag color="#fff" size={22} />,
  food: <UtensilsCrossed color="#fff" size={22} />,
  travel: <Car color="#fff" size={22} />,
  salary: <Wallet color="#fff" size={22} />,
  entertainment: <Clapperboard color="#fff" size={22} />,
};

function sectionForDate(date: Date): 'TODAY' | 'YESTERDAY' | 'OLDER' {
  const now = new Date();
  const d = new Date(date);
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 24 * 60 * 60 * 1000;
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (t >= startToday) return 'TODAY';
  if (t >= startYesterday) return 'YESTERDAY';
  return 'OLDER';
}

function TxnRow({ txn }: { txn: UpiTransaction }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>{iconMap[txn.category] ?? <ShoppingBag color="#fff" size={20} />}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{txn.category === 'salary' ? 'Freelance Payment' : txn.merchant}</Text>
        <Text style={styles.rowSub}>{txn.category === 'salary' ? 'Client Transfer' : txn.merchant}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.amount, txn.type === 'credit' && { color: Colors.success }]}>
          {txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
        </Text>
        <Text style={styles.time}>{txn.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    </View>
  );
}

export default function HomeTab() {
  const { summary } = useTransactions();

  const { today, yesterday } = useMemo(() => {
    const all = summary.transactions.slice(0, 8) as UpiTransaction[];
    const todayRows = all.filter((txn: UpiTransaction) => sectionForDate(txn.date) === 'TODAY');
    const yesterdayRows = all.filter((txn: UpiTransaction) => sectionForDate(txn.date) === 'YESTERDAY');
    return { today: todayRows, yesterday: yesterdayRows };
  }, [summary.transactions]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brand}><View style={styles.avatar}><Text style={styles.avatarText}>S</Text></View><Text style={styles.brandTitle}>SyncSpend</Text></View>
        <View style={styles.icons}><Search color="#fff" size={30} /><Bell color="#fff" size={30} /></View>
      </View>

      <Text style={styles.balanceLabel}>Total balance</Text>
      <Text style={styles.balance}>${(summary.totalReceived - summary.totalSpent).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>

      <View style={styles.summaryCard}>
        <View><Text style={styles.cardLabel}>SPENT</Text><Text style={styles.cardValue}>${summary.totalSpent.toFixed(2)}</Text></View>
        <View style={styles.divider} />
        <View><Text style={styles.cardLabel}>RECEIVED</Text><Text style={[styles.cardValue, { color: Colors.success }]}>${summary.totalReceived.toFixed(2)}</Text></View>
      </View>

      <View style={styles.head}><Text style={styles.sectionTitle}>Recent Transactions</Text><Text style={styles.seeAll}>See All</Text></View>
      <Text style={styles.day}>TODAY</Text>
      {today.length > 0 ? today.map((txn: UpiTransaction) => <TxnRow key={txn.id} txn={txn} />) : null}

      <Text style={[styles.day, { marginTop: 20 }]}>YESTERDAY</Text>
      {yesterday.length > 0 ? yesterday.map((txn: UpiTransaction) => <TxnRow key={txn.id} txn={txn} />) : (summary.transactions.slice(0, 3) as UpiTransaction[]).map((txn: UpiTransaction) => <TxnRow key={`${txn.id}-f`} txn={txn} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  container: { paddingHorizontal: 28, paddingTop: 44, paddingBottom: 130 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 62 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#000', fontWeight: '800', fontSize: 16 },
  brandTitle: { color: '#fff', fontSize: 47 / 2, fontWeight: '800' },
  icons: { flexDirection: 'row', gap: 18 },
  balanceLabel: { color: '#9ca3af', textAlign: 'center', fontSize: 21 },
  balance: { color: '#fff', textAlign: 'center', fontSize: 66, fontWeight: '800', marginTop: 8 },
  summaryCard: { marginTop: 34, backgroundColor: '#101115', borderColor: '#2a2b31', borderWidth: 1, borderRadius: 20, paddingVertical: 24, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  cardLabel: { color: '#8b8e98', letterSpacing: 1, fontSize: 14 },
  cardValue: { color: '#fff', fontWeight: '800', fontSize: 47 / 2, marginTop: 8 },
  divider: { width: 1, height: 60, backgroundColor: '#2a2b31' },
  head: { marginTop: 42, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#fff', fontWeight: '800', fontSize: 25 * 1.05 },
  seeAll: { color: '#9ca3af', fontWeight: '700', fontSize: 18 },
  day: { color: '#6b7280', fontWeight: '800', letterSpacing: 1.2, marginTop: 18, marginBottom: 14, fontSize: 32 / 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  iconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#24252b', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3a3b42' },
  rowTitle: { color: '#fff', fontWeight: '800', fontSize: 22 * 1.03 },
  rowSub: { color: '#9ca3af', marginTop: 2, fontSize: 17 },
  amount: { color: '#fff', fontWeight: '800', fontSize: 22 * 1.03 },
  time: { color: '#9ca3af', marginTop: 3, fontSize: 17 },
});
