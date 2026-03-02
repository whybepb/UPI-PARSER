import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import CategoryDonut from '../../components/insights/CategoryDonut';
import WeeklyChart from '../../components/insights/WeeklyChart';
import TimeToggle, { TimeRange } from '../../components/ui/TimeToggle';
import { Colors, Spacing } from '../../constants/theme';
import { useTransactions } from '../../hooks/useTransactions';

function getWeeklyData(amounts: number[]) {
    const weeks = [0, 0, 0, 0];
    amounts.forEach((amount, idx) => { weeks[Math.min(3, Math.floor(idx / Math.max(1, Math.ceil(amounts.length / 4))))] += amount; });
    return weeks;
}

export default function InsightsTab() {
    const [range, setRange] = useState<TimeRange>('month');
    const { summary, getCategorySummary } = useTransactions();

    const categoryData = useMemo(() => Object.entries(getCategorySummary()).map(([category, amount]) => ({ category, amount })), [getCategorySummary]);
    const weeklyData = useMemo(() => getWeeklyData(summary.transactions.filter((t) => t.type === 'debit').map((t) => t.amount)), [summary.transactions]);
    const total = categoryData.reduce((sum, item) => sum + item.amount, 0);

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.container}>
            <Text style={styles.title}>Spending Insights</Text>
            <TimeToggle value={range} onChange={setRange} />
            <View style={styles.block}><CategoryDonut data={categoryData} total={total} /></View>
            <WeeklyChart data={weeklyData} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: Colors.backgroundDark },
    container: { padding: Spacing.lg, paddingTop: 56, paddingBottom: 120, gap: Spacing.lg },
    title: { color: Colors.textPrimary, fontSize: 42 / 2, fontWeight: '800' },
    block: { marginTop: Spacing.sm },
});
