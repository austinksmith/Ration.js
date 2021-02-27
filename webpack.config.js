const path = require('path');
const webpack = require('webpack');

const optimizingPlugins = [
  new webpack.optimize.OccurrenceOrderPlugin,
  new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true
  }),
];

const node = {
  target: 'node',
  devtool: 'sourcemap',
  context: path.resolve(__dirname, 'src'),
  entry: [
    './ration'
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'ration.node.min.js',
    library: 'ration',
    libraryTarget: 'commonjs2'
  },
  plugins: optimizingPlugins,
  module: {
    loaders: [
      {
        test: [/\.js?$/],
        exclude: path.resolve(__dirname, 'node_modules'),
        loader: 'babel',
        query: {
          presets: ['es2015'],
        }
      }
    ]
  }
};

module.exports = [
  node
];