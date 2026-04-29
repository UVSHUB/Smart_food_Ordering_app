const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Config plugin to remove 'enableBundleCompression' from android/app/build.gradle
 * This property was removed in React Native 0.73+ and causes EAS build failures.
 */
const withAndroidBuildFix = (config) => {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;
    // Remove enableBundleCompression line (it was removed in RN 0.73+)
    contents = contents.replace(/\s*enableBundleCompression\s*=\s*(true|false)\r?\n/g, '\n');
    mod.modResults.contents = contents;
    return mod;
  });
};

module.exports = withAndroidBuildFix;
