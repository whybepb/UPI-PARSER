import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TransactionProvider } from '../hooks/useTransactions';

export default function RootLayout() {
  return (
    <TransactionProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#101922' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </TransactionProvider>
  );
}
