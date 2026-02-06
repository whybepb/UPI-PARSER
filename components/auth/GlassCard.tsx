import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radii } from '../../constants/theme';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export default function GlassCard({ children, style }: GlassCardProps) {
    return (
        <View style={[styles.wrapper, style]}>
            <BlurView intensity={60} tint="dark" style={styles.blur}>
                <View style={styles.inner}>{children}</View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: Radii.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    blur: {
        overflow: 'hidden',
    },
    inner: {
        backgroundColor: Colors.glassWhite,
        padding: 28,
    },
});
