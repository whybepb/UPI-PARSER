import { SmsMessage, SpendSummary, TransactionType, UpiTransaction } from './types';

// Common UPI keywords indicating a transaction
const UPI_KEYWORDS = [
    'upi',
    'upi ref',
    'upi txn',
    'upi id',
    'imps',
    'neft',
    'debited',
    'credited',
    'sent to',
    'received from',
    'paid to',
    'payment of',
    'transferred',
    'google pay',
    'gpay',
    'phonepe',
    'paytm',
    'bhim',
];

// Regex to extract amount
const AMOUNT_PATTERNS = [
    /(?:rs\.?|inr\.?|₹)\s*([\d,]+\.?\d*)/i,
    /(?:amount|amt)[\s:]*(?:rs\.?|inr\.?|₹)?\s*([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s*(?:debited|credited)/i,
];

// Debit indicators
const DEBIT_INDICATORS = [
    'debited',
    'debit',
    'sent',
    'paid',
    'payment',
    'transferred',
    'withdrawn',
    'purchase',
    'spent',
];

// Credit indicators
const CREDIT_INDICATORS = [
    'credited',
    'credit',
    'received',
    'refund',
    'cashback',
    'deposit',
];

// Extract merchant/payee name
const MERCHANT_PATTERNS = [
    /(?:to|paid to|sent to|transferred to)\s+([A-Za-z0-9\s@._-]+?)(?:\s+(?:on|via|ref|upi|$))/i,
    /(?:from|received from|credited by)\s+([A-Za-z0-9\s@._-]+?)(?:\s+(?:on|via|ref|upi|$))/i,
    /(?:at|merchant)\s+([A-Za-z0-9\s@._-]+?)(?:\s+(?:on|via|ref|upi|$))/i,
    /VPA\s+([A-Za-z0-9@._-]+)/i,
];

// Extract UPI ref
const UPI_REF_PATTERNS = [
    /(?:upi\s*ref[:\s]*|ref\s*no[:\s]*|txn\s*id[:\s]*|ref[:\s]*)(\d{6,})/i,
];

// Bank name extraction from sender address
const BANK_MAP: Record<string, string> = {
    'SBIUPI': 'SBI',
    'SBIPSG': 'SBI',
    'SBIINB': 'SBI',
    'HDFCBK': 'HDFC',
    'ICICIB': 'ICICI',
    'AXISBK': 'Axis',
    'KOTAKB': 'Kotak',
    'PNBSMS': 'PNB',
    'BOIIND': 'BOI',
    'CANBNK': 'Canara',
    'UNIONB': 'Union',
    'IDFCFB': 'IDFC',
    'YESBNK': 'Yes Bank',
    'INDBNK': 'Indian Bank',
    'CENTBK': 'Central Bank',
    'PAYTM': 'Paytm',
    'GPAY': 'Google Pay',
    'PHONEPE': 'PhonePe',
    'JioPay': 'Jio',
};

/**
 * Check if an SMS body is a UPI transaction message.
 */
function isUpiMessage(body: string): boolean {
    const lower = body.toLowerCase();
    return UPI_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Determine if the transaction is a debit or credit.
 */
function getTransactionType(body: string): TransactionType {
    const lower = body.toLowerCase();
    // Check credit first (to handle "credited" before "debited" in ambiguous messages)
    if (CREDIT_INDICATORS.some((ind) => lower.includes(ind))) return 'credit';
    if (DEBIT_INDICATORS.some((ind) => lower.includes(ind))) return 'debit';
    return 'debit'; // default to debit if unclear
}

/**
 * Extract the transaction amount from the message body.
 */
function extractAmount(body: string): number | null {
    for (const pattern of AMOUNT_PATTERNS) {
        const match = body.match(pattern);
        if (match) {
            const cleaned = match[1].replace(/,/g, '');
            const amount = parseFloat(cleaned);
            if (!isNaN(amount) && amount > 0) return amount;
        }
    }
    return null;
}

/**
 * Extract merchant or payee name.
 */
function extractMerchant(body: string): string {
    for (const pattern of MERCHANT_PATTERNS) {
        const match = body.match(pattern);
        if (match) {
            return match[1].trim().substring(0, 40);
        }
    }
    return 'Unknown';
}

/**
 * Extract UPI reference number.
 */
function extractUpiRef(body: string): string | null {
    for (const pattern of UPI_REF_PATTERNS) {
        const match = body.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Detect bank name from the sender address.
 */
function detectBank(address: string): string {
    const upper = address.toUpperCase().replace(/[^A-Z]/g, '');
    for (const [key, value] of Object.entries(BANK_MAP)) {
        if (upper.includes(key.toUpperCase())) return value;
    }
    return address.replace(/[^A-Za-z]/g, '').substring(0, 10) || 'Unknown';
}

/**
 * Parse a single SMS into a UpiTransaction, or return null if not a UPI message.
 */
export function parseSms(sms: SmsMessage): UpiTransaction | null {
    if (!isUpiMessage(sms.body)) return null;

    const amount = extractAmount(sms.body);
    if (amount === null) return null; // Can't determine amount, skip

    const type = getTransactionType(sms.body);
    const merchant = extractMerchant(sms.body);
    const upiRef = extractUpiRef(sms.body);
    const bank = detectBank(sms.address);

    return {
        id: sms._id || String(sms.date),
        type,
        amount,
        merchant,
        date: new Date(sms.date),
        bank,
        upiRef,
        rawMessage: sms.body,
    };
}

/**
 * Parse an array of SMS messages and return a SpendSummary.
 */
export function parseAllSms(messages: SmsMessage[]): SpendSummary {
    const transactions: UpiTransaction[] = [];

    for (const sms of messages) {
        const txn = parseSms(sms);
        if (txn) transactions.push(txn);
    }

    // Sort by date descending (most recent first)
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    const totalSpent = transactions
        .filter((t) => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalReceived = transactions
        .filter((t) => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

    const debitCount = transactions.filter((t) => t.type === 'debit').length;
    const creditCount = transactions.filter((t) => t.type === 'credit').length;

    return {
        totalSpent,
        totalReceived,
        transactionCount: transactions.length,
        debitCount,
        creditCount,
        transactions,
    };
}
