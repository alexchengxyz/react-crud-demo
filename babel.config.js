module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react'
  ],
  plugins: [
    'jest-hoist',
    '@babel/plugin-transform-runtime',
  ],
};
