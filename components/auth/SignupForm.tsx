import { Lock, Mail, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSizes, Spacing } from '../../constants/theme';
import GlassInput from './GlassInput';
import GradientButton from './GradientButton';

interface SignupFormProps {
    onToggle: () => void;
}

export default function SignupForm({ onToggle }: SignupFormProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            <View style={styles.form}>
                <GlassInput
                    placeholder="Full Name"
                    autoCapitalize="words"
                    icon={<User size={18} color={Colors.textSecondary} />}
                />
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
                <GlassInput
                    placeholder="Confirm Password"
                    secureTextEntry
                    icon={<Lock size={18} color={Colors.textSecondary} />}
                />

                <GradientButton title="Sign Up" style={{ marginTop: Spacing.sm }} />
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={onToggle}>
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
        marginBottom: Spacing.xl,
    },
    form: {
        width: '100%',
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
