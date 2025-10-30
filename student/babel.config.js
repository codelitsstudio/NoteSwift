module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Only include plugins you want. Remove any unwanted plugins like react-native-worklets/plugin
    plugins: [
      // 'expo-router/babel',
      'react-native-worklets/plugin',
    ],
  };
};