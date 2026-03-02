import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';

export default function HeroCard({ spent, received }: { spent: number; received: number }) {
    const net = received - spent;

    return (
        <LinearGradient colors={['#143459', '#13365f']} style={styles.card}>
            <Text style={styles.label}>Monthly Overview</Text>
            <Text style={styles.total}>₹{net.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <View style={styles.stats}>
                <View>
                    <Text style={styles.statLabel}>SPENT</Text>
                    <Text style={styles.spent}>↓ ₹{spent.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.divider} />
                <View>
                    <Text style={styles.statLabel}>RECEIVED</Text>
                    <Text style={styles.received}>↑ ₹{received.toLocaleString('en-IN')}</Text>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 36, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.primaryDark, marginBottom: Spacing.lg },
    label: { color: Colors.textSecondary, fontSize: 40 / 2 },
    total: { color: Colors.textPrimary, fontSize: 56, fontWeight: '800', marginVertical: Spacing.md },
    stats: { flexDirection: 'row', alignItems: 'center' },
    divider: { width: 1, backgroundColor: Colors.borderLight, height: 56, marginHorizontal: Spacing.md },
    statLabel: { color: Colors.textMuted, fontWeight: '700', marginBottom: 4 },
    spent: { color: Colors.textPrimary, fontSize: 38 / 2, fontWeight: '700' },
    received: { color: Colors.success, fontSize: 38 / 2, fontWeight: '700' },
});
