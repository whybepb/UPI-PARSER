import { CATEGORY_MAP } from '../constants/categoryTheme';

const MERCHANT_CATEGORY_MAP: Record<string, string> = {
    swiggy: 'food',
    zomato: 'food',
    uber: 'transport',
    ola: 'transport',
    amazon: 'shopping',
    flipkart: 'shopping',
    netflix: 'subscription',
    spotify: 'subscription',
    shell: 'fuel',
    'hp petrol': 'fuel',
    bigbasket: 'groceries',
};

export function categorizeTransaction(merchant: string): string {
    const normalized = merchant.toLowerCase();

    for (const [key, category] of Object.entries(MERCHANT_CATEGORY_MAP)) {
        if (normalized.includes(key)) {
            return category;
        }
    }

    if (normalized.includes('salary')) {
        return 'salary';
    }

    return 'unknown';
}

export function getCategoryInfo(category: string) {
    return CATEGORY_MAP[category] ?? CATEGORY_MAP.unknown;
}
