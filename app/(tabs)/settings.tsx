import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';

function formatMoney(value: number): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function SettingsTab() {
  const { budget, summary, setMonthlyBudget } = useTransactions();
  const [value, setValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (budget?.amount && budget.amount > 0) {
      setValue(String(Math.round(budget.amount)));
      return;
    }
    setValue('5000');
  }, [budget?.amount]);

  const spent = summary.totalSpent;
  const cap = Number(value);
  const validCap = Number.isFinite(cap) && cap > 0 ? cap : 0;
  const pct = validCap > 0 ? Math.min(100, Math.round((spent / validCap) * 100)) : 0;
  const remaining = Math.max(0, validCap - spent);
  const month = useMemo(() => new Date().toLocaleString('en-US', { month: 'long' }), []);

  const onSaveBudget = async () => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
      setMessageType('error');
      setMessage('Enter a valid budget amount greater than 0.');
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);
      setMessageType(null);
      await setMonthlyBudget(amount);
      setMessageType('success');
      setMessage('Budget saved successfully.');
    } catch (e: any) {
      setMessageType('error');
      setMessage(e?.message ?? 'Failed to save budget.');
    } finally {
      setIsSaving(false);
    }
  };

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

      <TouchableOpacity
        style={[s.button, isSaving && s.buttonDisabled]}
        onPress={() => void onSaveBudget()}
        disabled={isSaving}
      >
        <Text style={s.buttonText}>{isSaving ? 'Saving...' : 'Save Budget'}</Text>
      </TouchableOpacity>

      {message ? (
        <Text style={[s.message, messageType === 'error' ? s.errorText : s.successText]}>{message}</Text>
      ) : null}

      <View style={s.card}>
        <Text style={s.label}>Spent</Text>
        <Text style={s.money}>{formatMoney(spent)}</Text>
        <Text style={s.label}>Remaining</Text>
        <Text style={[s.money, { color: '#4ade80' }]}>{formatMoney(remaining)}</Text>
        <View style={s.barBg}>
          <View style={[s.bar, { width: `${pct}%`, backgroundColor: pct > 80 ? '#ef4444' : '#ffffff' }]} />
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
    backgroundColor: '#121212',
    borderColor: '#262626',
    borderWidth: 1,
    borderRadius: 12,
    color: '#fff',
    padding: 14,
    fontSize: 18,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { color: '#000', fontWeight: '800', fontSize: 15 },
  message: { marginTop: 10, fontSize: 13, fontWeight: '600' },
  successText: { color: '#4ade80' },
  errorText: { color: '#f87171' },
  card: {
    marginTop: 24,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 16,
    padding: 16,
  },
  label: { color: '#9ca3af', fontSize: 12, fontWeight: '600', marginTop: 6 },
  money: { color: '#fff', fontSize: 22, fontWeight: '800' },
  barBg: { marginTop: 12, height: 6, borderRadius: 99, backgroundColor: '#1a1a1a' },
  bar: { height: 6, borderRadius: 99 },
  meta: { color: '#9ca3af', marginTop: 8, fontSize: 12 },
});
