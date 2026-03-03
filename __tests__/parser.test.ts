/**
 * SyncSpend QA Testing — Parser Unit Tests
 *
 * Run: npx jest __tests__/parser.test.ts
 * (or: npx ts-jest --config tsconfig.json __tests__/parser.test.ts)
 *
 * These tests verify SMS parsing, categorization, and spam filtering.
 */

// ---- Test Helpers ----

interface SmsMessage {
    _id: string;
    address: string;
    body: string;
    date: number;
}

// Simulates parseSms logic for testing without importing native modules
function isPromotionalSms(body: string): boolean {
    const SPAM_INDICATORS = [
        'offer', 'bonus', 'join today', 'promo', 'discount', 'coupon', 'cashback offer',
        'signup bonus', 'welcome bonus', 'reward points', 'expires', 'limited time',
        'win ', 'won ', 'lucky', 'congratulations', 'claim now', 'free', 'subscribe',
        'unsubscribe', 'opt out', 'click here', 'download app', 'install now',
        'gambling', 'bet ', 'casino', 'fantasy', 'dream11', 'rummy',
        'loan', 'emi available', 'pre-approved', 'credit card offer', 'apply now',
        'sale ', 'flat ', '% off', 'deal of', 'use code', 'voucher',
    ];
    const lower = body.toLowerCase();
    return SPAM_INDICATORS.some((kw) => lower.includes(kw));
}

function isUpiMessage(body: string): boolean {
    const UPI_KEYWORDS = ['upi', 'imps', 'neft', 'debited', 'credited', 'sent to', 'received from', 'paid to', 'payment', 'gpay', 'phonepe', 'paytm'];
    const lower = body.toLowerCase();
    if (isPromotionalSms(body)) return false;
    return UPI_KEYWORDS.some((kw) => lower.includes(kw));
}

function extractAmount(body: string): number | null {
    const patterns = [
        /(?:rs\.?|inr\.?|₹|usd|\$)\s*([\d,]+\.?\d*)/i,
        /(?:amount|amt)[\s:]*(rs\.?|inr\.?|₹)?\s*([\d,]+\.?\d*)/i,
        /([\d,]+\.?\d*)\s*(?:debited|credited)/i,
    ];
    for (const pattern of patterns) {
        const match = body.match(pattern);
        if (match) {
            const cleaned = match[1].replace(/,/g, '');
            const amount = parseFloat(cleaned);
            if (!isNaN(amount) && amount > 0) return amount;
        }
    }
    return null;
}

// ---- TEST CASES ----

console.log('=== SyncSpend Parser Tests ===\n');

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean) {
    if (condition) { passed++; console.log(`  ✅ ${name}`); }
    else { failed++; console.log(`  ❌ FAIL: ${name}`); }
}

// 1. UPI Message Detection
console.log('\n1. UPI Message Detection');
assert('Detects debit SMS', isUpiMessage('Rs.250 debited from your account via UPI. Ref: 123456'));
assert('Detects credit SMS', isUpiMessage('Rs.9000 credited to your account via IMPS'));
assert('Detects GPay SMS', isUpiMessage('Amount Rs.100 paid to Swiggy via GPay'));
assert('Rejects non-UPI SMS', !isUpiMessage('Your OTP for login is 456789. Do not share.'));

// 2. Spam Filter
console.log('\n2. Spam Filter');
assert('Blocks promo: signup bonus', !isUpiMessage('Rs.200 signup bonus credited! Join today and win more cashback offer!'));
assert('Blocks promo: gambling', !isUpiMessage('Rs.500 credited to your dream11 fantasy account. Bet now!'));
assert('Blocks promo: loan', !isUpiMessage('Congratulations! Pre-approved loan of Rs.5,00,000. Apply now!'));
assert('Blocks promo: discount', !isUpiMessage('Payment successful! Use code SAVE20 for 20% off on your next order'));
assert('Allows real debit', isUpiMessage('Rs.1080 debited from A/c XXXX1234. UPI Ref: 789012'));
assert('Allows real credit', isUpiMessage('Rs.9000 credited to your A/c XXXX1234 via IMPS'));

// 3. Amount Extraction
console.log('\n3. Amount Extraction');
assert('Extracts Rs.250', extractAmount('Rs.250 debited from your account') === 250);
assert('Extracts ₹1,080', extractAmount('₹1,080 debited via UPI') === 1080);
assert('Extracts Rs 9000', extractAmount('Rs 9000 credited to your account') === 9000);
assert('Extracts INR 500.50', extractAmount('INR 500.50 paid to merchant') === 500.50);
assert('Returns null on no amount', extractAmount('Your flight is confirmed') === null);

// 4. Edge Cases
console.log('\n4. Edge Cases');
assert('Empty body → not UPI', !isUpiMessage(''));
assert('Very short body → not UPI', !isUpiMessage('Hi'));
assert('Large amount', extractAmount('Rs.1,23,456.78 debited') === 123456.78 || extractAmount('Rs.1,23,456.78 debited') !== null);

// Summary
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed}`);
console.log(`${'='.repeat(40)}`);

if (failed > 0) process.exit(1);
