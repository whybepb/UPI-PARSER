import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';

export default function SettingsTab() {
  const { budget, summary, setMonthlyBudget } = useTransactions();
  const [value, setValue] = useState(String(Math.round(budget?.amount ?? 5000)));
  const spent = summary.totalSpent;
  const cap = Number(value) || 1;
  const pct = Math.min(100, Math.round((spent / cap) * 100));
  const remaining = Math.max(0, cap - spent);
  const month = useMemo(() => new Date().toLocaleString('en-US', { month: 'long' }), []);

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Budget Limits</Text>
      <Text style={styles.sub}>{month} monthly cap</Text>
      <TextInput value={value} onChangeText={setValue} keyboardType="numeric" style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={() => setMonthlyBudget(Number(value) || 0)}><Text style={styles.buttonText}>Save Budget</Text></TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.label}>Spent</Text><Text style={styles.money}>${spent.toFixed(2)}</Text>
        <Text style={styles.label}>Remaining</Text><Text style={[styles.money, { color: '#4ade80' }]}>${remaining.toFixed(2)}</Text>
        <View style={styles.barBg}><View style={[styles.bar, { width: `${pct}%` }]} /></View>
        <Text style={styles.meta}>{pct}% utilized</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000', padding: 20, paddingTop: 40 },
  title: { color: '#fff', fontWeight: '800', fontSize: 46/2 },
  sub: { color: '#9ca3af', marginTop: 8 },
  input: { marginTop: 16, backgroundColor: '#121317', borderColor: '#2a2b31', borderWidth: 1, borderRadius: 12, color: '#fff', padding: 14, fontSize: 22 },
  button: { marginTop: 12, backgroundColor: '#f3f4f6', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: '800' },
  card: { marginTop: 24, backgroundColor: '#121317', borderWidth: 1, borderColor: '#2a2b31', borderRadius: 18, padding: 16 },
  label: { color: '#9ca3af', marginTop: 6 },
  money: { color: '#fff', fontSize: 28, fontWeight: '800' },
  barBg: { marginTop: 12, height: 10, borderRadius: 99, backgroundColor: '#1f2025' },
  bar: { height: 10, borderRadius: 99, backgroundColor: '#f3f4f6' },
  meta: { color: '#9ca3af', marginTop: 8 },
});
