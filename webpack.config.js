var webpack = require('webpack');

module.exports = {
   // entry: '../script/index.js',
   output: {
      // path: __dirname,
      filename: '[name].js'
   },
   plugins: [],
   module: {
      loaders: [
         { test: /\.css$/, loader: 'style!css' },
         { test: /\.js$/, loader: 'babel', query:{ presets: ['react', 'es2015']} }
      ]
   }
};