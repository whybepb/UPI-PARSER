import { seedMerchantMap } from '../categoryEngine';
import { BudgetConfig, UpiTransaction } from '../types';
import { getItem, setItem } from './storage';

const TX_KEY = 'syncspend.transactions.v1';
const BUDGET_KEY = 'syncspend.budget.v1';
const MERCHANT_MAP_KEY = 'syncspend.merchant-map.v1';

export async function loadTransactions(): Promise<UpiTransaction[]> {
    const raw = await getItem(TX_KEY);
    if (!raw) return [];
    const parsed: UpiTransaction[] = JSON.parse(raw);
    return parsed.map((tx) => ({ ...tx, date: new Date(tx.date) }));
}

export async function saveTransactions(transactions: UpiTransaction[]) {
    await setItem(TX_KEY, JSON.stringify(transactions));
}

export async function upsertTransactions(items: UpiTransaction[]) {
    const current = await loadTransactions();
    const map = new Map(current.map((item) => [item.id, item]));
    items.forEach((item) => map.set(item.id, item));
    const merged = Array.from(map.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
    await saveTransactions(merged);
    return merged;
}

export async function addManualTransaction(item: Omit<UpiTransaction, 'id' | 'source'>) {
    const record: UpiTransaction = { ...item, id: `manual-${Date.now()}`, source: 'manual' };
    const merged = await upsertTransactions([record]);
    return { record, merged };
}

export async function saveBudget(budget: BudgetConfig) {
    await setItem(BUDGET_KEY, JSON.stringify(budget));
}

export async function loadBudget(): Promise<BudgetConfig | null> {
    const raw = await getItem(BUDGET_KEY);
    return raw ? JSON.parse(raw) : null;
}

export async function seedMerchantMappings() {
    const raw = await getItem(MERCHANT_MAP_KEY);
    if (!raw) {
        await setItem(MERCHANT_MAP_KEY, JSON.stringify(seedMerchantMap));
    }
}
