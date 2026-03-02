import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCategoryInfo } from '../../services/categoryEngine';
import { UpiTransaction } from '../../services/types';
import { Colors, Spacing } from '../../constants/theme';

export default function SmsCard({ txn }: { txn: UpiTransaction }) {
    const reviewNeeded = txn.category === 'unknown' || txn.merchant === 'Unknown';
    const info = getCategoryInfo(txn.category);

    return (
        <View style={[styles.card, reviewNeeded && styles.warningBorder]}>
            <View style={styles.row}>
                {reviewNeeded ? <AlertCircle size={18} color={Colors.warning} /> : <CheckCircle2 size={18} color={Colors.success} />}
                <Text style={[styles.status, reviewNeeded && { color: Colors.warning }]}>{reviewNeeded ? 'Review Needed' : 'Successfully Parsed'} • {txn.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <Text style={styles.raw}>{`"${txn.rawMessage}"`}</Text>
            <View style={styles.divider} />
            <View style={styles.bottomRow}>
                <View>
                    <Text style={[styles.amount, !reviewNeeded && { color: Colors.primary }]}>₹{txn.amount.toFixed(2)}</Text>
                    <Text style={styles.category}>{info.label.toUpperCase()}</Text>
                </View>
                <TouchableOpacity style={styles.button}><Text style={styles.buttonText}>{reviewNeeded ? 'Fix Now' : 'Edit'}</Text></TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#0f1a3b', borderRadius: 20, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, marginBottom: Spacing.md },
    warningBorder: { borderColor: 'rgba(245,158,11,0.35)' },
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
    status: { color: Colors.textSecondary, fontWeight: '700' },
    raw: { color: '#b7c0d1', fontSize: 34 / 2, fontStyle: 'italic', lineHeight: 30 },
    divider: { borderTopWidth: 1, borderTopColor: Colors.border, marginVertical: Spacing.md },
    amount: { color: Colors.textPrimary, fontSize: 46 / 2, fontWeight: '800' },
    category: { color: Colors.textSecondary, fontWeight: '700', marginTop: 4 },
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    button: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: Spacing.md, paddingVertical: 10 },
    buttonText: { color: 'white', fontWeight: '700' },
});
