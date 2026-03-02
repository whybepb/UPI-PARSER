import { UpiTransaction } from './types';

const API = 'http://localhost:4000/api';

function encode(plain: string): string {
    if (typeof btoa === 'function') return btoa(plain);
    return plain;
}

function decode(payload: string): string {
    if (typeof atob === 'function') return atob(payload);
    return payload;
}

export async function pushSync(userId: string, transactions: UpiTransaction[], cursor: string) {
    const payload = encode(JSON.stringify(transactions));
    const response = await fetch(`${API}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, payload, cursor }),
    });
    return response.json();
}

export async function restoreSync(userId: string): Promise<UpiTransaction[] | null> {
    const response = await fetch(`${API}/restore?userId=${encodeURIComponent(userId)}`);
    const data = await response.json();
    if (!data.snapshot?.payload) return null;
    const decoded = JSON.parse(decode(data.snapshot.payload));
    return decoded.map((txn: UpiTransaction) => ({ ...txn, date: new Date(txn.date) }));
}
