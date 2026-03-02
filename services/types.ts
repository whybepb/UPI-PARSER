export interface SmsMessage {
    _id: string;
    address: string;
    body: string;
    date: number;
    date_sent: number;
    type: number;
    read: number;
}

export type TransactionType = 'debit' | 'credit';
export type ParseStatus = 'parsed' | 'review_needed' | 'failed';

export interface UpiTransaction {
    id: string;
    source: 'sms' | 'manual';
    type: TransactionType;
    amount: number;
    merchant: string;
    category: string;
    confidence: number;
    parseStatus: ParseStatus;
    reviewReason: string | null;
    date: Date;
    bank: string;
    upiRef: string | null;
    rawMessage: string;
    notes?: string | null;
}

export interface SpendSummary {
    totalSpent: number;
    totalReceived: number;
    transactionCount: number;
    debitCount: number;
    creditCount: number;
    transactions: UpiTransaction[];
}

export interface BudgetConfig {
    monthKey: string;
    amount: number;
}
