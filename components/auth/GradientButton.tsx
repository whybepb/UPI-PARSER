import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    ViewStyle,
} from 'react-native';
import { Colors, FontSizes, Radii } from '../../constants/theme';

interface GradientButtonProps {
    title: string;
    onPress?: () => void;
    style?: ViewStyle;
    disabled?: boolean;
    leftIcon?: React.ReactNode;
}

export default function GradientButton({
    title,
    onPress,
    style,
    disabled = false,
    leftIcon,
}: GradientButtonProps) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            friction: 3,
            tension: 100,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={[styles.shadow, { transform: [{ scale }] }, style]}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
            >
                <LinearGradient
                    colors={[Colors.buttonGradientStart, Colors.buttonGradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.gradient, disabled && styles.gradientDisabled]}
                >
                    {leftIcon ? <>{leftIcon}</> : null}
                    <Text style={styles.text}>{title}</Text>
                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    shadow: {
        borderRadius: Radii.md,
        shadowColor: Colors.glowShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.55,
        shadowRadius: 16,
        elevation: 12,
    },
    gradient: {
        height: 54,
        borderRadius: Radii.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    gradientDisabled: {
        opacity: 0.6,
    },
    text: {
        color: '#000',
        fontSize: FontSizes.md,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
