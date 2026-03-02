import { ArrowLeft, CheckCircle2, Circle, Edit3, Ellipsis, Settings, AlertCircle } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';
import { UpiTransaction } from '../../services/types';

const tabs = ['all', 'parsed', 'ignored'] as const;

type TabFilter = typeof tabs[number];

function sectionForDate(date: Date): 'TODAY' | 'YESTERDAY' | 'LAST WEEK' {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 24 * 60 * 60 * 1000;
  const startWeek = startToday - 7 * 24 * 60 * 60 * 1000;
  const t = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  if (t >= startToday) return 'TODAY';
  if (t >= startYesterday) return 'YESTERDAY';
  if (t >= startWeek) return 'LAST WEEK';
  return 'LAST WEEK';
}

function SmsCard({ txn }: { txn: UpiTransaction }) {
  const needsFix = txn.parseStatus !== 'parsed';
  return (
    <View style={[styles.card, needsFix && styles.cardMuted]}>
      <View style={styles.cardTop}>
        <View style={styles.metaWrap}>
          {needsFix ? <AlertCircle size={18} color="#ffffff" /> : <CheckCircle2 size={18} color="#ffffff" />}
          <Text style={styles.meta}>{txn.bank.toUpperCase()} • {txn.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        {needsFix ? <Edit3 size={18} color="#5e6168" /> : <Ellipsis size={18} color="#5e6168" />}
      </View>
      <View style={styles.raw}><Text style={styles.rawText}>{txn.rawMessage.slice(0, 110)}</Text></View>
      <View style={styles.bottom}>
        <View style={styles.categoryWrap}>{needsFix ? null : <Circle size={8} fill="#8b8e98" color="#8b8e98" />}<Text style={[styles.category, needsFix && styles.categoryMuted]}>{needsFix ? 'Uncategorized' : txn.category}</Text></View>
        <Text style={[styles.amount, needsFix && styles.amountMuted]}>{txn.amount.toFixed(2)}{needsFix ? '?' : ''}</Text>
      </View>
    </View>
  );
}

export default function SmsFeedTab() {
  const [filter, setFilter] = useState<TabFilter>('all');
  const { summary } = useTransactions();

  const txns = useMemo(() => summary.transactions.filter((txn: UpiTransaction) => {
    if (filter === 'parsed') return txn.parseStatus === 'parsed';
    if (filter === 'ignored') return txn.parseStatus !== 'parsed';
    return true;
  }).slice(0, 8), [summary.transactions, filter]);

  const grouped = useMemo(() => ({
    TODAY: txns.filter((txn: UpiTransaction) => sectionForDate(txn.date) === 'TODAY'),
    YESTERDAY: txns.filter((txn: UpiTransaction) => sectionForDate(txn.date) === 'YESTERDAY'),
    'LAST WEEK': txns.filter((txn: UpiTransaction) => sectionForDate(txn.date) === 'LAST WEEK'),
  }), [txns]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      <View style={styles.header}><ArrowLeft color="#fff" size={30} /><Text style={styles.title}>SMS Feed</Text><Settings color="#fff" size={28} /></View>
      <View style={styles.tabRow}>{tabs.map((t) => <TouchableOpacity key={t} style={[styles.tab, filter === t && styles.tabActive]} onPress={() => setFilter(t)}><Text style={[styles.tabText, filter === t && styles.tabTextActive]}>{t[0].toUpperCase() + t.slice(1)}</Text></TouchableOpacity>)}</View>

      {(['TODAY', 'YESTERDAY', 'LAST WEEK'] as const).map((section) => (
        <View key={section}>
          {grouped[section].length > 0 ? <Text style={styles.section}>{section}</Text> : null}
          {grouped[section].map((txn: UpiTransaction) => <SmsCard key={txn.id} txn={txn} />)}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  container: { padding: 20, paddingTop: 34, paddingBottom: 130 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontWeight: '800', fontSize: 44 / 2 },
  tabRow: { marginTop: 20, flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#212228', paddingTop: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 19, backgroundColor: '#111217', borderWidth: 1, borderColor: '#2a2b31' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: '#a0a4ac', fontSize: 18, fontWeight: '600' },
  tabTextActive: { color: '#000', fontWeight: '800' },
  section: { color: '#6b7280', marginTop: 20, marginBottom: 12, fontWeight: '800', letterSpacing: 1.2, fontSize: 14 },
  card: { backgroundColor: '#15161b', borderRadius: 16, borderWidth: 1, borderColor: '#24262d', padding: 14, marginBottom: 12 },
  cardMuted: { opacity: 0.85 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meta: { color: '#a0a4ac', fontWeight: '700' },
  raw: { backgroundColor: '#020202', borderRadius: 9, borderWidth: 1, borderColor: '#2a2b31', padding: 12, marginTop: 10 },
  rawText: { color: '#d1d5db', fontFamily: 'monospace', fontSize: 24 / 2, lineHeight: 20 },
  bottom: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  category: { color: '#e5e7eb', fontSize: 30 / 2, fontWeight: '700' },
  categoryMuted: { fontStyle: 'italic', color: '#9ca3af' },
  amount: { color: '#fff', fontSize: 34 / 2, fontWeight: '800' },
  amountMuted: { color: '#a1a1aa', textDecorationLine: 'underline' },
});
