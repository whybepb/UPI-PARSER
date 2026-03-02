import { Bell, Search, ShoppingBag, UtensilsCrossed, Car, Wallet, Clapperboard } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';
import { useTransactions } from '../../hooks/useTransactions';

const iconMap: Record<string, React.ReactNode> = {
  shopping: <ShoppingBag color="#fff" size={22} />,
  food: <UtensilsCrossed color="#fff" size={22} />,
  travel: <Car color="#fff" size={22} />,
  salary: <Wallet color="#fff" size={22} />,
  entertainment: <Clapperboard color="#fff" size={22} />,
};

export default function HomeTab() {
  const { summary } = useTransactions();
  const items = useMemo(() => summary.transactions.slice(0, 5), [summary.transactions]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brand}><View style={styles.avatar}><Text style={styles.avatarText}>S</Text></View><Text style={styles.brandTitle}>SyncSpend</Text></View>
        <View style={styles.icons}><Search color="#fff" size={28} /><Bell color="#fff" size={28} /></View>
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
      {items.map((txn: any) => (
        <View key={txn.id} style={styles.row}>
          <View style={styles.iconWrap}>{iconMap[txn.category] ?? <ShoppingBag color="#fff" size={20} />}</View>
          <View style={{ flex: 1 }}><Text style={styles.rowTitle}>{txn.category === 'salary' ? 'Freelance Payment' : txn.merchant}</Text><Text style={styles.rowSub}>{txn.merchant}</Text></View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.amount, txn.type === 'credit' && { color: Colors.success }]}>{txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}</Text>
            <Text style={styles.time}>{txn.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  container: { padding: 20, paddingTop: 36, paddingBottom: 120 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 52 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#000', fontWeight: '800', fontSize: 22 / 2 },
  brandTitle: { color: '#fff', fontSize: 24*0.9, fontWeight: '800' },
  icons: { flexDirection: 'row', gap: 22 },
  balanceLabel: { color: '#9ca3af', textAlign: 'center', fontSize: 42/2 },
  balance: { color: '#fff', textAlign: 'center', fontSize: 92/2, fontWeight: '800', marginTop: 8 },
  summaryCard: { marginTop: 34, backgroundColor: '#101115', borderColor: '#2a2b31', borderWidth: 1, borderRadius: 18, padding: 24, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  cardLabel: { color: '#8b8e98', letterSpacing: 1 },
  cardValue: { color: '#fff', fontWeight: '800', fontSize: 52/2, marginTop: 8 },
  divider: { width: 1, height: 64, backgroundColor: '#2a2b31' },
  head: { marginTop: 34, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#fff', fontWeight: '800', fontSize: 50/2 },
  seeAll: { color: '#9ca3af', fontWeight: '700', fontSize: 42/2 },
  day: { color: '#6b7280', fontWeight: '800', letterSpacing: 1.2, marginTop: 20, marginBottom: 12, fontSize: 36/2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: 18 },
  iconWrap: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#2a2b31', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3a3b42' },
  rowTitle: { color: '#fff', fontWeight: '800', fontSize: 48/2 },
  rowSub: { color: '#9ca3af', marginTop: 2, fontSize: 40/2 },
  amount: { color: '#fff', fontWeight: '800', fontSize: 52/2 },
  time: { color: '#9ca3af', marginTop: 2, fontSize: 38/2 },
});
