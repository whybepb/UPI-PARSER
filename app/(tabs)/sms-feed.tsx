import { Settings, ArrowLeft } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';

const tabs = ['all', 'parsed', 'ignored'] as const;

export default function SmsFeedTab() {
  const [filter, setFilter] = useState<typeof tabs[number]>('all');
  const { summary } = useTransactions();
  const txns = useMemo(() => summary.transactions.filter((txn: any) => {
    if (filter === 'parsed') return txn.parseStatus === 'parsed';
    if (filter === 'ignored') return txn.parseStatus !== 'parsed';
    return true;
  }).slice(0, 6), [summary.transactions, filter]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      <View style={styles.header}><ArrowLeft color="#fff" size={30} /><Text style={styles.title}>SMS Feed</Text><Settings color="#fff" size={28} /></View>
      <View style={styles.tabRow}>{tabs.map((t) => <TouchableOpacity key={t} style={[styles.tab, filter === t && styles.tabActive]} onPress={() => setFilter(t)}><Text style={[styles.tabText, filter === t && styles.tabTextActive]}>{t[0].toUpperCase() + t.slice(1)}</Text></TouchableOpacity>)}</View>
      <Text style={styles.section}>TODAY</Text>
      {txns.map((txn: any) => (
        <View key={txn.id} style={styles.card}>
          <Text style={styles.meta}>{txn.bank.toUpperCase()} • {txn.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          <View style={styles.raw}><Text style={styles.rawText}>{txn.rawMessage.slice(0, 96)}</Text></View>
          <View style={styles.bottom}><Text style={styles.category}>{txn.category}</Text><Text style={styles.amount}>${txn.amount.toFixed(2)}</Text></View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  container: { padding: 20, paddingTop: 34, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontWeight: '800', fontSize: 44/2 },
  tabRow: { marginTop: 20, flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#212228', paddingTop: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 19, backgroundColor: '#111217', borderWidth: 1, borderColor: '#2a2b31' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: '#a0a4ac', fontSize: 18, fontWeight: '600' },
  tabTextActive: { color: '#000', fontWeight: '800' },
  section: { color: '#6b7280', marginTop: 20, marginBottom: 12, fontWeight: '800', letterSpacing: 1 },
  card: { backgroundColor: '#15161b', borderRadius: 14, borderWidth: 1, borderColor: '#24262d', padding: 14, marginBottom: 12 },
  meta: { color: '#a0a4ac', fontWeight: '700' },
  raw: { backgroundColor: '#020202', borderRadius: 9, borderWidth: 1, borderColor: '#2a2b31', padding: 12, marginTop: 10 },
  rawText: { color: '#d1d5db', fontFamily: 'monospace' },
  bottom: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  category: { color: '#e5e7eb', fontSize: 30/2, fontWeight: '700' },
  amount: { color: '#fff', fontSize: 34/2, fontWeight: '800' },
});
