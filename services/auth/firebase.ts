import { getApp, getApps, initializeApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Auth, getAuth, initializeAuth } from '@firebase/auth';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'missing-api-key',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'missing-auth-domain',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'missing-project-id',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'missing-storage-bucket',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? 'missing-messaging-sender-id',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? 'missing-app-id',
};

const envConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missingConfig = Object.entries(envConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

if (missingConfig.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(`[Auth] Missing Firebase config values: ${missingConfig.join(', ')}`);
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const resolveReactNativePersistenceFactory = () => {
    const fromDefaultEntry = (() => {
        try {
            const rnAuth = require('@firebase/auth') as {
                getReactNativePersistence?: (storage: unknown) => unknown;
            };
            return rnAuth.getReactNativePersistence;
        } catch {
            return undefined;
        }
    })();

    if (fromDefaultEntry) return fromDefaultEntry;

    try {
        // Fallback to RN-specific bundle when default export map does not expose it.
        const rnAuth = require('@firebase/auth/dist/rn/index.js') as {
            getReactNativePersistence?: (storage: unknown) => unknown;
        };
        return rnAuth.getReactNativePersistence;
    } catch {
        return undefined;
    }
};

const getReactNativePersistenceFactory = resolveReactNativePersistenceFactory();
const reactNativePersistence = getReactNativePersistenceFactory?.(AsyncStorage);

if (!reactNativePersistence) {
    // eslint-disable-next-line no-console
    console.warn('[Auth] React Native persistence bridge unavailable; Firebase auth may not persist session.');
}

let authInstance: Auth;
if (reactNativePersistence) {
    try {
        authInstance = initializeAuth(app, { persistence: reactNativePersistence as never });
    } catch {
        // Already initialized during fast refresh / hot reload.
        authInstance = getAuth(app);
    }
} else {
    authInstance = getAuth(app);
}

export const auth: Auth = authInstance;

export function hasFirebaseConfig(): boolean {
    return missingConfig.length === 0;
}
