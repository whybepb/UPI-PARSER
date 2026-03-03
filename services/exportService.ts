import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { UpiTransaction } from './types';

type ExportResult = {
    ok: boolean;
    path?: string;
    error?: string;
};

function escapeCsvField(value: unknown): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    const escaped = str.replace(/"/g, '""');
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

export function buildTransactionsCsv(transactions: UpiTransaction[]): string {
    const headers = [
        'id',
        'source',
        'type',
        'amount',
        'merchant',
        'category',
        'date',
        'bank',
        'upiRef',
        'parseStatus',
        'confidence',
        'reviewReason',
        'notes',
    ];

    const lines = transactions.map((txn) =>
        [
            txn.id,
            txn.source,
            txn.type,
            txn.amount.toFixed(2),
            txn.merchant,
            txn.category,
            txn.date.toISOString(),
            txn.bank,
            txn.upiRef ?? '',
            txn.parseStatus,
            txn.confidence.toFixed(2),
            txn.reviewReason ?? '',
            txn.notes ?? '',
        ].map(escapeCsvField).join(','),
    );

    return [headers.join(','), ...lines].join('\n');
}

function saveWebCsv(csv: string): ExportResult {
    if (typeof document === 'undefined' || typeof URL === 'undefined') {
        return { ok: false, error: 'Browser download is unavailable in this environment.' };
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const fileName = `syncspend-transactions-${Date.now()}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { ok: true, path: fileName };
}

export async function exportTransactionsCsv(transactions: UpiTransaction[]): Promise<ExportResult> {
    if (transactions.length === 0) {
        return { ok: false, error: 'No transactions to export.' };
    }

    try {
        const csv = buildTransactionsCsv(transactions);

        if (Platform.OS === 'web') {
            return saveWebCsv(csv);
        }

        const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
        if (!baseDir) {
            return { ok: false, error: 'File system is unavailable on this device.' };
        }

        const filePath = `${baseDir}syncspend-transactions-${Date.now()}.csv`;
        await FileSystem.writeAsStringAsync(filePath, csv, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
            await Sharing.shareAsync(filePath, {
                dialogTitle: 'Export SyncSpend transactions',
                mimeType: 'text/csv',
                UTI: 'public.comma-separated-values-text',
            });
        }

        return { ok: true, path: filePath };
    } catch (e: any) {
        return { ok: false, error: e?.message ?? 'Failed to export CSV.' };
    }
}
