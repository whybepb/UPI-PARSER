import { signOut as firebaseSignOut, GoogleAuthProvider, signInWithCredential } from '@firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { auth, hasFirebaseConfig } from '../services/auth/firebase';

WebBrowser.maybeCompleteAuthSession();

const AUTH_USER_KEY = 'syncspend.auth.user.v1';

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

    const androidClientId = process.env.EXPO_PUBLIC_FIREBASE_ANDROID_CLIENT_ID;
    const iosClientId = process.env.EXPO_PUBLIC_FIREBASE_IOS_CLIENT_ID;
    const webClientId = process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID;

    const nativeAppId = Constants.expoConfig?.android?.package ?? 'com.anonymous.syncspend';

    const [request, , promptAsync] = Google.useIdTokenAuthRequest({
        androidClientId,
        iosClientId,
        webClientId,
        clientId: webClientId ?? androidClientId ?? iosClientId,
        selectAccount: true,
    }, {
        native: `${nativeAppId}:/oauthredirect`,
    });

    // DEBUG: Log the redirect URI being sent to Google
    useEffect(() => {
        if (request) {
            console.log('🔑 [AUTH DEBUG] redirectUri:', request.redirectUri);
            console.log('🔑 [AUTH DEBUG] codeVerifier:', request.codeVerifier);
            console.log('🔑 [AUTH DEBUG] clientId:', request.clientId);
        }
    }, [request]);

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
        if (!request) {
            throw new Error('Google sign-in is not ready yet.');
        }

        const result = await promptAsync();
        if (result.type !== 'success') {
            if (result.type === 'cancel' || result.type === 'dismiss') return;
            if (result.type === 'error' && result.params?.error === 'invalid_request') {
                const oauthDescription = result.params?.error_description ?? 'No additional details from Google.';
                throw new Error(`Google OAuth invalid_request. ${oauthDescription} Verify Android client id, package name, SHA-1, and rebuild the app after updating Firebase config.`);
            }
            throw new Error('Google sign-in did not complete.');
        }

        const idToken = result.params?.id_token;
        if (!idToken) {
            throw new Error('Google sign-in did not return an id token.');
        }

        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        const normalized = toAuthUser(userCredential.user);
        setUser(normalized);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalized));
    }, [promptAsync, request]);

    const signOut = useCallback(async () => {
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
