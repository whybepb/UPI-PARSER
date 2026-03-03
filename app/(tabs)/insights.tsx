import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { CATEGORY_MAP } from '../../constants/categoryTheme';
import { useTransactions } from '../../hooks/useTransactions';
import { exportTransactionsCsv } from '../../services/exportService';

type Period = 'week' | 'month' | 'year';

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 }); }

export default function InsightsTab() {
  const [period, setPeriod] = useState<Period>('month');
  const [isExporting, setIsExporting] = useState(false);
  const { summary, getCategorySummary } = useTransactions();

  const filteredTotal = useMemo(() => {
    const now = new Date();
    return summary.transactions
      .filter((txn) => {
        if (txn.type !== 'debit') return false;
        const d = txn.date;
        if (period === 'week') {
          const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
          return d >= weekAgo;
        }
        if (period === 'month') {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        return d.getFullYear() === now.getFullYear();
      })
      .reduce((s, t) => s + t.amount, 0);
  }, [summary.transactions, period]);

  const data = useMemo(() => {
    const amounts = getCategorySummary();
    return (Object.entries(amounts) as [string, number][])
      .map(([category, amount]) => ({
        category,
        amount,
        count: summary.transactions.filter((t) => t.type === 'debit' && t.category === category).length,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [getCategorySummary, summary.transactions]);

  const total = filteredTotal || summary.totalSpent || 1;
  const radius = 75;
  const stroke = 16;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const onExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    const result = await exportTransactionsCsv(summary.transactions);
    setIsExporting(false);

    if (!result.ok) {
      Alert.alert('Export failed', result.error ?? 'Unable to export data.');
      return;
    }

    Alert.alert('Export complete', result.path ? `CSV generated at:\n${result.path}` : 'CSV export is ready.');
  };

  return (
    <ScrollView style={s.page} contentContainerStyle={s.container}>
      {/* Header */}
      <View style={s.header}>
        <MaterialIcons name="insights" size={22} color="#fff" />
        <Text style={s.headerTitle}>Spending Insights</Text>
        <TouchableOpacity style={s.exportBtn} onPress={() => void onExport()} disabled={isExporting}>
          <Text style={s.exportText}>{isExporting ? 'Exporting...' : 'Export'}</Text>
        </TouchableOpacity>
      </View>

      {/* Period Toggle */}
      <View style={s.toggleWrap}>
        <View style={s.toggleRow}>
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[s.toggleBtn, period === p && s.toggleActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[s.toggleText, period === p && s.toggleTextActive]}>
                {p[0].toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Total */}
      <View style={s.totalSection}>
        <Text style={s.totalValue}>{fmt(filteredTotal)}</Text>
        <Text style={s.totalLabel}>Total spent this {period}</Text>
      </View>

      {/* Donut Chart */}
      <View style={s.donutWrap}>
        <Svg width={200} height={200}>
          <Circle cx={100} cy={100} r={radius} stroke="#1a1a1a" strokeWidth={stroke} fill="none" />
          {data.map((item, idx) => {
            const pct = total > 0 ? item.amount / total : 0;
            const dash = pct * circumference;
            const strokeColor = idx === 0 ? '#ffffff' : idx === 1 ? '#525252' : '#262626';
            const node = (
              <Circle
                key={item.category}
                cx={100} cy={100} r={radius}
                stroke={strokeColor}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={-offset}
                rotation={-90}
                origin="100,100"
              />
            );
            offset += dash;
            return node;
          })}
        </Svg>
        <View style={s.donutCenter}>
          <Text style={s.donutPct}>{total > 0 ? Math.round(((data[0]?.amount ?? 0) / total) * 100) : 0}%</Text>
          <Text style={s.donutLabel}>ESSENTIALS</Text>
        </View>
      </View>

      {/* Categories Header */}
      <View style={s.catHeader}>
        <Text style={s.catHeaderTitle}>Categories</Text>
        <View style={s.sortBtn}>
          <MaterialIcons name="sort" size={16} color="#fff" />
        </View>
      </View>

      {/* Category Rows */}
      {data.map((item, idx) => {
        const pct = total ? Math.round((item.amount / total) * 100) : 0;
        const cat = CATEGORY_MAP[item.category] ?? CATEGORY_MAP.uncategorized;
        const isTop = idx === 0;
        return (
          <View key={item.category} style={s.catRow}>
            <View style={[s.catIcon, isTop && s.catIconTop]}>
              <Text style={[s.catIconText, isTop && s.catIconTextTop]}>{cat.label[0]}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={s.catMeta}>
                <Text style={s.catName}>{cat.label}</Text>
                <Text style={s.catAmount}>{fmt(item.amount)}</Text>
              </View>
              <View style={s.catMeta}>
                <Text style={s.catCount}>{item.count} transactions</Text>
                <Text style={s.catPct}>{pct}%</Text>
              </View>
              <View style={s.barBg}>
                <View style={[s.bar, { width: `${pct}%`, backgroundColor: isTop ? '#fff' : '#525252' }]} />
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  container: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 120 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  exportBtn: { borderWidth: 1, borderColor: '#333', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  exportText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  toggleWrap: { marginBottom: 24 },
  toggleRow: {
    flexDirection: 'row', backgroundColor: '#171717', borderRadius: 999, padding: 4,
    borderWidth: 1, borderColor: '#262626',
  },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: 'center' },
  toggleActive: { backgroundColor: '#fff' },
  toggleText: { color: '#6b7280', fontSize: 14, fontWeight: '700' },
  toggleTextActive: { color: '#000', fontWeight: '800' },

  totalSection: { alignItems: 'center', marginBottom: 20 },
  totalValue: { color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: -1.5 },
  totalLabel: { color: '#9ca3af', fontSize: 14, marginTop: 4 },

  donutWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutPct: { color: '#fff', fontSize: 28, fontWeight: '900' },
  donutLabel: { color: '#9ca3af', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginTop: 2 },

  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  catHeaderTitle: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  sortBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center' },

  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  catIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333',
    alignItems: 'center', justifyContent: 'center',
  },
  catIconTop: { backgroundColor: '#fff', borderColor: '#fff' },
  catIconText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  catIconTextTop: { color: '#000' },
  catMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catName: { color: '#fff', fontSize: 15, fontWeight: '800' },
  catAmount: { color: '#fff', fontSize: 15, fontWeight: '800' },
  catCount: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  catPct: { color: '#6b7280', fontSize: 12, fontWeight: '700', marginTop: 2 },
  barBg: { height: 4, backgroundColor: '#171717', borderRadius: 99, marginTop: 6 },
  bar: { height: 4, borderRadius: 99 },
});
