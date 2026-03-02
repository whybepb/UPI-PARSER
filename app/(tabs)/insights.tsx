import { ArrowLeft, SlidersHorizontal } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { CATEGORY_MAP } from '../../constants/categoryTheme';
import { useTransactions } from '../../hooks/useTransactions';

export default function InsightsTab() {
  const { summary, getCategorySummary } = useTransactions();
  const total = summary.totalSpent;
  const data = Object.entries(getCategorySummary()).slice(0, 5) as [string, number][];

  const radius = 90;
  const stroke = 20;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      <View style={styles.top}><ArrowLeft color="#fff" size={30} /><Text style={styles.title}>Spending Insights</Text><Text style={styles.export}>Export</Text></View>
      <View style={styles.switch}><Text style={styles.muted}>Week</Text><Text style={styles.active}>Month</Text><Text style={styles.muted}>Year</Text></View>

      <Text style={styles.total}>${total.toFixed(2)}</Text>
      <Text style={styles.sub}>Total spent this month</Text>

      <View style={styles.donutWrap}>
        <Svg width={220} height={220}>
          <Circle cx={110} cy={110} r={radius} stroke="#2d2f35" strokeWidth={stroke} fill="none" />
          {data.map(([cat, amount], idx) => {
            const pct = total > 0 ? amount / total : 0;
            const dash = pct * circumference;
            const node = <Circle key={cat} cx={110} cy={110} r={radius} stroke={idx % 2 === 0 ? '#f3f4f6' : '#3c3f46'} strokeWidth={stroke} fill="none" strokeDasharray={`${dash} ${circumference}`} strokeDashoffset={-offset} rotation={-90} origin="110,110" />;
            offset += dash;
            return node;
          })}
        </Svg>
        <View style={styles.center}><Text style={styles.centerBig}>{total ? Math.round((data[0]?.[1] || 0) / total * 100) : 0}%</Text><Text style={styles.centerSub}>ESSENTIALS</Text></View>
      </View>

      <View style={styles.catHead}><Text style={styles.catTitle}>Categories</Text><View style={styles.filterBtn}><SlidersHorizontal color="#fff" size={18} /></View></View>
      {data.map(([cat, amount]) => {
        const pct = total ? Math.round((amount / total) * 100) : 0;
        return (
          <View key={cat} style={styles.catRow}>
            <View style={styles.catIcon}><Text style={{ color: '#fff', fontWeight: '700' }}>{CATEGORY_MAP[cat]?.label?.[0] ?? 'U'}</Text></View>
            <View style={{ flex: 1 }}>
              <View style={styles.catTop}><Text style={styles.catName}>{CATEGORY_MAP[cat]?.label ?? cat}</Text><Text style={styles.catAmt}>${amount.toFixed(2)}</Text></View>
              <Text style={styles.catCount}>{Math.max(1, Math.round(pct / 4))} transactions</Text>
              <View style={styles.barBg}><View style={[styles.bar, { width: `${pct}%` }]} /></View>
            </View>
            <Text style={styles.pct}>{pct}%</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  container: { padding: 20, paddingTop: 34, paddingBottom: 130 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 44/2, fontWeight: '800' },
  export: { color: '#1e90ff', fontSize: 40/2, fontWeight: '700' },
  switch: { marginTop: 22, flexDirection: 'row', backgroundColor: '#141417', borderRadius: 18, borderWidth: 1, borderColor: '#292a2f', padding: 6, justifyContent: 'space-between' },
  muted: { color: '#8d9199', paddingHorizontal: 38, paddingVertical: 12, fontSize: 20*0.9, fontWeight: '700' },
  active: { color: '#000', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 38, paddingVertical: 12, fontSize: 20*0.9, fontWeight: '800' },
  total: { marginTop: 34, color: '#fff', textAlign: 'center', fontSize: 86/2, fontWeight: '900' },
  sub: { color: '#9ca3af', textAlign: 'center', marginTop: 6, fontSize: 42/2 },
  donutWrap: { marginTop: 22, alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  centerBig: { color: '#fff', fontWeight: '900', fontSize: 66/2 },
  centerSub: { color: '#9ca3af', marginTop: 4, fontWeight: '700' },
  catHead: { marginTop: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catTitle: { color: '#fff', fontSize: 50/2, fontWeight: '800' },
  filterBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#191a20', alignItems: 'center', justifyContent: 'center' },
  catRow: { flexDirection: 'row', gap: 12, marginTop: 18, alignItems: 'center' },
  catIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#292a2f', alignItems: 'center', justifyContent: 'center' },
  catTop: { flexDirection: 'row', justifyContent: 'space-between' },
  catName: { color: '#fff', fontSize: 44/2, fontWeight: '800' },
  catAmt: { color: '#fff', fontSize: 44/2, fontWeight: '800' },
  catCount: { color: '#9ca3af', marginBottom: 6 },
  barBg: { height: 8, backgroundColor: '#1f2025', borderRadius: 99 },
  bar: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 99 },
  pct: { color: '#9ca3af', fontWeight: '700', width: 40, textAlign: 'right' },
});
