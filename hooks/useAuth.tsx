import { signOut as firebaseSignOut, GoogleAuthProvider, signInWithCredential } from '@firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { InteractionManager } from 'react-native';
import { auth, hasFirebaseConfig } from '../services/auth/firebase';

const AUTH_USER_KEY = 'syncspend.auth.user.v1';

// Configure Google Sign-In with the Web client ID (required for Firebase auth)
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
});

export type AuthUser = {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string | null;
};

type AuthContextType = {
    user: AuthUser | null;
    isAuthLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function toAuthUser(user: { uid: string; displayName: string | null; email: string | null; photoURL: string | null }): AuthUser {
    return {
        uid: user.uid,
        displayName: user.displayName ?? 'SyncSpend User',
        email: user.email ?? 'user@syncspend.app',
        photoURL: user.photoURL ?? null,
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                if (auth.currentUser) {
                    const normalized = toAuthUser(auth.currentUser);
                    setUser(normalized);
                    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalized));
                    return;
                }

                const stored = await AsyncStorage.getItem(AUTH_USER_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored) as AuthUser;
                    setUser(parsed);
                }
            } finally {
                setIsAuthLoading(false);
            }
        })();
    }, []);

    const signInWithGoogle = useCallback(async () => {
        if (!hasFirebaseConfig()) {
            throw new Error('Firebase config is missing. Add EXPO_PUBLIC_FIREBASE_* env vars.');
        }

        try {
            // Use native Google Sign-In (uses Google Play Services, no browser redirect needed)
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            console.log('🔑 [AUTH] Starting Google Sign-In...');
            const signInResult = await GoogleSignin.signIn();
            console.log('🔑 [AUTH] Sign-in result type:', signInResult?.type);

            // Handle different result types
            if (signInResult?.type === 'cancelled') {
                console.log('🔑 [AUTH] User cancelled sign-in');
                return;
            }

            const idToken = signInResult?.data?.idToken;
            if (!idToken) {
                console.error('🔑 [AUTH] No idToken in result:', JSON.stringify(signInResult));
                throw new Error('Google sign-in did not return an id token.');
            }

            console.log('🔑 [AUTH] Got idToken, signing in to Firebase...');

            // Delay state update until native Google Sign-In dialog fully closes.
            // This prevents the Fabric renderer crash (IllegalStateException: addViewAt).
            await new Promise<void>((resolve, reject) => {
                InteractionManager.runAfterInteractions(async () => {
                    try {
                        const credential = GoogleAuthProvider.credential(idToken);
                        const userCredential = await signInWithCredential(auth, credential);
                        const normalized = toAuthUser(userCredential.user);
                        setUser(normalized);
                        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalized));
                        console.log('🔑 [AUTH] Successfully signed in as:', normalized.email);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                });
            });
        } catch (error: any) {
            console.error('🔑 [AUTH] Sign-in error:', error?.message ?? error);
            console.error('🔑 [AUTH] Error code:', error?.code);
            // Re-throw so the UI can show the error, but not for cancellations
            if (error?.code !== 'SIGN_IN_CANCELLED' && error?.code !== 'E_SIGN_IN_CANCELLED') {
                throw error;
            }
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            await GoogleSignin.signOut();
        } catch { /* ignore if not signed in via google */ }
        await firebaseSignOut(auth);
        await AsyncStorage.removeItem(AUTH_USER_KEY);
        setUser(null);
    }, []);

    const value = useMemo<AuthContextType>(() => ({
        user,
        isAuthLoading,
        signInWithGoogle,
        signOut,
    }), [user, isAuthLoading, signInWithGoogle, signOut]);

    return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
