import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';

export type FilterOption = 'all' | 'debits' | 'credits' | 'this-week';

const OPTIONS: { key: FilterOption; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'debits', label: 'Debits' },
    { key: 'credits', label: 'Credits' },
    { key: 'this-week', label: 'This Week' },
];

export default function FilterChips({ value, onChange }: { value: FilterOption; onChange: (value: FilterOption) => void }) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {OPTIONS.map((option) => {
                const active = value === option.key;
                return (
                    <TouchableOpacity key={option.key} style={[styles.chip, active && styles.active]} onPress={() => onChange(option.key)}>
                        <Text style={[styles.text, active && styles.activeText]}>{option.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    row: { gap: Spacing.sm, paddingVertical: Spacing.sm },
    chip: { paddingHorizontal: Spacing.lg, paddingVertical: 14, borderRadius: 28, backgroundColor: '#1d2a45' },
    active: { backgroundColor: Colors.primary },
    text: { color: '#c2cede', fontSize: 18 / 2 * 2 },
    activeText: { color: 'white', fontWeight: '700' },
});
