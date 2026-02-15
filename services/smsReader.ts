import { PermissionsAndroid, Platform } from 'react-native';
import { SmsMessage, SpendSummary } from './types';
import { parseAllSms } from './upiParser';

/**
 * Request READ_SMS permission on Android.
 * Returns true if granted, false otherwise.
 */
export async function requestSmsPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_SMS,
            {
                title: 'SMS Permission',
                message:
                    'UPI Parser needs access to your SMS messages to read and analyze your UPI transactions.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
        console.warn('SMS permission error:', err);
        return false;
    }
}

/**
 * Check if SMS permission is already granted.
 */
export async function checkSmsPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
        const result = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_SMS
        );
        return result;
    } catch {
        return false;
    }
}

/**
 * Read SMS messages from the device inbox.
 * Uses react-native-get-sms-android under the hood.
 */
export async function readSmsMessages(
    maxCount: number = 500
): Promise<SmsMessage[]> {
    if (Platform.OS !== 'android') return [];

    try {
        // Dynamic import to avoid crash on iOS
        const SmsModule = require('react-native-get-sms-android');
        const SmsAndroid = SmsModule.default || SmsModule;

        return new Promise((resolve, reject) => {
            const filter = {
                box: 'inbox',
                maxCount,
            };

            SmsAndroid.list(
                JSON.stringify(filter),
                (fail: string) => {
                    console.warn('Failed to read SMS:', fail);
                    reject(new Error(fail));
                },
                (_count: number, smsList: string) => {
                    try {
                        const messages: SmsMessage[] = JSON.parse(smsList);
                        resolve(messages);
                    } catch (e) {
                        console.warn('Failed to parse SMS list:', e);
                        resolve([]);
                    }
                }
            );
        });
    } catch (err) {
        console.warn('SMS reading error:', err);
        return [];
    }
}

/**
 * Main function: read SMS and parse UPI transactions.
 * Returns a SpendSummary with all parsed transactions.
 */
export async function getUpiTransactions(
    maxMessages: number = 500
): Promise<SpendSummary> {
    const messages = await readSmsMessages(maxMessages);
    return parseAllSms(messages);
}
