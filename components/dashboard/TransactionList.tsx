import { Car, CircleHelp, Fuel, ShoppingBag, ShoppingCart, UtensilsCrossed, WalletCards } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_MAP } from '../../constants/categoryTheme';
import { Colors, FontSizes, Spacing } from '../../constants/theme';
import { UpiTransaction } from '../../services/types';

interface TransactionListProps {
    transactions: UpiTransaction[];
}

const iconByCategory: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
    food: UtensilsCrossed,
    transport: Car,
    shopping: ShoppingBag,
    groceries: ShoppingCart,
    fuel: Fuel,
    subscription: WalletCards,
    salary: WalletCards,
    unknown: CircleHelp,
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
    const info = CATEGORY_MAP[txn.category] ?? CATEGORY_MAP.unknown;
    const Icon = iconByCategory[txn.category] ?? iconByCategory.unknown;
    const isDebit = txn.type === 'debit';

    return (
        <View style={styles.itemRow}>
            <View style={[styles.iconCircle, { backgroundColor: `${info.color}22` }]}>
                <Icon size={18} color={info.color} />
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemMerchant}>{txn.merchant}</Text>
                <Text style={styles.itemMeta}>{txn.bank} • {txn.date.toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.itemAmount, { color: isDebit ? Colors.textPrimary : Colors.success }]}>{isDebit ? '-' : '+'}₹{txn.amount.toFixed(2)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    itemRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, backgroundColor: '#19253f', borderRadius: 22 },
    iconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
    itemInfo: { flex: 1 },
    itemMerchant: { color: Colors.textPrimary, fontWeight: '700', fontSize: FontSizes.md },
    itemMeta: { color: Colors.textSecondary, marginTop: 3 },
    itemAmount: { fontSize: FontSizes.lg, fontWeight: '800' },
    separator: { height: Spacing.md },
    emptyText: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: Spacing.lg },
});
