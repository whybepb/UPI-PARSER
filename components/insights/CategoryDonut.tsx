import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { CATEGORY_MAP } from '../../constants/categoryTheme';
import { Colors, Spacing } from '../../constants/theme';

export default function CategoryDonut({ data, total }: { data: { category: string; amount: number }[]; total: number }) {
    const radius = 70;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.title}>Total Spending</Text>
                    <Text style={styles.total}>₹{total.toLocaleString('en-IN')}</Text>
                </View>
            </View>
            <View style={styles.row}>
                <View>
                    <Svg width={180} height={180}>
                        <Circle cx={90} cy={90} r={radius} stroke="#223041" strokeWidth={strokeWidth} fill="none" />
                        {data.map((item) => {
                            const pct = total > 0 ? item.amount / total : 0;
                            const dash = pct * circumference;
                            const circle = (
                                <Circle
                                    key={item.category}
                                    cx={90}
                                    cy={90}
                                    r={radius}
                                    stroke={CATEGORY_MAP[item.category]?.color ?? CATEGORY_MAP.unknown.color}
                                    strokeWidth={strokeWidth}
                                    fill="none"
                                    strokeDasharray={`${dash} ${circumference}`}
                                    strokeDashoffset={-offset}
                                    strokeLinecap="butt"
                                    rotation={-90}
                                    origin="90, 90"
                                />
                            );
                            offset += dash;
                            return circle;
                        })}
                    </Svg>
                    <View style={styles.centerLabel}><Text style={styles.centerText}>{new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase()}</Text></View>
                </View>
                <View style={styles.legend}>
                    {data.map((item) => (
                        <View key={item.category} style={styles.legendRow}>
                            <View style={[styles.dot, { backgroundColor: CATEGORY_MAP[item.category]?.color ?? CATEGORY_MAP.unknown.color }]} />
                            <Text style={styles.legendText}>{CATEGORY_MAP[item.category]?.label ?? 'Uncategorized'}</Text>
                            <Text style={styles.legendAmount}>₹{item.amount.toFixed(0)}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: Colors.surfaceDark, borderRadius: 24, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
    headerRow: { marginBottom: Spacing.md },
    title: { color: Colors.textSecondary, fontSize: 36 / 2 },
    total: { color: Colors.textPrimary, fontSize: 52 / 2, fontWeight: '800', marginTop: 4 },
    row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
    centerLabel: { position: 'absolute', left: 70, top: 78 },
    centerText: { color: '#94a3b8', fontWeight: '700' },
    legend: { flex: 1, gap: Spacing.sm },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { flex: 1, color: Colors.textSecondary },
    legendAmount: { color: Colors.textPrimary, fontWeight: '700' },
});
