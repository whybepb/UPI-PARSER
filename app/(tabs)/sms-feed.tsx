import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList, Modal, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { useTransactions } from '../../hooks/useTransactions';
import { ALL_CATEGORIES } from '../../services/categoryEngine';
import { UpiTransaction } from '../../services/types';

const tabs = ['all', 'parsed', 'ignored'] as const;
type TabFilter = (typeof tabs)[number];

function sectionForDate(date: Date): 'TODAY' | 'YESTERDAY' | 'LAST WEEK' {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  if (t >= startToday) return 'TODAY';
  if (t >= startToday - 86400000) return 'YESTERDAY';
  return 'LAST WEEK';
}

function SmsCard({ txn, onCategorize }: { txn: UpiTransaction; onCategorize: (id: string) => void }) {
  const needsFix = txn.parseStatus !== 'parsed';
  return (
    <View style={[s.card, needsFix && { opacity: 0.8 }]}>
      <View style={s.cardTop}>
        <View style={s.cardMeta}>
          <Text style={{ color: '#fff', fontSize: 14 }}>{needsFix ? '⚠' : '✓'}</Text>
          <Text style={s.metaText}>
            {txn.bank.toUpperCase()} • {txn.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onCategorize(txn.id)}>
          <Text style={{ color: '#525252', fontSize: 14 }}>{needsFix ? '✎' : '⋯'}</Text>
        </TouchableOpacity>
      </View>
      <View style={s.rawBox}>
        <Text style={s.rawText}>{txn.rawMessage.slice(0, 120)}</Text>
      </View>
      <View style={s.cardBottom}>
        <View style={s.catWrap}>
          {!needsFix && <View style={s.catDot} />}
          <Text style={[s.catText, needsFix && { fontStyle: 'italic', color: '#9ca3af' }]}>
            {needsFix ? 'Uncategorized' : txn.category}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[s.amountText, needsFix && { color: '#a1a1aa', textDecorationLine: 'underline' }]}>
            ₹{txn.amount.toFixed(2)}{needsFix ? '?' : ''}
          </Text>
          <TouchableOpacity onPress={() => onCategorize(txn.id)} style={s.editBtn}>
            <Text style={s.editBtnText}>{needsFix ? 'Fix' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function SmsFeedTab() {
  const [filter, setFilter] = useState<TabFilter>('all');
  const [catModalId, setCatModalId] = useState<string | null>(null);
  const { summary, updateCategory } = useTransactions();

  const txns = useMemo(
    () => summary.transactions
      .filter((txn) => {
        if (filter === 'parsed') return txn.parseStatus === 'parsed';
        if (filter === 'ignored') return txn.parseStatus !== 'parsed';
        return true;
      })
      .slice(0, 15),
    [summary.transactions, filter],
  );

  const grouped = useMemo(() => ({
    TODAY: txns.filter((t) => sectionForDate(t.date) === 'TODAY'),
    YESTERDAY: txns.filter((t) => sectionForDate(t.date) === 'YESTERDAY'),
    'LAST WEEK': txns.filter((t) => sectionForDate(t.date) === 'LAST WEEK'),
  }), [txns]);

  const handleCategorize = (cat: string) => {
    if (catModalId) { updateCategory(catModalId, cat); setCatModalId(null); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ScrollView style={s.page} contentContainerStyle={s.container}>
        <View style={s.header}>
          <MaterialIcons name="sms" size={22} color="#fff" />
          <Text style={s.headerTitle}>SMS Feed</Text>
          <MaterialIcons name="settings" size={20} color="#fff" />
        </View>

        <View style={s.tabRow}>
          {tabs.map((t) => (
            <TouchableOpacity
              key={t}
              style={[s.tab, filter === t && s.tabActive]}
              onPress={() => setFilter(t)}
            >
              <Text style={[s.tabText, filter === t && s.tabTextActive]}>
                {t[0].toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {(['TODAY', 'YESTERDAY', 'LAST WEEK'] as const).map((section) =>
          grouped[section].length > 0 ? (
            <View key={section}>
              <Text style={s.sectionLabel}>{section}</Text>
              {grouped[section].map((txn) => (
                <SmsCard key={txn.id} txn={txn} onCategorize={setCatModalId} />
              ))}
            </View>
          ) : null,
        )}

        {txns.length === 0 && (
          <Text style={s.emptyText}>No SMS transactions found.</Text>
        )}
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal visible={catModalId !== null} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Choose Category</Text>
              <TouchableOpacity onPress={() => setCatModalId(null)}>
                <Text style={{ color: '#9ca3af', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={ALL_CATEGORIES.filter((c) => c.key !== 'uncategorized')}
              keyExtractor={(c) => c.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.catItem}
                  onPress={() => handleCategorize(item.key)}
                >
                  <View style={[s.catItemDot, { backgroundColor: item.color }]} />
                  <Text style={s.catItemText}>{item.label}</Text>
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
  page: { flex: 1 },
  container: { paddingHorizontal: 16, paddingTop: 48, paddingBottom: 120 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#171717', paddingBottom: 12 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },

  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: '#171717', borderWidth: 1, borderColor: '#262626' },
  tabActive: { backgroundColor: '#fff', borderColor: '#fff' },
  tabText: { color: '#a1a1aa', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#000', fontWeight: '800' },

  sectionLabel: { color: '#525252', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12, marginTop: 16, marginLeft: 2 },

  card: { backgroundColor: '#171717', borderRadius: 14, borderWidth: 1, borderColor: '#262626', padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#a1a1aa', fontSize: 12, fontWeight: '700' },

  rawBox: { backgroundColor: '#000', borderRadius: 8, borderWidth: 1, borderColor: '#262626', padding: 10, marginTop: 10 },
  rawText: { color: '#d1d5db', fontFamily: 'monospace', fontSize: 11, lineHeight: 18 },

  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#262626' },
  catWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  catText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  amountText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  editBtn: { backgroundColor: '#262626', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  editBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  emptyText: { color: '#6b7280', fontSize: 14, textAlign: 'center', paddingVertical: 40 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#121212', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16, paddingBottom: 40, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },

  catItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, gap: 12 },
  catItemDot: { width: 10, height: 10, borderRadius: 5 },
  catItemText: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600' },
});
