import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';

export default function QuickAddScreen() {
  const { addManual } = useTransactions();
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');

  const onSave = async () => {
    if (!merchant || !amount) return;
    await addManual({ type: 'debit', amount: Number(amount), merchant, category: 'shopping' });
    Alert.alert('Added', 'Manual transaction saved');
    setMerchant('');
    setAmount('');
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Add Transaction</Text>
      <TextInput style={styles.input} placeholder="Merchant" placeholderTextColor="#6b7280" value={merchant} onChangeText={setMerchant} />
      <TextInput style={styles.input} placeholder="Amount" placeholderTextColor="#6b7280" keyboardType="numeric" value={amount} onChangeText={setAmount} />
      <TouchableOpacity style={styles.button} onPress={onSave}><Text style={styles.buttonText}>Save</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000', padding: 20, paddingTop: 40 },
  title: { color: '#fff', fontWeight: '800', fontSize: 26, marginBottom: 20 },
  input: { backgroundColor: '#121317', borderColor: '#2a2b31', borderWidth: 1, borderRadius: 12, padding: 14, color: '#fff', marginBottom: 12 },
  button: { backgroundColor: '#f3f4f6', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: '800' },
});
