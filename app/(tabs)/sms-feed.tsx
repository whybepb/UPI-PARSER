import { RefreshCw } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SmsCard from '../../components/sms/SmsCard';
import { Colors, Spacing } from '../../constants/theme';
import { useTransactions } from '../../hooks/useTransactions';

const FILTERS = ['all', 'parsed', 'review'] as const;

export default function SmsFeedTab() {
    const [filter, setFilter] = useState<typeof FILTERS[number]>('all');
    const { summary, scanMessages } = useTransactions();

    const txns = useMemo(() => {
        return summary.transactions.filter((txn) => {
            const review = txn.category === 'unknown' || txn.merchant === 'Unknown';
            if (filter === 'parsed') return !review;
            if (filter === 'review') return review;
            return true;
        });
    }, [summary.transactions, filter]);

    return (
        <View style={styles.page}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>SMS Sync Activity</Text>
                <View style={styles.tabs}>{FILTERS.map((item) => <TouchableOpacity key={item} onPress={() => setFilter(item)} style={styles.tab}><Text style={[styles.tabText, filter === item && styles.tabActive]}>{item === 'all' ? 'All' : item === 'parsed' ? 'Parsed' : 'Review Needed'}</Text></TouchableOpacity>)}</View>
                <Text style={styles.section}>TODAY</Text>
                {txns.slice(0, 4).map((txn) => <SmsCard key={txn.id} txn={txn} />)}
            </ScrollView>
            <TouchableOpacity style={styles.fab} onPress={() => scanMessages()}><RefreshCw color="white" size={22} /><Text style={styles.fabText}>Sync Now</Text></TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: Colors.backgroundDark },
    container: { padding: Spacing.lg, paddingTop: 56, paddingBottom: 140 },
    title: { color: Colors.textPrimary, fontSize: 42 / 2, fontWeight: '800', marginBottom: Spacing.md },
    tabs: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
    tab: { paddingBottom: 12 },
    tabText: { color: Colors.textSecondary, fontWeight: '700', fontSize: 36 / 2 },
    tabActive: { color: Colors.primary, borderBottomWidth: 3, borderBottomColor: Colors.primary, paddingBottom: 10 },
    section: { color: Colors.textMuted, fontSize: 40 / 2, fontWeight: '700', marginBottom: Spacing.md },
    fab: { position: 'absolute', right: 22, bottom: 26, flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center' },
    fabText: { color: 'white', fontWeight: '800', fontSize: 36 / 2 },
});
