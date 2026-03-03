import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 }); }

export default function SettingsTab() {
  const { budget, summary, setMonthlyBudget } = useTransactions();
  const [value, setValue] = useState(String(Math.round(budget?.amount ?? 5000)));
  const spent = summary.totalSpent;
  const cap = Number(value) || 1;
  const pct = Math.min(100, Math.round((spent / cap) * 100));
  const remaining = Math.max(0, cap - spent);
  const month = useMemo(() => new Date().toLocaleString('en-US', { month: 'long' }), []);

  return (
    <View style={s.page}>
      <Text style={s.title}>Budget Limits</Text>
      <Text style={s.sub}>{month} monthly cap</Text>

      <TextInput
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
        style={s.input}
        placeholder="e.g. 10000"
        placeholderTextColor="#525252"
      />

      <TouchableOpacity style={s.button} onPress={() => setMonthlyBudget(Number(value) || 0)}>
        <Text style={s.buttonText}>Save Budget</Text>
      </TouchableOpacity>

      <View style={s.card}>
        <Text style={s.label}>Spent</Text>
        <Text style={s.money}>{fmt(spent)}</Text>
        <Text style={s.label}>Remaining</Text>
        <Text style={[s.money, { color: '#4ade80' }]}>{fmt(remaining)}</Text>
        <View style={s.barBg}>
          <View style={[s.bar, { width: `${pct}%`, backgroundColor: pct > 80 ? '#ef4444' : '#fff' }]} />
        </View>
        <Text style={s.meta}>{pct}% utilized</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16, paddingTop: 48 },
  title: { color: '#fff', fontWeight: '800', fontSize: 22, letterSpacing: -0.3 },
  sub: { color: '#9ca3af', fontSize: 14, marginTop: 4, marginBottom: 16 },
  input: {
    backgroundColor: '#121212', borderColor: '#262626', borderWidth: 1, borderRadius: 12,
    color: '#fff', padding: 14, fontSize: 18,
  },
  button: { marginTop: 12, backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: '800', fontSize: 15 },
  card: { marginTop: 24, backgroundColor: '#121212', borderWidth: 1, borderColor: '#262626', borderRadius: 16, padding: 16 },
  label: { color: '#9ca3af', fontSize: 12, fontWeight: '600', marginTop: 6 },
  money: { color: '#fff', fontSize: 22, fontWeight: '800' },
  barBg: { marginTop: 12, height: 6, borderRadius: 99, backgroundColor: '#1a1a1a' },
  bar: { height: 6, borderRadius: 99, backgroundColor: '#fff' },
  meta: { color: '#9ca3af', marginTop: 8, fontSize: 12 },
});
