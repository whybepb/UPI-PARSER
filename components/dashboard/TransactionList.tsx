import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSizes, Spacing } from '../../constants/theme';
import { UpiTransaction } from '../../services/types';
import GlassCard from '../auth/GlassCard';

interface TransactionListProps {
    transactions: UpiTransaction[];
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
    });
}

function formatAmount(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export default function TransactionList({ transactions }: TransactionListProps) {
    if (transactions.length === 0) {
        return (
            <GlassCard>
                <Text style={styles.emptyText}>No UPI transactions found.</Text>
            </GlassCard>
        );
    }

    return (
        <GlassCard>
            <Text style={styles.heading}>Recent Transactions</Text>
            <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => <TransactionItem txn={item} />}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </GlassCard>
    );
}

function TransactionItem({ txn }: { txn: UpiTransaction }) {
    const isDebit = txn.type === 'debit';

    return (
        <View style={styles.itemRow}>
            <View
                style={[
                    styles.iconCircle,
                    { backgroundColor: isDebit ? 'rgba(255,107,107,0.12)' : 'rgba(81,207,102,0.12)' },
                ]}
            >
                {isDebit ? (
                    <ArrowUpRight size={16} color="#ff6b6b" />
                ) : (
                    <ArrowDownLeft size={16} color="#51cf66" />
                )}
            </View>

            <View style={styles.itemInfo}>
                <Text style={styles.itemMerchant} numberOfLines={1}>
                    {txn.merchant}
                </Text>
                <Text style={styles.itemMeta}>
                    {txn.bank} • {formatDate(txn.date)}
                </Text>
            </View>

            <Text
                style={[
                    styles.itemAmount,
                    { color: isDebit ? '#ff6b6b' : '#51cf66' },
                ]}
            >
                {isDebit ? '-' : '+'}{formatAmount(txn.amount)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    heading: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    itemInfo: {
        flex: 1,
        marginRight: Spacing.sm,
    },
    itemMerchant: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    itemMeta: {
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    itemAmount: {
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
    separator: {
        height: 1,
        backgroundColor: Colors.glassBorder,
    },
    emptyText: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingVertical: Spacing.lg,
    },
});
