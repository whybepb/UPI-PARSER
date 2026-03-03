import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

/* Minimal single-letter/symbol icons — no emojis, matches the SyncSpend OLED style */
function TabIcon({ label, active }: { label: string; active?: boolean }) {
  return (
    <View style={[s.iconWrap, active && s.iconWrapActive]}>
      <Text style={[s.iconText, active && s.iconTextActive]}>{label}</Text>
    </View>
  );
}

function PlusIcon() {
  return (
    <View style={s.plusOuter}>
      <View style={s.plusBtn}>
        <Text style={s.plusText}>+</Text>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: s.bar,
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#525252',
        tabBarItemStyle: { paddingTop: 6 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="⌂" active={focused} /> }}
      />
      <Tabs.Screen
        name="insights"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="◎" active={focused} /> }}
      />
      <Tabs.Screen
        name="quick-add"
        options={{
          tabBarIcon: () => <PlusIcon />,
          tabBarItemStyle: { paddingTop: 0 },
        }}
      />
      <Tabs.Screen
        name="sms-feed"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="✉" active={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="●" active={focused} /> }}
      />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 24 : 12,
    borderRadius: 999,
    height: 64,
    backgroundColor: '#171717',
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: '#262626',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    paddingBottom: 0,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconText: { fontSize: 20, color: '#525252' },
  iconTextActive: { color: '#fff' },
  plusOuter: { marginTop: -16 },
  plusBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  plusText: { fontSize: 26, color: '#000', fontWeight: '300', marginTop: -2 },
});
