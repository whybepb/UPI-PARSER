import * as SQLite from 'expo-sqlite';
import { BudgetConfig, UpiTransaction } from './types';

let _db: SQLite.SQLiteDatabase | null = null;
let _ready = false;

async function getDb(): Promise<SQLite.SQLiteDatabase | null> {
    if (_ready && _db) return _db;
    try {
        const db = await SQLite.openDatabaseAsync('syncspend.db');
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                source TEXT NOT NULL DEFAULT 'sms',
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                merchant TEXT NOT NULL,
                category TEXT NOT NULL DEFAULT 'uncategorized',
                confidence REAL NOT NULL DEFAULT 0,
                parse_status TEXT NOT NULL DEFAULT 'parsed',
                review_reason TEXT,
                date INTEGER NOT NULL,
                bank TEXT NOT NULL DEFAULT '',
                upi_ref TEXT,
                raw_message TEXT NOT NULL DEFAULT '',
                notes TEXT
            );
            CREATE TABLE IF NOT EXISTS budgets (
                month_key TEXT PRIMARY KEY,
                amount REAL NOT NULL
            );
            CREATE TABLE IF NOT EXISTS merchant_map (
                merchant TEXT PRIMARY KEY,
                category TEXT NOT NULL
            );
        `);
        _db = db;
        _ready = true;
        return _db;
    } catch {
        console.warn('[SyncSpend] SQLite unavailable — run `npx expo run:android` to compile native modules');
        return null;
    }
}

// ---- Transactions ----

export async function saveTransaction(txn: UpiTransaction): Promise<void> {
    try {
        const db = await getDb();
        if (!db) return;
        await db.runAsync(
            `INSERT OR REPLACE INTO transactions (id, source, type, amount, merchant, category, confidence, parse_status, review_reason, date, bank, upi_ref, raw_message, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            txn.id, txn.source, txn.type, txn.amount, txn.merchant, txn.category,
            txn.confidence, txn.parseStatus, txn.reviewReason ?? null,
            txn.date.getTime(), txn.bank, txn.upiRef ?? null, txn.rawMessage, txn.notes ?? null,
        );
    } catch { /* graceful fallback */ }
}

export async function saveTransactions(txns: UpiTransaction[]): Promise<void> {
    try {
        const db = await getDb();
        if (!db) return;
        await db.withTransactionAsync(async () => {
            for (const txn of txns) {
                await db.runAsync(
                    `INSERT OR REPLACE INTO transactions (id, source, type, amount, merchant, category, confidence, parse_status, review_reason, date, bank, upi_ref, raw_message, notes)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    txn.id, txn.source, txn.type, txn.amount, txn.merchant, txn.category,
                    txn.confidence, txn.parseStatus, txn.reviewReason ?? null,
                    txn.date.getTime(), txn.bank, txn.upiRef ?? null, txn.rawMessage, txn.notes ?? null,
                );
            }
        });
    } catch { /* graceful fallback */ }
}

export async function loadTransactions(): Promise<UpiTransaction[]> {
    try {
        const db = await getDb();
        if (!db) return [];
        const rows = await db.getAllAsync<{
            id: string; source: string; type: string; amount: number; merchant: string;
            category: string; confidence: number; parse_status: string; review_reason: string | null;
            date: number; bank: string; upi_ref: string | null; raw_message: string; notes: string | null;
        }>('SELECT * FROM transactions ORDER BY date DESC');

        return rows.map((r) => ({
            id: r.id,
            source: r.source as 'sms' | 'manual',
            type: r.type as 'debit' | 'credit',
            amount: r.amount,
            merchant: r.merchant,
            category: r.category,
            confidence: r.confidence,
            parseStatus: r.parse_status as 'parsed' | 'review_needed' | 'failed',
            reviewReason: r.review_reason,
            date: new Date(r.date),
            bank: r.bank,
            upiRef: r.upi_ref,
            rawMessage: r.raw_message,
            notes: r.notes,
        }));
    } catch { return []; }
}

export async function updateTransactionCategory(txnId: string, category: string): Promise<void> {
    try {
        const db = await getDb();
        if (!db) return;
        await db.runAsync(
            'UPDATE transactions SET category = ?, parse_status = ? WHERE id = ?',
            category, 'parsed', txnId,
        );
    } catch { /* graceful fallback */ }
}

export async function deleteAllTransactions(): Promise<void> {
    try {
        const db = await getDb();
        if (!db) return;
        await db.runAsync('DELETE FROM transactions');
    } catch { /* graceful fallback */ }
}

// ---- Budgets ----

export async function saveBudget(budget: BudgetConfig): Promise<void> {
    try {
        const db = await getDb();
        if (!db) return;
        await db.runAsync(
            'INSERT OR REPLACE INTO budgets (month_key, amount) VALUES (?, ?)',
            budget.monthKey, budget.amount,
        );
    } catch { /* graceful fallback */ }
}

export async function loadBudget(): Promise<BudgetConfig | null> {
    try {
        const db = await getDb();
        if (!db) return null;
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const row = await db.getFirstAsync<{ month_key: string; amount: number }>(
            'SELECT * FROM budgets WHERE month_key = ?', monthKey,
        );
        return row ? { monthKey: row.month_key, amount: row.amount } : null;
    } catch { return null; }
}

// ---- Merchant Map ----

export async function saveMerchantCorrection(merchant: string, category: string): Promise<void> {
    try {
        const db = await getDb();
        if (!db) return;
        await db.runAsync(
            'INSERT OR REPLACE INTO merchant_map (merchant, category) VALUES (?, ?)',
            merchant.toLowerCase(), category,
        );
    } catch { /* graceful fallback */ }
}

export async function loadMerchantCorrections(): Promise<Record<string, string>> {
    try {
        const db = await getDb();
        if (!db) return {};
        const rows = await db.getAllAsync<{ merchant: string; category: string }>(
            'SELECT * FROM merchant_map',
        );
        const map: Record<string, string> = {};
        for (const r of rows) map[r.merchant] = r.category;
        return map;
    } catch { return {}; }
}
