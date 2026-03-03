import React, { useState } from 'react';
import {
  Alert, FlatList, Modal, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';
import { ALL_CATEGORIES } from '../../services/categoryEngine';

export default function QuickAddScreen() {
  const { addManual } = useTransactions();
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [selectedCat, setSelectedCat] = useState('shopping');
  const [showPicker, setShowPicker] = useState(false);

  const catLabel = ALL_CATEGORIES.find((c) => c.key === selectedCat)?.label ?? 'Select';

  const onSave = async () => {
    if (!merchant || !amount) return;
    await addManual({ type, amount: Number(amount), merchant, category: selectedCat });
    Alert.alert('Added', 'Transaction saved ✓');
    setMerchant('');
    setAmount('');
  };

  return (
    <View style={s.page}>
      <Text style={s.title}>Add Transaction</Text>
      <Text style={s.sub}>Enter a manual expense or income</Text>

      {/* Type toggle */}
      <View style={s.toggleRow}>
        {(['debit', 'credit'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.toggleBtn, type === t && s.toggleActive]}
            onPress={() => setType(t)}
          >
            <Text style={[s.toggleText, type === t && s.toggleTextActive]}>
              {t === 'debit' ? 'Expense' : 'Income'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Merchant */}
      <Text style={s.label}>Merchant / Description</Text>
      <TextInput
        style={s.input}
        placeholder="e.g. Swiggy, Uber"
        placeholderTextColor="#525252"
        value={merchant}
        onChangeText={setMerchant}
      />

      {/* Amount */}
      <Text style={s.label}>Amount (₹)</Text>
      <TextInput
        style={s.input}
        placeholder="e.g. 250"
        placeholderTextColor="#525252"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {/* Category Picker */}
      <Text style={s.label}>Category</Text>
      <TouchableOpacity style={s.catButton} onPress={() => setShowPicker(true)}>
        <Text style={s.catButtonText}>{catLabel}</Text>
        <Text style={{ color: '#525252' }}>▼</Text>
      </TouchableOpacity>

      {/* Save */}
      <TouchableOpacity style={s.button} onPress={onSave}>
        <Text style={s.buttonText}>Save Transaction</Text>
      </TouchableOpacity>

      {/* Category Modal */}
      <Modal visible={showPicker} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Choose Category</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={{ color: '#9ca3af', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={ALL_CATEGORIES.filter((c) => c.key !== 'uncategorized')}
              keyExtractor={(c) => c.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[s.catItem, selectedCat === item.key && s.catItemActive]}
                  onPress={() => { setSelectedCat(item.key); setShowPicker(false); }}
                >
                  <View style={[s.catDot, { backgroundColor: item.color }]} />
                  <Text style={s.catItemText}>{item.label}</Text>
                  {selectedCat === item.key && <Text style={{ color: '#4ade80' }}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000', paddingHorizontal: 16, paddingTop: 48 },
  title: { color: '#fff', fontWeight: '800', fontSize: 22, letterSpacing: -0.3 },
  sub: { color: '#9ca3af', fontSize: 14, marginTop: 4, marginBottom: 20 },

  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#121212', borderWidth: 1, borderColor: '#262626', alignItems: 'center' },
  toggleActive: { backgroundColor: '#fff', borderColor: '#fff' },
  toggleText: { color: '#9ca3af', fontSize: 14, fontWeight: '700' },
  toggleTextActive: { color: '#000', fontWeight: '800' },

  label: { color: '#9ca3af', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#121212', borderColor: '#262626', borderWidth: 1, borderRadius: 12,
    padding: 14, color: '#fff', fontSize: 15,
  },

  catButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#121212', borderColor: '#262626', borderWidth: 1, borderRadius: 12,
    padding: 14,
  },
  catButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  button: { marginTop: 24, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: '800', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#121212', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16, paddingBottom: 40, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },

  catItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, gap: 12 },
  catItemActive: { backgroundColor: '#1a1a1a' },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catItemText: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600' },
});
