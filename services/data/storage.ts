import { Platform } from 'react-native';

const memoryStore = new Map<string, string>();

export async function setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return;
    }
    memoryStore.set(key, value);
}

export async function getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
    }
    return memoryStore.get(key) ?? null;
}

export async function removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        return;
    }
    memoryStore.delete(key);
}
