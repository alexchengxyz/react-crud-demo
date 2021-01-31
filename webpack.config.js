require('dotenv').config();
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  devServer: {
    host: process.env.CLIENT_HOST,
    compress: true,
    port: process.env.CLIENT_PORT,
    proxy: {
      '/api': process.env.SERVER_HOST
    }
  },
  entry: './src/index.js',
  output: {
    path: path.join(__dirname,'/public'),
    filename: './assets/js/bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader', }
      },
      {
        test: /\.css$/,
        use:['style-loader','css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  plugins:[
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    })
  ]
}
