const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("otf");

config.resolver.assetExts.push("lottie");

module.exports = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
});
