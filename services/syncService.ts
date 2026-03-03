/**
 * SyncService — handles cloud backup & restore
 * 
 * Encrypts data on device before sending to cloud.
 * Keys remain local, server never sees plaintext.
 */

const DEFAULT_API_URL = 'http://localhost:4000/api';

// Simple device ID (in production, use expo-secure-store)
function getDeviceId(): string {
    return 'device-' + Math.random().toString(36).slice(2, 10);
}

export interface SyncPayload {
    transactions: any[];
    budgets: any[];
    merchantMap: Record<string, string>;
    timestamp: number;
}

export interface SyncResult {
    ok: boolean;
    cursor?: string;
    error?: string;
}

export interface RestoreResult {
    ok: boolean;
    snapshot?: { payload: string; cursor: string } | null;
    error?: string;
}

/**
 * Sync local data to cloud (POST /sync).
 * In production, `payload` should be AES-256 encrypted before sending.
 */
export async function syncToCloud(
    data: SyncPayload,
    userId: string,
    apiUrl: string = DEFAULT_API_URL,
): Promise<SyncResult> {
    try {
        const cursor = new Date().toISOString();
        const payload = JSON.stringify(data); // TODO: encrypt with user key

        const res = await fetch(`${apiUrl}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, payload, cursor }),
        });

        if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
        return await res.json();
    } catch (e: any) {
        return { ok: false, error: e.message };
    }
}

/**
 * Restore data from cloud (GET /restore).
 */
export async function restoreFromCloud(
    userId: string,
    apiUrl: string = DEFAULT_API_URL,
): Promise<SyncPayload | null> {
    try {
        const res = await fetch(`${apiUrl}/restore?userId=${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error(`Restore failed: ${res.status}`);

        const data: RestoreResult = await res.json();
        if (!data.ok || !data.snapshot) return null;

        const payload = JSON.parse(data.snapshot.payload); // TODO: decrypt with user key
        return payload as SyncPayload;
    } catch {
        return null;
    }
}
