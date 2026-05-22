// plugins/withManifestFixes.js
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withManifestFixes(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults.manifest;

    // Find or create the <application> tag
    const application = manifest.application?.[0];

    if (!application) {
      console.warn('[withManifestFixes] No <application> tag found in manifest');
      return config;
    }

    // Add xmlns:tools if missing
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // Add tools:replace to <application>
    // This overrides conflicting attributes from :expo-esewa$EsewaSdk
    application.$['tools:replace'] = 'android:enableOnBackInvokedCallback,android:theme';

    // Optional: force your preferred values (already set by Expo, but explicit)
    application.$['android:enableOnBackInvokedCallback'] = 'false';
    application.$['android:theme'] = '@style/AppTheme';

    return config;
  });
};