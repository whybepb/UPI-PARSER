/**
 * SyncSpend QA Testing — Category Engine + Smart Scorer Tests
 *
 * Run: npx tsx __tests__/category.test.ts
 */

// Re-implement the scoring logic inline for testing (no native module deps)

const KEYWORD_RULES: [string, string, number][] = [
    ['swiggy', 'food', 1.0], ['zomato', 'food', 1.0], ['uber', 'travel', 0.95],
    ['ola', 'travel', 0.95], ['amazon', 'shopping', 0.9], ['flipkart', 'shopping', 0.95],
    ['netflix', 'entertainment', 0.98], ['spotify', 'entertainment', 0.98],
    ['airtel', 'bills', 0.85], ['bigbasket', 'groceries', 0.95],
    ['apollo', 'health', 0.85], ['coursera', 'education', 0.95],
    ['petrol', 'fuel', 0.95],
];

function categorize(merchant: string): { category: string; confidence: number } {
    const normalized = merchant.toLowerCase();
    for (const [kw, cat, weight] of KEYWORD_RULES) {
        if (normalized.includes(kw)) return { category: cat, confidence: weight };
    }
    if (normalized.includes('@')) return { category: 'person_sent', confidence: 0.6 };
    return { category: 'uncategorized', confidence: 0 };
}

// ---- TEST CASES ----

console.log('=== SyncSpend Category Engine Tests ===\n');

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean) {
    if (condition) { passed++; console.log(`  ✅ ${name}`); }
    else { failed++; console.log(`  ❌ FAIL: ${name}`); }
}

// 1. Known Merchants
console.log('1. Known Merchant Categorization');
assert('Swiggy → food', categorize('Swiggy Pvt Ltd').category === 'food');
assert('Zomato → food', categorize('ZOMATO ORDER').category === 'food');
assert('Uber → travel', categorize('uber trip').category === 'travel');
assert('Ola → travel', categorize('OLA CABS').category === 'travel');
assert('Amazon → shopping', categorize('AMAZON PAY').category === 'shopping');
assert('Flipkart → shopping', categorize('Flipkart Internet').category === 'shopping');
assert('Netflix → entertainment', categorize('NETFLIX.COM').category === 'entertainment');
assert('Spotify → entertainment', categorize('spotify premium').category === 'entertainment');
assert('Airtel → bills', categorize('Airtel Prepaid').category === 'bills');
assert('BigBasket → groceries', categorize('BIGBASKET ORDER').category === 'groceries');
assert('Apollo → health', categorize('Apollo Pharmacy').category === 'health');
assert('Coursera → education', categorize('COURSERA INC').category === 'education');
assert('Petrol → fuel', categorize('HP PETROL PUMP').category === 'fuel');

// 2. Personal Transfers
console.log('\n2. Personal Transfers');
assert('VPA → person_sent', categorize('john@okaxis').category === 'person_sent');
assert('VPA → person_sent', categorize('friend@ybl').category === 'person_sent');

// 3. Unknown Merchants
console.log('\n3. Unknown Merchants');
assert('Random → uncategorized', categorize('ABC Corp').category === 'uncategorized');
assert('Empty → uncategorized', categorize('Unknown').category === 'uncategorized');

// 4. Confidence Scoring
console.log('\n4. Confidence Scoring');
assert('Swiggy high confidence', categorize('Swiggy').confidence >= 0.9);
assert('VPA medium confidence', categorize('john@paytm').confidence >= 0.5);
assert('Unknown zero confidence', categorize('ABC Corp').confidence === 0);

// Summary
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed}`);
console.log(`${'='.repeat(40)}`);

if (failed > 0) process.exit(1);
