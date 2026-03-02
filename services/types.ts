export interface SmsMessage {
    _id: string;
    address: string;
    body: string;
    date: number;
    date_sent: number;
    type: number; // 1 = inbox, 2 = sent
    read: number;
}

export type TransactionType = 'debit' | 'credit';

export interface UpiTransaction {
    id: string;
    type: TransactionType;
    amount: number;
    merchant: string;
    category: string;
    date: Date;
    bank: string;
    upiRef: string | null;
    rawMessage: string;
}

export interface SpendSummary {
    totalSpent: number;
    totalReceived: number;
    transactionCount: number;
    debitCount: number;
    creditCount: number;
    transactions: UpiTransaction[];
}
