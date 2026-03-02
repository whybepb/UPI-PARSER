import { Tabs } from 'expo-router';
import { BarChart3, CircleUserRound, House, MessageSquareMore, Plus } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/theme';

function PlusButton() {
  return (
    <View style={styles.plusWrap}>
      <View style={styles.plusBtn}><Plus size={28} color="#000" /></View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.bar,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textMuted,
    }}>
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }} />
      <Tabs.Screen name="insights" options={{ tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} /> }} />
      <Tabs.Screen name="quick-add" options={{ tabBarIcon: () => <PlusButton /> }} />
      <Tabs.Screen name="sms-feed" options={{ tabBarIcon: ({ color, size }) => <MessageSquareMore color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ color, size }) => <CircleUserRound color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute', left: 18, right: 18, bottom: Platform.OS === 'ios' ? 20 : 14,
    borderRadius: 32, height: 72, backgroundColor: '#16161a', borderTopColor: '#2a2a2f', borderTopWidth: 1,
  },
  plusWrap: { marginTop: -24 },
  plusBtn: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', borderWidth: 8, borderColor: '#000' },
});
