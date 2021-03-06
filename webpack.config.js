const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './app/app.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.js'
  },
  plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './app/index.html', to: "./index.html" },
      { from: './app/style.css', to: "./style.css" },
      { context: './app/pages/', from: '*', to: "./pages/" },
      { context: './app/regulator/', from: '*', to:"./regulator/"},
      { context: './app/tollBoothOperator/', from: '*', to:"./tollBoothOperator/"},
      { context: './app/vehicle/', from: '*', to:"./vehicle/"},
      { context: './app/tollbooth/', from: '*', to:"./tollbooth/"}
    ])
  ],
  module: {
    rules: [
      {
       test: /\.css$/,
       use: [ 'style-loader', 'css-loader' ]
      }
    ],
    loaders: [
      { test: /\.json$/, use: 'json-loader' },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      }
    ]
  },
  devServer: {
      contentBase: './build/',
      inline: true,
      host:'0.0.0.0'
  }
}
