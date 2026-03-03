import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { categorizeTransaction } from '../services/categoryEngine';
import * as db from '../services/database';
import { checkSmsPermission, getUpiTransactions, requestSmsPermission } from '../services/smsReader';
import { BudgetConfig, SpendSummary, UpiTransaction } from '../services/types';

type TransactionFilter = 'all' | 'debits' | 'credits' | 'this-week';

type TransactionContextType = {
    summary: SpendSummary;
    isLoading: boolean;
    isUnsupported: boolean;
    hasPermission: boolean;
    budget: BudgetConfig | null;
    scanMessages: (maxMessages?: number) => Promise<void>;
    requestPermissionAndScan: () => Promise<void>;
    getFilteredTransactions: (filter: TransactionFilter) => UpiTransaction[];
    getCategorySummary: () => Record<string, number>;
    addManual: (entry: { type: 'debit' | 'credit'; amount: number; merchant: string; category: string }) => Promise<void>;
    setMonthlyBudget: (amount: number) => void;
    updateCategory: (txnId: string, newCategory: string) => void;
};

const EMPTY_SUMMARY: SpendSummary = {
    totalSpent: 0, totalReceived: 0, transactionCount: 0, debitCount: 0, creditCount: 0, transactions: [],
};

function buildSummary(transactions: UpiTransaction[]): SpendSummary {
    const totalSpent = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    const totalReceived = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    return {
        totalSpent, totalReceived,
        transactionCount: transactions.length,
        debitCount: transactions.filter((t) => t.type === 'debit').length,
        creditCount: transactions.filter((t) => t.type === 'credit').length,
        transactions,
    };
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
    const [summary, setSummary] = useState<SpendSummary>(EMPTY_SUMMARY);
    const [isLoading, setIsLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [budget, setBudget] = useState<BudgetConfig | null>(null);
    const isUnsupported = Platform.OS !== 'android';

    // Load persisted data on mount
    useEffect(() => {
        (async () => {
            try {
                const [savedTxns, savedBudget] = await Promise.all([
                    db.loadTransactions(),
                    db.loadBudget(),
                ]);
                if (savedTxns.length > 0) {
                    setSummary(buildSummary(savedTxns));
                }
                if (savedBudget) setBudget(savedBudget);
            } catch (e) {
                console.warn('DB load error:', e);
            }
        })();
    }, []);

    const scanMessages = useCallback(async (maxMessages: number = 1000) => {
        if (isUnsupported) return;
        setIsLoading(true);
        try {
            const result = await getUpiTransactions(maxMessages);
            // Merge: keep manual transactions, replace SMS ones
            setSummary((prev) => {
                const manualTxns = prev.transactions.filter((t) => t.source === 'manual');
                const allTxns = [...result.transactions, ...manualTxns]
                    .sort((a, b) => b.date.getTime() - a.date.getTime());
                return buildSummary(allTxns);
            });
            // Persist new SMS transactions to SQLite
            await db.saveTransactions(result.transactions);
        } finally {
            setIsLoading(false);
        }
    }, [isUnsupported]);

    const requestPermissionAndScan = useCallback(async () => {
        if (isUnsupported) return;
        const granted = await requestSmsPermission();
        setHasPermission(granted);
        if (granted) await scanMessages();
    }, [isUnsupported, scanMessages]);

    // Auto-scan on mount
    useEffect(() => {
        (async () => {
            if (isUnsupported) return;
            const granted = await checkSmsPermission();
            setHasPermission(granted);
            if (granted) await scanMessages();
        })();
    }, [isUnsupported, scanMessages]);

    const getFilteredTransactions = useCallback((filter: TransactionFilter) => {
        const now = new Date();
        const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
        return summary.transactions.filter((txn) => {
            if (filter === 'debits') return txn.type === 'debit';
            if (filter === 'credits') return txn.type === 'credit';
            if (filter === 'this-week') return txn.date >= weekStart;
            return true;
        });
    }, [summary.transactions]);

    const getCategorySummary = useCallback(() => {
        return summary.transactions
            .filter((txn) => txn.type === 'debit')
            .reduce<Record<string, number>>((acc, txn) => {
                acc[txn.category] = (acc[txn.category] ?? 0) + txn.amount;
                return acc;
            }, {});
    }, [summary.transactions]);

    const addManual = useCallback(async (entry: { type: 'debit' | 'credit'; amount: number; merchant: string; category: string }) => {
        const newTxn: UpiTransaction = {
            id: `manual-${Date.now()}`,
            source: 'manual',
            type: entry.type,
            amount: entry.amount,
            merchant: entry.merchant,
            category: entry.category || categorizeTransaction(entry.merchant, entry.type),
            confidence: 1.0,
            parseStatus: 'parsed',
            reviewReason: null,
            date: new Date(),
            bank: 'Manual',
            upiRef: null,
            rawMessage: `Manual: ${entry.type} ₹${entry.amount} to ${entry.merchant}`,
            notes: null,
        };
        // Persist to SQLite
        await db.saveTransaction(newTxn);
        setSummary((prev) => buildSummary([newTxn, ...prev.transactions]));
    }, []);

    const setMonthlyBudget = useCallback(async (amount: number) => {
        const now = new Date();
        const config: BudgetConfig = {
            monthKey: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
            amount,
        };
        setBudget(config);
        // Persist to SQLite
        await db.saveBudget(config);
    }, []);

    const updateCategory = useCallback(async (txnId: string, newCategory: string) => {
        // Find the merchant for this txn and learn the correction
        const txn = summary.transactions.find((t) => t.id === txnId);
        if (txn) {
            await db.saveMerchantCorrection(txn.merchant, newCategory);
        }
        // Persist category update to SQLite
        await db.updateTransactionCategory(txnId, newCategory);
        setSummary((prev) => ({
            ...prev,
            transactions: prev.transactions.map((t) =>
                t.id === txnId ? { ...t, category: newCategory, parseStatus: 'parsed' as const, reviewReason: null } : t
            ),
        }));
    }, [summary.transactions]);

    const value = useMemo(() => ({
        summary, isLoading, isUnsupported, hasPermission, budget,
        scanMessages, requestPermissionAndScan, getFilteredTransactions,
        getCategorySummary, addManual, setMonthlyBudget, updateCategory,
    }), [summary, isLoading, isUnsupported, hasPermission, budget,
        scanMessages, requestPermissionAndScan, getFilteredTransactions,
        getCategorySummary, addManual, setMonthlyBudget, updateCategory]);

    return React.createElement(TransactionContext.Provider, { value }, children);
}

export function useTransactions() {
    const ctx = useContext(TransactionContext);
    if (!ctx) throw new Error('useTransactions must be used within TransactionProvider');
    return ctx;
}
