import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AnimatedBackground from '../components/auth/AnimatedBackground';
import GradientButton from '../components/auth/GradientButton';
import PermissionRequest from '../components/dashboard/PermissionRequest';
import SummaryCard from '../components/dashboard/SummaryCard';
import TransactionList from '../components/dashboard/TransactionList';
import { Colors, FontSizes, Spacing } from '../constants/theme';
import {
    checkSmsPermission,
    getUpiTransactions,
    requestSmsPermission,
} from '../services/smsReader';
import { SpendSummary } from '../services/types';

type ScreenState = 'checking' | 'needsPermission' | 'scanning' | 'ready' | 'unsupported';

export default function HomeScreen() {
    const [state, setState] = useState<ScreenState>('checking');
    const [summary, setSummary] = useState<SpendSummary | null>(null);

    // Check permission on mount
    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'android') {
                setState('unsupported');
                return;
            }
            const hasPermission = await checkSmsPermission();
            setState(hasPermission ? 'scanning' : 'needsPermission');
            if (hasPermission) {
                await scanMessages();
            }
        })();
    }, []);

    const scanMessages = useCallback(async () => {
        setState('scanning');
        try {
            const result = await getUpiTransactions(1000);
            setSummary(result);
            setState('ready');
        } catch (err) {
            console.warn('Scan error:', err);
            setState('ready');
            setSummary({
                totalSpent: 0,
                totalReceived: 0,
                transactionCount: 0,
                debitCount: 0,
                creditCount: 0,
                transactions: [],
            });
        }
    }, []);

    const handleGrantPermission = useCallback(async () => {
        const granted = await requestSmsPermission();
        if (granted) {
            await scanMessages();
        }
    }, [scanMessages]);

    return (
        <AnimatedBackground>
            <StatusBar style="light" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.appTitle}>UPI Parser</Text>

                {state === 'checking' && (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={Colors.cyberCyan} />
                    </View>
                )}

                {state === 'unsupported' && (
                    <View style={styles.center}>
                        <Text style={styles.unsupportedText}>
                            SMS reading is only available on Android devices.
                        </Text>
                    </View>
                )}

                {state === 'needsPermission' && (
                    <PermissionRequest onGrant={handleGrantPermission} />
                )}

                {state === 'scanning' && (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={Colors.cyberCyan} />
                        <Text style={styles.scanningText}>
                            Scanning your messages...
                        </Text>
                    </View>
                )}

                {state === 'ready' && summary && (
                    <>
                        <SummaryCard summary={summary} />
                        <View style={styles.spacer} />
                        <TransactionList transactions={summary.transactions} />
                        <View style={styles.spacer} />
                        <GradientButton
                            title="Rescan Messages"
                            onPress={scanMessages}
                        />
                    </>
                )}
            </ScrollView>
        </AnimatedBackground>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spacing.lg,
        paddingTop: 60,
        paddingBottom: Spacing.xxl,
    },
    appTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: Spacing.lg,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl,
    },
    scanningText: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        marginTop: Spacing.md,
    },
    unsupportedText: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    spacer: {
        height: Spacing.md,
    },
});
