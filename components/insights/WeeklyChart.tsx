import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Colors, Spacing } from '../../constants/theme';

export default function WeeklyChart({ data }: { data: number[] }) {
    const max = Math.max(...data, 1);
    const highestIndex = data.indexOf(max);
    return (
        <View style={styles.card}>
            <Text style={styles.title}>Weekly Comparison</Text>
            <Svg width="100%" height="180" viewBox="0 0 320 180">
                {data.map((value, i) => {
                    const h = (value / max) * 120;
                    return <Rect key={i} x={30 + i * 70} y={140 - h} width={40} height={h} rx={8} fill={i === highestIndex ? Colors.primary : '#27405d'} />;
                })}
            </Svg>
            <View style={styles.labels}>{['W1', 'W2', 'W3', 'W4'].map((w) => <Text key={w} style={styles.label}>{w}</Text>)}</View>
            <View style={styles.footer}><Text style={styles.muted}>Highest Week</Text><Text style={styles.best}>Week {highestIndex + 1} (₹{max.toFixed(0)})</Text></View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: Colors.surfaceDark, borderRadius: 24, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
    title: { color: Colors.textPrimary, fontSize: 38 / 2, fontWeight: '700', marginBottom: Spacing.sm },
    labels: { flexDirection: 'row', justifyContent: 'space-around', marginTop: -8, marginBottom: Spacing.md },
    label: { color: Colors.textSecondary, fontWeight: '600' },
    footer: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md, flexDirection: 'row', justifyContent: 'space-between' },
    muted: { color: Colors.textSecondary },
    best: { color: Colors.primary, fontWeight: '700' },
});
