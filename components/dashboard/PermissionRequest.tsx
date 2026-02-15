import { ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSizes, Spacing } from '../../constants/theme';
import GlassCard from '../auth/GlassCard';
import GradientButton from '../auth/GradientButton';

interface PermissionRequestProps {
    onGrant: () => void;
    isLoading?: boolean;
}

export default function PermissionRequest({ onGrant, isLoading }: PermissionRequestProps) {
    return (
        <GlassCard>
            <View style={styles.container}>
                <View style={styles.iconCircle}>
                    <ShieldCheck size={36} color={Colors.cyberCyan} />
                </View>

                <Text style={styles.title}>Read Your Messages</Text>
                <Text style={styles.description}>
                    UPI Parser needs permission to read your SMS messages to find and analyze UPI transactions.
                    Your data stays on your device — nothing is uploaded.
                </Text>

                <View style={styles.features}>
                    <FeatureItem text="Scans only transactional SMS" />
                    <FeatureItem text="100% offline — no data leaves your phone" />
                    <FeatureItem text="Instant spending insights" />
                </View>

                <GradientButton
                    title={isLoading ? 'Scanning...' : 'Grant SMS Access'}
                    onPress={onGrant}
                    style={{ marginTop: Spacing.lg }}
                />
            </View>
        </GlassCard>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <View style={styles.featureRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.featureText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(0, 240, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: '800',
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    description: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Spacing.lg,
    },
    features: {
        alignSelf: 'stretch',
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    bullet: {
        color: Colors.cyberCyan,
        fontSize: FontSizes.md,
        marginRight: Spacing.sm,
    },
    featureText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
});
