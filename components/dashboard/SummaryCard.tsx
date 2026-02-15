import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSizes, Spacing } from '../../constants/theme';
import { SpendSummary } from '../../services/types';
import GlassCard from '../auth/GlassCard';

interface SummaryCardProps {
    summary: SpendSummary;
}

function formatCurrency(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function SummaryCard({ summary }: SummaryCardProps) {
    return (
        <GlassCard>
            <Text style={styles.heading}>Spend Summary</Text>

            <View style={styles.row}>
                <StatBlock
                    icon={<TrendingDown size={20} color="#ff6b6b" />}
                    label="Total Spent"
                    value={formatCurrency(summary.totalSpent)}
                    valueColor="#ff6b6b"
                    count={summary.debitCount}
                />
                <View style={styles.divider} />
                <StatBlock
                    icon={<TrendingUp size={20} color="#51cf66" />}
                    label="Total Received"
                    value={formatCurrency(summary.totalReceived)}
                    valueColor="#51cf66"
                    count={summary.creditCount}
                />
            </View>

            <View style={styles.totalRow}>
                <BarChart3 size={16} color={Colors.cyberCyan} />
                <Text style={styles.totalLabel}>
                    {summary.transactionCount} transactions found
                </Text>
            </View>
        </GlassCard>
    );
}

function StatBlock({
    icon,
    label,
    value,
    valueColor,
    count,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    valueColor: string;
    count: number;
}) {
    return (
        <View style={styles.statBlock}>
            {icon}
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
            <Text style={styles.statCount}>{count} txns</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    heading: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.lg,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    divider: {
        width: 1,
        backgroundColor: Colors.glassBorder,
        alignSelf: 'stretch',
        marginHorizontal: Spacing.md,
    },
    statBlock: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    statValue: {
        fontSize: FontSizes.xl,
        fontWeight: '800',
    },
    statCount: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
        marginTop: Spacing.xs,
    },
    totalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.lg,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.glassBorder,
    },
    totalLabel: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginLeft: Spacing.sm,
    },
});
