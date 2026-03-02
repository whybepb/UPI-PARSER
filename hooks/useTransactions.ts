import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { checkSmsPermission, getUpiTransactions, requestSmsPermission } from '../services/smsReader';
import { addManualTransaction, loadBudget, loadTransactions, saveBudget, seedMerchantMappings, upsertTransactions } from '../services/data/transactionsRepo';
import { SpendSummary, UpiTransaction } from '../services/types';

const EMPTY_SUMMARY: SpendSummary = {
    totalSpent: 0,
    totalReceived: 0,
    transactionCount: 0,
    debitCount: 0,
    creditCount: 0,
    transactions: [],
};

const TransactionContext = createContext<any>(null);

function computeSummary(transactions: UpiTransaction[]): SpendSummary {
    const totalSpent = transactions.filter((t) => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    const totalReceived = transactions.filter((t) => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const debitCount = transactions.filter((t) => t.type === 'debit').length;
    const creditCount = transactions.filter((t) => t.type === 'credit').length;
    return { totalSpent, totalReceived, transactionCount: transactions.length, debitCount, creditCount, transactions };
}

export function TransactionProvider({ children }: { children: React.ReactNode }) {
    const [summary, setSummary] = useState<SpendSummary>(EMPTY_SUMMARY);
    const [budget, setBudget] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const isUnsupported = Platform.OS !== 'android';

    const refreshFromRepo = useCallback(async () => {
        const stored = await loadTransactions();
        setSummary(computeSummary(stored));
    }, []);

    const scanMessages = useCallback(async (maxMessages = 1000) => {
        if (isUnsupported) return;
        setIsLoading(true);
        try {
            const result = await getUpiTransactions(maxMessages);
            const merged = await upsertTransactions(result.transactions);
            setSummary(computeSummary(merged));
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

    const addManual = useCallback(async (input: any) => {
        const now = input.date ?? new Date();
        await addManualTransaction({
            type: input.type,
            amount: input.amount,
            merchant: input.merchant,
            category: input.category,
            confidence: 1,
            parseStatus: 'parsed',
            reviewReason: null,
            date: now,
            bank: 'Manual',
            upiRef: null,
            rawMessage: input.notes || 'Manual transaction',
            notes: input.notes || null,
        });
        await refreshFromRepo();
    }, [refreshFromRepo]);

    const setMonthlyBudget = useCallback(async (amount: number) => {
        const monthKey = new Date().toISOString().slice(0, 7);
        const next = { monthKey, amount };
        await saveBudget(next);
        setBudget(next);
    }, []);

    useEffect(() => {
        (async () => {
            await seedMerchantMappings();
            await refreshFromRepo();
            setBudget(await loadBudget());
            if (isUnsupported) return;
            const granted = await checkSmsPermission();
            setHasPermission(granted);
            if (granted) await scanMessages();
        })();
    }, [isUnsupported, refreshFromRepo, scanMessages]);

    const getFilteredTransactions = useCallback((filter: string) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        return summary.transactions.filter((txn) => {
            if (filter === 'debits') return txn.type === 'debit';
            if (filter === 'credits') return txn.type === 'credit';
            if (filter === 'this-week') return txn.date >= weekStart;
            return true;
        });
    }, [summary.transactions]);

    const getCategorySummary = useCallback(() => summary.transactions
        .filter((txn) => txn.type === 'debit')
        .reduce((acc: Record<string, number>, txn) => {
            acc[txn.category] = (acc[txn.category] ?? 0) + txn.amount;
            return acc;
        }, {}), [summary.transactions]);

    const value = useMemo(() => ({
        summary,
        budget,
        isLoading,
        isUnsupported,
        hasPermission,
        scanMessages,
        requestPermissionAndScan,
        getFilteredTransactions,
        getCategorySummary,
        addManual,
        setMonthlyBudget,
    }), [summary, budget, isLoading, isUnsupported, hasPermission, scanMessages, requestPermissionAndScan, getFilteredTransactions, getCategorySummary, addManual, setMonthlyBudget]);

    return React.createElement(TransactionContext.Provider, { value }, children);
}

export function useTransactions() {
    const context = useContext(TransactionContext);
    if (!context) throw new Error('useTransactions must be used within a TransactionProvider');
    return context;
}
