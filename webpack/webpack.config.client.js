import path from 'path';
import webpack from 'webpack';
import qs from 'querystring';

import autoprefixer from 'autoprefixer';
import AssetsPlugin from 'assets-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';


const root = process.cwd();
const src  = path.join(root, 'src');
const build = path.join(root, 'build');

const clientSrc    = path.join(src, 'client');
const universalSrc = path.join(src, 'universal');

const clientInclude = [clientSrc, universalSrc];

// Cache vendor && client javascript on CDN...
const vendor = [
  'react',
  'react-dom',
  'react-router',
  'react-redux',
  'redux'
];

export default {
  context: src,
  entry: {
    app: [
      'babel-polyfill/dist/polyfill.js',
      './client/client.js'
    ],
    vendor
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    path: build,
    publicPath: '/static/'
  },
  resolve: {
    extensions: ['.js'],
    modules: [src, 'node_modules'],
    unsafeCache: true
  },
  node: {
    dns: 'mock',
    net: 'mock'
  },
  plugins: [
   new webpack.NamedModulesPlugin(),
   new ExtractTextPlugin('[name].css'),
   new webpack.NormalModuleReplacementPlugin(/\.\.\/routes\/static/, '../routes/async'),
   new webpack.optimize.CommonsChunkPlugin({
     names: ['vendor', 'manifest'],
     minChunks: Infinity
   }),
   new webpack.optimize.AggressiveMergingPlugin(),
   /* minChunkSize should be 50000 for production apps
    * 10 is for this example */
   new webpack.optimize.MinChunkSizePlugin({minChunkSize: 10}),
   new webpack.optimize.UglifyJsPlugin({compressor: {warnings: false}, comments: /(?:)/}),
   new AssetsPlugin({path: build, filename: 'assets.json'}),
   new webpack.NoEmitOnErrorsPlugin(),
   new webpack.DefinePlugin({
     '__CLIENT__': true,
     '__PRODUCTION__': true,
     'process.env.NODE_ENV': JSON.stringify('production')
   })
 ],
 module: {
   loaders: [
     {test: /\.(png|j|jpeg|gif|svg|woff|woff2)$/,
       use: {
         loader: 'url-loader',
         options: {
           limit: 10000
         }
       }
     },

     // JavaScript
     {test: /^(?!.*\.spec\.js$).*\.js$/,
       loader: 'babel-loader',
       include: clientInclude
     },

     {
       test: /\.scss$/,
       include: clientInclude,
       use: ExtractTextPlugin.extract({
         fallback: "style-loader",
         use: [
           {
             loader: 'css-loader'
           },
           'postcss-loader',
           'sass-loader'
         ]
       }),
     },

   ]
 }
};
