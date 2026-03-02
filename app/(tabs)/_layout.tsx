import { Tabs } from 'expo-router';
import { ChartColumn, Home, MessageSquare, Settings } from 'lucide-react-native';
import React from 'react';
import { Colors } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: Colors.backgroundDark, borderTopColor: Colors.border, height: 68 },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', paddingBottom: 8 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'HOME', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="insights" options={{ title: 'INSIGHTS', tabBarIcon: ({ color, size }) => <ChartColumn color={color} size={size} /> }} />
      <Tabs.Screen name="sms-feed" options={{ title: 'SMS FEED', tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'SETTINGS', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
    </Tabs>
  );
}
