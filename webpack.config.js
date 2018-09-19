const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/customfunctions.ts',
    output: {
        path: path.resolve(__dirname, 'dist/win32/ship'),
        filename: 'index.win32.bundle'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.html', '.js', 'json']
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
    devServer: {
        port: 8081,
        proxy: {
            '/socket.io': {
                target: 'http://localhost:8081',
                ws: true
            }
        },
        hot: true,
        inline: true,
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    }
};