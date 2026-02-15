import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AnimatedBackground from '../components/auth/AnimatedBackground';
import GlassCard from '../components/auth/GlassCard';
import GradientButton from '../components/auth/GradientButton';
import { Colors, FontSizes, Spacing } from '../constants/theme';

export default function HomeScreen() {
    const router = useRouter();

    return (
        <AnimatedBackground>
            <StatusBar style="light" />
            <View style={styles.container}>
                <GlassCard style={styles.card}>
                    <Text style={styles.title}>Welcome Home! 🏠</Text>
                    <Text style={styles.subtitle}>
                        You have successfully navigated to the home screen. This is a testing landing page.
                    </Text>

                    <GradientButton
                        title="Back to Login"
                        onPress={() => router.replace('/')}
                        style={{ marginTop: Spacing.lg }}
                    />
                </GlassCard>
            </View>
        </AnimatedBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    card: {
        width: '100%',
        alignItems: 'center',
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: '800',
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
});
