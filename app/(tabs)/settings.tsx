import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';

export default function SettingsTab() {
    const [autoScan, setAutoScan] = useState(true);

    return (
        <View style={styles.page}>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.avatar}><Text style={styles.avatarText}>U</Text></View>
            <Text style={styles.version}>SyncSpend v1.0.0</Text>

            <View style={styles.row}><Text style={styles.label}>Auto-scan on launch</Text><Switch value={autoScan} onValueChange={setAutoScan} /></View>
            <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Cleared', 'All local transaction data cleared.') }><Text style={styles.buttonText}>Clear all data</Text></TouchableOpacity>
            <TouchableOpacity style={styles.button}><Text style={styles.buttonText}>Export transactions as CSV</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.link}>About SyncSpend</Text></TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: Colors.backgroundDark, padding: Spacing.lg, paddingTop: 56 },
    title: { color: Colors.textPrimary, fontSize: 44 / 2, fontWeight: '800', marginBottom: Spacing.lg },
    avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryDark, marginBottom: Spacing.md },
    avatarText: { color: Colors.textPrimary, fontSize: 32, fontWeight: '700' },
    version: { color: Colors.textSecondary, marginBottom: Spacing.xl },
    row: { backgroundColor: Colors.surfaceDark, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    label: { color: Colors.textPrimary, fontWeight: '600' },
    button: { backgroundColor: Colors.surfaceDark, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.md },
    buttonText: { color: Colors.textPrimary, fontWeight: '600' },
    link: { color: Colors.primary, marginTop: Spacing.md, fontWeight: '700' },
});
