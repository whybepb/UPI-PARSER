import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { checkSmsPermission, getUpiTransactions, requestSmsPermission } from '../services/smsReader';
import { SpendSummary, UpiTransaction } from '../services/types';

type TransactionFilter = 'all' | 'debits' | 'credits' | 'this-week';

type TransactionContextType = {
    summary: SpendSummary;
    isLoading: boolean;
    isUnsupported: boolean;
    hasPermission: boolean;
    scanMessages: (maxMessages?: number) => Promise<void>;
    requestPermissionAndScan: () => Promise<void>;
    getFilteredTransactions: (filter: TransactionFilter) => UpiTransaction[];
    getCategorySummary: () => Record<string, number>;
};

const EMPTY_SUMMARY: SpendSummary = {
    totalSpent: 0,
    totalReceived: 0,
    transactionCount: 0,
    debitCount: 0,
    creditCount: 0,
    transactions: [],
};

const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
    const [summary, setSummary] = useState<SpendSummary>(EMPTY_SUMMARY);
    const [isLoading, setIsLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const isUnsupported = Platform.OS !== 'android';

    const scanMessages = useCallback(async (maxMessages: number = 1000) => {
        if (isUnsupported) return;
        setIsLoading(true);
        try {
            const result = await getUpiTransactions(maxMessages);
            setSummary(result);
        } finally {
            setIsLoading(false);
        }
    }, [isUnsupported]);

    const requestPermissionAndScan = useCallback(async () => {
        if (isUnsupported) return;
        const granted = await requestSmsPermission();
        setHasPermission(granted);
        if (granted) {
            await scanMessages();
        }
    }, [isUnsupported, scanMessages]);

    useEffect(() => {
        (async () => {
            if (isUnsupported) return;
            const granted = await checkSmsPermission();
            setHasPermission(granted);
            if (granted) {
                await scanMessages();
            }
        })();
    }, [isUnsupported, scanMessages]);

    const getFilteredTransactions = useCallback((filter: TransactionFilter) => {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);

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

    const value = useMemo(() => ({
        summary,
        isLoading,
        isUnsupported,
        hasPermission,
        scanMessages,
        requestPermissionAndScan,
        getFilteredTransactions,
        getCategorySummary,
    }), [summary, isLoading, isUnsupported, hasPermission, scanMessages, requestPermissionAndScan, getFilteredTransactions, getCategorySummary]);

    return React.createElement(TransactionContext.Provider, { value }, children);
}

export function useTransactions() {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactions must be used within a TransactionProvider');
    }
    return context;
}
