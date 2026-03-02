import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Radii } from '../../constants/theme';

export type TimeRange = 'day' | 'week' | 'month';

export default function TimeToggle({ value, onChange }: { value: TimeRange; onChange: (value: TimeRange) => void }) {
    const options: TimeRange[] = ['day', 'week', 'month'];

    return (
        <View style={styles.wrap}>
            {options.map((option) => {
                const active = option === value;
                return (
                    <TouchableOpacity key={option} style={[styles.btn, active && styles.active]} onPress={() => onChange(option)}>
                        <Text style={[styles.text, active && styles.activeText]}>{option[0].toUpperCase() + option.slice(1)}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { flexDirection: 'row', backgroundColor: '#2b3442', borderRadius: Radii.full, padding: 4 },
    btn: { flex: 1, paddingVertical: 10, borderRadius: Radii.full, alignItems: 'center' },
    active: { backgroundColor: '#fff' },
    text: { color: '#9fb2ca', fontWeight: '600' },
    activeText: { color: '#111827' },
});
