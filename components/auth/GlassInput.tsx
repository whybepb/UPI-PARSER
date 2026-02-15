import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Colors, FontSizes, Radii, Spacing } from '../../constants/theme';

interface GlassInputProps extends TextInputProps {
    icon?: React.ReactNode;
}

export default function GlassInput({ icon, style, ...props }: GlassInputProps) {
    const [focused, setFocused] = useState(false);

    return (
        <View
            style={[
                styles.container,
                focused && styles.containerFocused,
                style as any,
            ]}
        >
            {icon && <View style={styles.iconWrapper}>{icon}</View>}
            <TextInput
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                {...props}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputFill,
        borderRadius: Radii.md,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        paddingHorizontal: Spacing.md,
        height: 54,
        marginBottom: Spacing.md,
    },
    containerFocused: {
        borderColor: Colors.glassBorderFocus,
        backgroundColor: 'rgba(79, 143, 255, 0.06)',
    },
    iconWrapper: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: FontSizes.md,
        height: '100%',
    },
});
