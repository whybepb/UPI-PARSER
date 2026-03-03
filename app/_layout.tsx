import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { TransactionProvider } from '../hooks/useTransactions';

function RouterGate() {
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isAuthLoading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    if (user && !inTabsGroup) {
      router.replace('/(tabs)');
      return;
    }
    if (!user && inTabsGroup) {
      router.replace('/');
    }
  }, [isAuthLoading, router, segments, user]);

  if (isAuthLoading) {
    return (
      <View style={s.loaderWrap}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <TransactionProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </TransactionProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouterGate />
    </AuthProvider>
  );
}

const s = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
