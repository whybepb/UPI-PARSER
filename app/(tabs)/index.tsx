import { Bell, RefreshCw, Wallet } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HeroCard from '../../components/dashboard/HeroCard';
import PermissionRequest from '../../components/dashboard/PermissionRequest';
import TransactionList from '../../components/dashboard/TransactionList';
import FilterChips, { FilterOption } from '../../components/ui/FilterChips';
import { Colors, Spacing } from '../../constants/theme';
import { useTransactions } from '../../hooks/useTransactions';

export default function DashboardTab() {
    const { summary, isLoading, hasPermission, requestPermissionAndScan, scanMessages, getFilteredTransactions, isUnsupported } = useTransactions();
    const [filter, setFilter] = useState<FilterOption>('all');
    const transactions = useMemo(() => getFilteredTransactions(filter), [filter, getFilteredTransactions]);

    return (
        <View style={styles.page}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <View style={styles.left}><View style={styles.logoCircle}><Wallet color={Colors.primary} size={20} /></View><Text style={styles.title}>SyncSpend</Text></View>
                    <Bell color={Colors.textPrimary} size={22} />
                </View>

                {isUnsupported ? <Text style={styles.warning}>SMS reading is only supported on Android.</Text> : null}

                {!hasPermission && !isUnsupported ? <PermissionRequest onGrant={requestPermissionAndScan} isLoading={isLoading} /> : null}

                {hasPermission ? (
                    <>
                        <HeroCard spent={summary.totalSpent} received={summary.totalReceived} />
                        <FilterChips value={filter} onChange={setFilter} />
                        <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Recent Transactions</Text><Text style={styles.link}>See all</Text></View>
                        {isLoading ? <ActivityIndicator color={Colors.primary} /> : <TransactionList transactions={transactions} />}
                    </>
                ) : null}
            </ScrollView>
            {hasPermission ? <TouchableOpacity style={styles.fab} onPress={() => scanMessages()}><RefreshCw color="white" size={24} /></TouchableOpacity> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: Colors.backgroundDark },
    container: { padding: Spacing.lg, paddingTop: 56, paddingBottom: 140 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
    left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    logoCircle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryDark },
    title: { color: Colors.textPrimary, fontSize: 44 / 2, fontWeight: '800' },
    sectionHead: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md, marginBottom: Spacing.md },
    sectionTitle: { color: Colors.textPrimary, fontSize: 42 / 2, fontWeight: '800' },
    link: { color: Colors.primary, fontWeight: '700', fontSize: 34 / 2 },
    fab: { position: 'absolute', right: 24, bottom: 24, width: 74, height: 74, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
    warning: { color: Colors.warning, marginBottom: Spacing.md },
});
