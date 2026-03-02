import { ArrowLeft, ChevronRight, CircleUserRound, CloudUpload, Download, Info, LogOut, Wallet } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const items = [
  { key: 'cloud', title: 'Cloud Sync', icon: CloudUpload },
  { key: 'export', title: 'Export Data', icon: Download },
  { key: 'budget', title: 'Budget Limits', icon: Wallet },
  { key: 'about', title: 'About', icon: Info },
];

export default function ProfileTab() {
  return (
    <View style={styles.page}>
      <View style={styles.top}><ArrowLeft color="#fff" size={30} /><Text style={styles.title}>Profile</Text><View style={{ width: 30 }} /></View>

      <View style={styles.avatar}><CircleUserRound color="#8f9098" size={52} /></View>
      <Text style={styles.name}>Alex Morgan</Text>
      <Text style={styles.email}>alex.morgan@example.com</Text>

      <View style={styles.list}>
        {items.map(({ key, title, icon: Icon }) => (
          <TouchableOpacity key={key} style={styles.item}>
            <View style={styles.ic}><Icon size={22} color="#111" /></View>
            <Text style={styles.itemText}>{title}</Text>
            <ChevronRight color="#111" size={26} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logout}><LogOut color="#fff" size={24} /><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>
      <Text style={styles.version}>Version 2.4.0 (Build 1024)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000', padding: 20, paddingTop: 34 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontWeight: '800', fontSize: 23 },
  avatar: { marginTop: 34, width: 170, height: 170, borderRadius: 85, backgroundColor: '#101115', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2a2b31' },
  name: { color: '#fff', textAlign: 'center', fontSize: 46, fontWeight: '800', marginTop: 20 },
  email: { color: '#9ca3af', textAlign: 'center', fontSize: 34 / 2, marginTop: 6 },
  list: { marginTop: 26, gap: 14 },
  item: { backgroundColor: '#f3f4f6', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center' },
  ic: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1, marginLeft: 14, color: '#0b0b0d', fontSize: 23, fontWeight: '700' },
  logout: { marginTop: 20, borderWidth: 2, borderColor: '#fff', borderRadius: 20, padding: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  logoutText: { color: '#fff', fontSize: 23, fontWeight: '800' },
  version: { textAlign: 'center', marginTop: 16, color: '#4b5563', fontSize: 18 },
});
