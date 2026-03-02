import { categorizeTransaction } from './categoryEngine';
import { SmsMessage, SpendSummary, TransactionType, UpiTransaction } from './types';

const UPI_KEYWORDS = ['upi', 'imps', 'neft', 'debited', 'credited', 'sent to', 'received from', 'paid to', 'payment', 'gpay', 'phonepe', 'paytm'];
const AMOUNT_PATTERNS = [
    /(?:rs\.?|inr\.?|₹|usd|\$)\s*([\d,]+\.?\d*)/i,
    /(?:amount|amt)[\s:]*(?:rs\.?|inr\.?|₹)?\s*([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s*(?:debited|credited)/i,
];
const DEBIT_INDICATORS = ['debited', 'sent', 'paid', 'payment', 'transferred', 'purchase', 'spent'];
const CREDIT_INDICATORS = ['credited', 'received', 'refund', 'cashback', 'deposit'];
const MERCHANT_PATTERNS = [
    /(?:to|paid to|sent to|transferred to)\s+([A-Za-z0-9\s@._-]+?)(?:\s+(?:on|via|ref|upi|$))/i,
    /(?:from|received from|credited by)\s+([A-Za-z0-9\s@._-]+?)(?:\s+(?:on|via|ref|upi|$))/i,
    /(?:at|merchant)\s+([A-Za-z0-9\s@._-]+?)(?:\s+(?:on|via|ref|upi|$))/i,
    /VPA\s+([A-Za-z0-9@._-]+)/i,
];
const UPI_REF_PATTERNS = [/(?:upi\s*ref[:\s]*|ref\s*no[:\s]*|txn\s*id[:\s]*|ref[:\s]*)(\d{6,})/i];

const BANK_MAP: Record<string, string> = { SBIUPI: 'SBI', HDFCBK: 'HDFC', ICICIB: 'ICICI', AXISBK: 'Axis', KOTAKB: 'Kotak', PAYTM: 'Paytm', GPAY: 'Google Pay', PHONEPE: 'PhonePe' };

function isUpiMessage(body: string): boolean {
    const lower = body.toLowerCase();
    return UPI_KEYWORDS.some((kw) => lower.includes(kw));
}

function getTransactionType(body: string): TransactionType {
    const lower = body.toLowerCase();
    if (CREDIT_INDICATORS.some((ind) => lower.includes(ind))) return 'credit';
    if (DEBIT_INDICATORS.some((ind) => lower.includes(ind))) return 'debit';
    return 'debit';
}

function extractAmount(body: string): { amount: number | null; confidence: number } {
    for (const [idx, pattern] of AMOUNT_PATTERNS.entries()) {
        const match = body.match(pattern);
        if (match) {
            const cleaned = match[1].replace(/,/g, '');
            const amount = parseFloat(cleaned);
            if (!isNaN(amount) && amount > 0) {
                return { amount, confidence: idx === 0 ? 0.95 : 0.8 };
            }
        }
    }
    return { amount: null, confidence: 0 };
}

function extractMerchant(body: string): { merchant: string; confidence: number } {
    for (const pattern of MERCHANT_PATTERNS) {
        const match = body.match(pattern);
        if (match) return { merchant: match[1].trim().substring(0, 50), confidence: 0.85 };
    }
    return { merchant: 'Unknown', confidence: 0.4 };
}

function extractUpiRef(body: string): string | null {
    for (const pattern of UPI_REF_PATTERNS) {
        const match = body.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function detectBank(address: string): string {
    const upper = address.toUpperCase().replace(/[^A-Z]/g, '');
    for (const [key, value] of Object.entries(BANK_MAP)) if (upper.includes(key)) return value;
    return address.replace(/[^A-Za-z]/g, '').substring(0, 12) || 'Unknown';
}

export function parseSms(sms: SmsMessage): UpiTransaction | null {
    if (!isUpiMessage(sms.body)) return null;
    const { amount, confidence: amountConfidence } = extractAmount(sms.body);
    if (amount === null) return null;

    const type = getTransactionType(sms.body);
    const { merchant, confidence: merchantConfidence } = extractMerchant(sms.body);
    const upiRef = extractUpiRef(sms.body);
    const bank = detectBank(sms.address);
    const category = categorizeTransaction(merchant, type);
    const confidence = Number(((amountConfidence + merchantConfidence) / 2).toFixed(2));
    const reviewNeeded = category === 'uncategorized' || merchant === 'Unknown' || confidence < 0.6;

    return {
        id: sms._id || String(sms.date),
        source: 'sms',
        type,
        amount,
        merchant,
        category,
        confidence,
        parseStatus: reviewNeeded ? 'review_needed' : 'parsed',
        reviewReason: reviewNeeded ? 'Low confidence or unknown category' : null,
        date: new Date(sms.date),
        bank,
        upiRef,
        rawMessage: sms.body,
        notes: null,
    };
}

export function parseAllSms(messages: SmsMessage[]): SpendSummary {
    const transactions: UpiTransaction[] = [];
    for (const sms of messages) {
        const txn = parseSms(sms);
        if (txn) transactions.push(txn);
    }
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    const totalSpent = transactions.filter((t) => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    const totalReceived = transactions.filter((t) => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const debitCount = transactions.filter((t) => t.type === 'debit').length;
    const creditCount = transactions.filter((t) => t.type === 'credit').length;

    return { totalSpent, totalReceived, transactionCount: transactions.length, debitCount, creditCount, transactions };
}
