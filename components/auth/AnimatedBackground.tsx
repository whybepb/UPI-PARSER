import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function AnimatedBackground({ children }: { children: React.ReactNode }) {
    const orb1X = useRef(new Animated.Value(0)).current;
    const orb1Y = useRef(new Animated.Value(0)).current;
    const orb2X = useRef(new Animated.Value(0)).current;
    const orb2Y = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loopAnimation = (value: Animated.Value, toValue: number, duration: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(value, {
                        toValue,
                        duration,
                        useNativeDriver: true,
                    }),
                    Animated.timing(value, {
                        toValue: -toValue,
                        duration,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        Animated.parallel([
            loopAnimation(orb1X, 40, 6000),
            loopAnimation(orb1Y, 60, 8000),
            loopAnimation(orb2X, -50, 7000),
            loopAnimation(orb2Y, -40, 5000),
        ]).start();
    }, []);

    return (
        <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {/* Orb 1 — top-left blue */}
            <Animated.View
                style={[
                    styles.orb,
                    styles.orb1,
                    { transform: [{ translateX: orb1X }, { translateY: orb1Y }] },
                ]}
            />
            {/* Orb 2 — bottom-right pink */}
            <Animated.View
                style={[
                    styles.orb,
                    styles.orb2,
                    { transform: [{ translateX: orb2X }, { translateY: orb2Y }] },
                ]}
            />
            {children}
        </LinearGradient>
    );
}

const ORB_SIZE = width * 0.7;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    orb: {
        position: 'absolute',
        width: ORB_SIZE,
        height: ORB_SIZE,
        borderRadius: ORB_SIZE / 2,
    },
    orb1: {
        top: -ORB_SIZE * 0.3,
        left: -ORB_SIZE * 0.2,
        backgroundColor: Colors.orb1,
    },
    orb2: {
        bottom: -ORB_SIZE * 0.25,
        right: -ORB_SIZE * 0.15,
        backgroundColor: Colors.orb2,
    },
});
