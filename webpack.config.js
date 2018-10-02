const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/customfunctions.ts',
    output: {
        path: path.resolve(__dirname, 'dist/win32/ship'),
        filename: 'index.win32.bundle.js'
    },    
    resolve: {
        extensions: ['.ts', '.tsx', '.html', '.js', 'json', '.bundle']
    },
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
    devtool: "source-map",
    devServer: {
        port: 8080,
        hot: true,
        inline: true,
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    }    
};