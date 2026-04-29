const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Config plugin to remove 'enableBundleCompression' from android/app/build.gradle
 * This property was removed in React Native 0.73+ and causes EAS build failures.
 */
const withAndroidBuildFix = (config) => {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;
    // Remove enableBundleCompression line in any form (Groovy DSL)
    contents = contents.replace(/[^\n]*enableBundleCompression[^\n]*\n/g, '');
    mod.modResults.contents = contents;
    return mod;
  });
};

module.exports = withAndroidBuildFix;
