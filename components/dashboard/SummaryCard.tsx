import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSizes, Spacing } from '../../constants/theme';
import { SpendSummary } from '../../services/types';

export default function SummaryCard({ summary }: { summary: SpendSummary }) {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>Spend Summary</Text>
            <View style={styles.row}>
                <View style={styles.block}>
                    <ArrowDownLeft color={Colors.danger} size={18} />
                    <Text style={styles.label}>Total Spent</Text>
                    <Text style={[styles.value, { color: Colors.danger }]}>₹{summary.totalSpent.toFixed(0)}</Text>
                </View>
                <View style={styles.block}>
                    <ArrowUpRight color={Colors.success} size={18} />
                    <Text style={styles.label}>Total Received</Text>
                    <Text style={[styles.value, { color: Colors.success }]}>₹{summary.totalReceived.toFixed(0)}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: Colors.surfaceDark, borderRadius: 20, borderColor: Colors.border, borderWidth: 1, padding: Spacing.lg },
    title: { color: Colors.textPrimary, fontSize: FontSizes.lg, fontWeight: '700', marginBottom: Spacing.md },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    block: { gap: 4 },
    label: { color: Colors.textSecondary },
    value: { fontSize: FontSizes.xl, fontWeight: '800' },
});
