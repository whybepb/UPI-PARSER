import { CATEGORY_MAP } from '../constants/categoryTheme';

const MERCHANT_CATEGORY_MAP: Record<string, string> = {
    swiggy: 'food',
    zomato: 'food',
    starbucks: 'food',
    uber: 'travel',
    ola: 'travel',
    irctc: 'travel',
    amazon: 'shopping',
    flipkart: 'shopping',
    myntra: 'shopping',
    netflix: 'entertainment',
    spotify: 'entertainment',
    shell: 'fuel',
    'hp petrol': 'fuel',
    bigbasket: 'groceries',
    blinkit: 'groceries',
    apollo: 'health',
    lic: 'bills',
    electricity: 'bills',
};

export function categorizeTransaction(merchant: string, type: 'debit' | 'credit'): string {
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

    return 'uncategorized';
}

export function getCategoryInfo(category: string) {
    return CATEGORY_MAP[category] ?? CATEGORY_MAP.uncategorized;
}

export const seedMerchantMap = Object.entries(MERCHANT_CATEGORY_MAP).map(([merchant, category]) => ({ merchant, category }));
