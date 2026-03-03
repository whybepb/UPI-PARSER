import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_MAP } from '../../constants/categoryTheme';
import { Colors, FontSizes, Spacing } from '../../constants/theme';
import { UpiTransaction } from '../../services/types';

interface TransactionListProps {
    transactions: UpiTransaction[];
}

const iconByCategory: Record<string, string> = {
    food: 'restaurant',
    travel: 'directions-car',
    transport: 'directions-car',
    shopping: 'shopping-bag',
    groceries: 'shopping-cart',
    fuel: 'local-gas-station',
    subscription: 'subscriptions',
    salary: 'account-balance-wallet',
    entertainment: 'movie',
    bills: 'receipt-long',
    health: 'fitness-center',
    education: 'school',
    transfer: 'swap-horiz',
    person_sent: 'send',
    person_received: 'payments',
    uncategorized: 'help-outline',
};

export default function TransactionList({ transactions }: TransactionListProps) {
    return (
        <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => <TransactionItem txn={item} />}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={<Text style={styles.emptyText}>No transactions found.</Text>}
        />
    );
}

function TransactionItem({ txn }: { txn: UpiTransaction }) {
    const info = CATEGORY_MAP[txn.category] ?? CATEGORY_MAP.uncategorized;
    const iconName = iconByCategory[txn.category] ?? iconByCategory.uncategorized;
    const isDebit = txn.type === 'debit';

    return (
        <View style={styles.itemRow}>
            <View style={[styles.iconCircle, { backgroundColor: `${info.color}22` }]}>
                <MaterialIcons name={iconName as never} size={18} color={info.color} />
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemMerchant}>{txn.merchant}</Text>
                <Text style={styles.itemMeta}>
                    {txn.bank} • {txn.date.toLocaleDateString()}
                </Text>
            </View>
            <Text style={[styles.itemAmount, { color: isDebit ? Colors.textPrimary : Colors.success }]}>
                {isDebit ? '-' : '+'}₹{txn.amount.toFixed(2)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: '#141417',
        borderRadius: 22,
    },
    iconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    itemInfo: { flex: 1 },
    itemMerchant: { color: Colors.textPrimary, fontWeight: '700', fontSize: FontSizes.md },
    itemMeta: { color: Colors.textSecondary, marginTop: 3 },
    itemAmount: { fontSize: FontSizes.lg, fontWeight: '800' },
    separator: { height: Spacing.md },
    emptyText: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: Spacing.lg },
});
