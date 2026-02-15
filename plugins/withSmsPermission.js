const { withAndroidManifest } = require('expo/config-plugins');

function withSmsPermission(config) {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;
        const mainApplication = androidManifest.manifest;

        // Ensure permissions array exists
        if (!mainApplication['uses-permission']) {
            mainApplication['uses-permission'] = [];
        }

        const permissions = mainApplication['uses-permission'];

        // Add READ_SMS if not already present
        const hasReadSms = permissions.some(
            (p) => p.$?.['android:name'] === 'android.permission.READ_SMS'
        );
        if (!hasReadSms) {
            permissions.push({
                $: { 'android:name': 'android.permission.READ_SMS' },
            });
        }

        // Set launchMode to singleTask to fix Expo Router linking conflict
        const application = mainApplication.application?.[0];
        if (application?.activity) {
            for (const activity of application.activity) {
                if (
                    activity.$?.['android:name'] === '.MainActivity' ||
                    activity.$?.['android:name']?.includes('MainActivity')
                ) {
                    activity.$['android:launchMode'] = 'singleTask';
                }
            }
        }

        return config;
    });
}

module.exports = withSmsPermission;

