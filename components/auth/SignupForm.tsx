import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSizes, Spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import GradientButton from './GradientButton';

interface SignupFormProps {
    onToggle: () => void;
}

export default function SignupForm({ onToggle }: SignupFormProps) {
    const { signInWithGoogle } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onGoogleSignIn = async () => {
        try {
            setError(null);
            setIsSubmitting(true);
            await signInWithGoogle();
        } catch (e: any) {
            setError(e?.message ?? 'Unable to create account with Google.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Use your Google account to start using SyncSpend</Text>

            <GradientButton
                title={isSubmitting ? 'Creating Account...' : 'Continue with Google'}
                onPress={onGoogleSignIn}
                disabled={isSubmitting}
                style={{ marginTop: Spacing.sm }}
                leftIcon={<MaterialIcons name="account-circle" size={18} color="#000" />}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={onToggle} disabled={isSubmitting}>
                    <Text style={styles.footerLink}>Sign In</Text>
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
        marginBottom: Spacing.lg,
    },
    errorText: {
        color: '#f87171',
        fontSize: FontSizes.sm,
        marginTop: Spacing.md,
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
