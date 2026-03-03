/**
 * SmartCategorizer — AI-like categorization engine
 * 
 * Uses a scoring model with multiple signals:
 * 1. Keyword matching (weighted)
 * 2. VPA/UPI ID pattern matching (@merchant handles)
 * 3. Amount heuristics (small amounts → food, large → transfers)
 * 4. Learned corrections from user history
 * 5. Confidence scoring to flag uncertain classifications
 */


// Weighted keyword rules: [keyword, category, weight]
const KEYWORD_RULES: [string, string, number][] = [
    // Food (high confidence)
    ['swiggy', 'food', 1.0], ['zomato', 'food', 1.0], ['dominos', 'food', 0.95],
    ['pizza', 'food', 0.9], ['mcdonalds', 'food', 0.95], ['kfc', 'food', 0.95],
    ['starbucks', 'food', 0.9], ['restaurant', 'food', 0.8], ['cafe', 'food', 0.8],
    ['bakery', 'food', 0.8], ['biryani', 'food', 0.85], ['burger', 'food', 0.85],
    ['subway', 'food', 0.9], ['food', 'food', 0.7], ['dunzo', 'food', 0.7],

    // Travel
    ['uber', 'travel', 0.95], ['ola', 'travel', 0.95], ['rapido', 'travel', 0.95],
    ['irctc', 'travel', 0.95], ['makemytrip', 'travel', 0.9], ['goibibo', 'travel', 0.9],
    ['cleartrip', 'travel', 0.9], ['redbus', 'travel', 0.9], ['metro', 'travel', 0.7],
    ['parking', 'travel', 0.7], ['toll', 'travel', 0.8],

    // Shopping
    ['amazon', 'shopping', 0.9], ['flipkart', 'shopping', 0.95], ['myntra', 'shopping', 0.95],
    ['ajio', 'shopping', 0.9], ['meesho', 'shopping', 0.9], ['nykaa', 'shopping', 0.9],
    ['croma', 'shopping', 0.85], ['reliance', 'shopping', 0.7],

    // Entertainment
    ['netflix', 'entertainment', 0.98], ['spotify', 'entertainment', 0.98],
    ['hotstar', 'entertainment', 0.95], ['bookmyshow', 'entertainment', 0.95],
    ['pvr', 'entertainment', 0.9], ['inox', 'entertainment', 0.9],

    // Bills
    ['airtel', 'bills', 0.85], ['jio', 'bills', 0.75], ['vodafone', 'bills', 0.85],
    ['electricity', 'bills', 0.9], ['broadband', 'bills', 0.85], ['gas bill', 'bills', 0.85],
    ['insurance', 'bills', 0.8], ['lic', 'bills', 0.85],

    // Fuel
    ['petrol', 'fuel', 0.95], ['diesel', 'fuel', 0.95], ['iocl', 'fuel', 0.9],
    ['bpcl', 'fuel', 0.9], ['hpcl', 'fuel', 0.9], ['shell', 'fuel', 0.85],

    // Groceries
    ['bigbasket', 'groceries', 0.95], ['blinkit', 'groceries', 0.95],
    ['zepto', 'groceries', 0.95], ['instamart', 'groceries', 0.9],
    ['grofers', 'groceries', 0.9], ['dmart', 'groceries', 0.85],

    // Health
    ['apollo', 'health', 0.85], ['1mg', 'health', 0.9], ['pharmeasy', 'health', 0.9],
    ['practo', 'health', 0.9], ['hospital', 'health', 0.8], ['pharmacy', 'health', 0.8],

    // Education
    ['coursera', 'education', 0.95], ['udemy', 'education', 0.95],
    ['unacademy', 'education', 0.9], ['byjus', 'education', 0.9],

    // Subscriptions
    ['google one', 'subscription', 0.9], ['chatgpt', 'subscription', 0.9],
    ['microsoft', 'subscription', 0.7], ['notion', 'subscription', 0.85],
];

// VPA handle patterns (e.g. swiggy@upi → food)
const VPA_RULES: [RegExp, string, number][] = [
    [/swiggy/i, 'food', 0.98], [/zomato/i, 'food', 0.98],
    [/uber/i, 'travel', 0.95], [/ola/i, 'travel', 0.95],
    [/paytm/i, 'shopping', 0.5], [/phonepe/i, 'shopping', 0.4],
    [/amazon/i, 'shopping', 0.9], [/flipkart/i, 'shopping', 0.95],
    [/netflix/i, 'entertainment', 0.98], [/spotify/i, 'entertainment', 0.98],
    [/airtel/i, 'bills', 0.85], [/jio/i, 'bills', 0.75],
];

// Amount-based heuristics
function amountHeuristic(amount: number, type: string): { category: string; weight: number } | null {
    if (type === 'credit' && amount > 10000) return { category: 'salary', weight: 0.3 };
    if (type === 'credit') return { category: 'transfer', weight: 0.2 };
    if (amount < 100) return { category: 'food', weight: 0.15 };
    if (amount > 50000) return { category: 'transfer', weight: 0.2 };
    return null;
}

export interface ScoredCategory {
    category: string;
    confidence: number;
    signals: string[];
}

/**
 * Score a transaction across all signals and return the best category
 * with a confidence score (0-1).
 */
export function scoreTransaction(
    merchant: string,
    amount: number,
    type: 'debit' | 'credit',
    rawMessage: string,
    learnedMap?: Record<string, string>,
): ScoredCategory {
    const candidates: Map<string, { totalWeight: number; signals: string[] }> = new Map();

    function addScore(category: string, weight: number, signal: string) {
        const existing = candidates.get(category) ?? { totalWeight: 0, signals: [] };
        existing.totalWeight += weight;
        existing.signals.push(signal);
        candidates.set(category, existing);
    }

    const normalized = merchant.toLowerCase();
    const rawLower = rawMessage.toLowerCase();

    // Signal 1: Learned corrections (highest priority)
    if (learnedMap) {
        const learned = learnedMap[normalized];
        if (learned) {
            addScore(learned, 1.5, 'learned_correction');
        }
    }

    // Signal 2: Keyword matching on merchant name
    for (const [kw, cat, weight] of KEYWORD_RULES) {
        if (normalized.includes(kw)) {
            addScore(cat, weight, `keyword:${kw}`);
        }
    }

    // Signal 3: Keyword matching on raw SMS body
    for (const [kw, cat, weight] of KEYWORD_RULES) {
        if (rawLower.includes(kw) && !normalized.includes(kw)) {
            addScore(cat, weight * 0.5, `raw_body:${kw}`);
        }
    }

    // Signal 4: VPA handle matching
    for (const [regex, cat, weight] of VPA_RULES) {
        if (regex.test(merchant)) {
            addScore(cat, weight, `vpa:${regex.source}`);
        }
    }

    // Signal 5: Amount heuristic
    const amtHint = amountHeuristic(amount, type);
    if (amtHint) {
        addScore(amtHint.category, amtHint.weight, `amount_heuristic:${amount}`);
    }

    // Signal 6: Person-to-person (VPA with @)
    if (normalized.includes('@') && !VPA_RULES.some(([r]) => r.test(normalized))) {
        addScore(type === 'debit' ? 'person_sent' : 'person_received', 0.6, 'vpa_personal');
    }

    // Pick the best category
    let bestCat = 'uncategorized';
    let bestWeight = 0;
    let bestSignals: string[] = [];

    for (const [cat, data] of candidates) {
        if (data.totalWeight > bestWeight) {
            bestCat = cat;
            bestWeight = data.totalWeight;
            bestSignals = data.signals;
        }
    }

    // Normalize confidence to 0-1
    const confidence = Math.min(1, bestWeight);

    return { category: bestCat, confidence, signals: bestSignals };
}

/**
 * Check if this category assignment needs human review.
 */
export function needsReview(scored: ScoredCategory): boolean {
    return scored.confidence < 0.5 || scored.category === 'uncategorized';
}

/**
 * Get a human-readable reason for why review is needed.
 */
export function getReviewReason(scored: ScoredCategory): string | null {
    if (scored.category === 'uncategorized') return 'No matching category found';
    if (scored.confidence < 0.3) return 'Very low confidence';
    if (scored.confidence < 0.5) return 'Multiple conflicting categories';
    return null;
}
