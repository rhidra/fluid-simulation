const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CnameWebpackPlugin = require('cname-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/index.ts'),
  module: {
    rules: [
      { // Typescript loader
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }, { // CSS loader
        test: /\.css$/i,
        use: [
        ],
      }, { // SCSS loader
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          "sass-loader",
        ],
      }, { // GLSL loader
        test: /\.(frag|vert)$/,
        use: {
          loader: 'webpack-glsl-minify',
          options: {
            preserveAll: false,
            disableMangle: false,
          }
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.frag', '.vert'],
  },
  output: {
    filename: 'bundle.[hash].js',
    path: path.resolve(__dirname, 'docs'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./src/templates/index.html")
    }),
    new MiniCssExtractPlugin({filename: "styles.[hash].css"}),
    new CnameWebpackPlugin({
      domain: 'fluid.remyhidra.dev',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '' },
      ],
    }),
  ]
};