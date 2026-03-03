import { CATEGORY_MAP } from '../constants/categoryTheme';

// Expanded merchant-to-category map (50+ entries)
const MERCHANT_CATEGORY_MAP: Record<string, string> = {
    // Food & Dining
    swiggy: 'food', zomato: 'food', starbucks: 'food', dominos: 'food',
    'pizza hut': 'food', mcdonalds: 'food', kfc: 'food', 'burger king': 'food',
    subway: 'food', 'food panda': 'food', dunzo: 'food', 'box8': 'food',
    'behrouz': 'food', 'wow momo': 'food', 'haldiram': 'food', 'barbeque': 'food',
    restaurant: 'food', cafe: 'food', bakery: 'food', hotel: 'food',
    'dumpling': 'food', 'biryani': 'food', 'chai': 'food',

    // Travel & Transport
    uber: 'travel', ola: 'travel', irctc: 'travel', rapido: 'travel',
    'make my trip': 'travel', goibibo: 'travel', cleartrip: 'travel',
    redbus: 'travel', yatra: 'travel', 'ease my trip': 'travel',
    metro: 'travel', parking: 'travel', toll: 'travel',

    // Shopping
    amazon: 'shopping', flipkart: 'shopping', myntra: 'shopping',
    ajio: 'shopping', 'meesho': 'shopping', snapdeal: 'shopping',
    nykaa: 'shopping', tatacliq: 'shopping', croma: 'shopping',
    reliance: 'shopping', 'big bazaar': 'shopping', dmart: 'shopping',
    zara: 'shopping', 'h&m': 'shopping',

    // Entertainment
    netflix: 'entertainment', spotify: 'entertainment', 'amazon prime': 'entertainment',
    hotstar: 'entertainment', 'disney': 'entertainment', 'jio cinema': 'entertainment',
    'youtube premium': 'entertainment', 'apple music': 'entertainment',
    inox: 'entertainment', pvr: 'entertainment', bookmyshow: 'entertainment',

    // Bills & Utilities
    electricity: 'bills', 'airtel': 'bills', jio: 'bills', vodafone: 'bills',
    'vi ': 'bills', bsnl: 'bills', 'tata power': 'bills', 'adani': 'bills',
    'gas bill': 'bills', water: 'bills', broadband: 'bills', 'act fibernet': 'bills',
    insurance: 'bills', lic: 'bills', 'policy bazaar': 'bills',

    // Fuel
    shell: 'fuel', 'hp petrol': 'fuel', 'indian oil': 'fuel', 'bharat petroleum': 'fuel',
    iocl: 'fuel', bpcl: 'fuel', hpcl: 'fuel', petrol: 'fuel', diesel: 'fuel',

    // Groceries
    bigbasket: 'groceries', blinkit: 'groceries', zepto: 'groceries',
    'jio mart': 'groceries', grofers: 'groceries', 'nature basket': 'groceries',
    'star bazaar': 'groceries', 'more supermarket': 'groceries',
    swiggy_instamart: 'groceries', 'instamart': 'groceries',

    // Health
    apollo: 'health', '1mg': 'health', 'pharma easy': 'health',
    netmeds: 'health', medplus: 'health', practo: 'health',
    'cult fit': 'health', hospital: 'health', clinic: 'health', pharmacy: 'health',

    // Education
    coursera: 'education', udemy: 'education', unacademy: 'education',
    'byjus': 'education', upgrad: 'education', 'skill share': 'education',

    // Subscriptions
    'google one': 'subscription', 'icloud': 'subscription', chatgpt: 'subscription',
    'microsoft 365': 'subscription', notion: 'subscription', canva: 'subscription',
};

export function categorizeTransaction(merchant: string, type: 'debit' | 'credit' | string = 'debit'): string {
    const normalized = merchant.toLowerCase();

    if (type === 'credit' && (normalized.includes('salary') || normalized.includes('payroll'))) {
        return 'salary';
    }

    for (const [key, category] of Object.entries(MERCHANT_CATEGORY_MAP)) {
        if (normalized.includes(key)) return category;
    }

    if (normalized.includes('@') || normalized.includes('vpa')) {
        return type === 'debit' ? 'person_sent' : 'person_received';
    }

    // Credits from unknown sources
    if (type === 'credit') return 'transfer';

    return 'uncategorized';
}

export function getCategoryInfo(category: string) {
    return CATEGORY_MAP[category] ?? CATEGORY_MAP.uncategorized;
}

export const ALL_CATEGORIES = Object.entries(CATEGORY_MAP).map(([key, val]) => ({
    key,
    label: val.label,
    color: val.color,
    icon: val.icon,
}));

export const seedMerchantMap = Object.entries(MERCHANT_CATEGORY_MAP).map(([merchant, category]) => ({ merchant, category }));
