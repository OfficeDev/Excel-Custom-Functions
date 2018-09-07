const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist/win32/ship'),
    filename: 'index.win32.bundle'
  },    
  resolve: {
    extensions: ['.ts', '.tsx', '.html', '.js', 'json']
},
devtool: 'source-map',    
module: {
    rules: [
        {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: 'ts-loader'
        },
        {
            test: /\.html$/,
            exclude: /node_modules/,
            use: 'html-loader'
        },
        {
            test: /\.(png|jpg|jpeg|gif)$/,
            use: 'file-loader'
        }
    ]
},
plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      title: 'Hot Module Replacement'
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
devServer: {
    port: 8081,
    hotOnly: true,
    inline: true,
    headers: {
        "Access-Control-Allow-Origin": "*"
    }
}
};