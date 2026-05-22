// plugins/withMaterialTheme.js
const { withAndroidStyles } = require('@expo/config-plugins');

module.exports = function withMaterialTheme(config) {
  return withAndroidStyles(config, (config) => {
    // Find or create AppTheme
    const styles = config.modResults;

    // Look for existing AppTheme
    let appTheme = styles.resources.style.find(
      (s) => s.$?.name === 'AppTheme'
    );

    if (appTheme) {
      // Update parent if it exists
      appTheme.$.parent = 'Theme.MaterialComponents.DayNight.NoActionBar';
    } else {
      // Add new AppTheme if missing
      styles.resources.style.push({
        $: {
          name: 'AppTheme',
          parent: 'Theme.MaterialComponents.DayNight.NoActionBar',
        },
        item: [
          // Optional: add color items if you want to override defaults
          // { $: { name: 'colorPrimary' }, _: '#6200EE' },
        ],
      });
    }

    // Optional: also update any launch/splash theme variants if they exist
    const launchTheme = styles.resources.style.find(
      (s) => s.$$   ?.name?.includes('Launch') || s.   $$?.name?.includes('Splash')
    );
    if (launchTheme) {
      launchTheme.$.parent = 'Theme.MaterialComponents.DayNight.NoActionBar';
    }

    return config;
  });
};