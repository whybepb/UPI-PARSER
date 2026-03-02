import { useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSizes, Spacing } from '../../constants/theme';
import GlassInput from './GlassInput';
import GradientButton from './GradientButton';

interface LoginFormProps {
    onToggle: () => void;
}

export default function LoginForm({ onToggle }: LoginFormProps) {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.form}>
                <GlassInput
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon={<Mail size={18} color={Colors.textSecondary} />}
                />
                <GlassInput
                    placeholder="Password"
                    secureTextEntry
                    icon={<Lock size={18} color={Colors.textSecondary} />}
                />

                <TouchableOpacity style={styles.forgot}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                <GradientButton
                    title="Sign In"
                    onPress={() => router.replace('/(tabs)')}
                    style={{ marginTop: Spacing.sm }}
                />

                <TouchableOpacity
                    onPress={() => router.replace('/(tabs)')}
                    style={styles.skipButton}
                >
                    <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Don’t have an account? </Text>
                <TouchableOpacity onPress={onToggle}>
                    <Text style={styles.footerLink}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        marginBottom: Spacing.xl,
    },
    form: {
        width: '100%',
    },
    forgot: {
        alignSelf: 'flex-end',
        marginBottom: Spacing.sm,
    },
    forgotText: {
        color: Colors.cyberCyan,
        fontSize: FontSizes.sm,
    },
    skipButton: {
        marginTop: Spacing.md,
        alignItems: 'center',
    },
    skipText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
        textDecorationLine: 'underline',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.lg,
    },
    footerText: {
        color: Colors.textSecondary,
        fontSize: FontSizes.sm,
    },
    footerLink: {
        color: Colors.cyberCyan,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
});
