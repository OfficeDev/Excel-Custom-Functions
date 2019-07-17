const devCerts = require("office-addin-dev-certs");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CustomFunctionsMetadataPlugin = require("custom-functions-metadata-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require('path');
const webpack = require("webpack");

module.exports = async (env, options) => {
    const dev = options.mode === "development";
    const config = {
        devtool: "source-map",
        entry: {
            commands: path.resolve(__dirname, './../src/commands/commands.ts'),
            functions: path.resolve(__dirname, './../src/functions/functions.ts'),
            polyfill: "@babel/polyfill",
            taskpane: path.resolve(__dirname, './src/test-taskpane.ts'),
        },
        resolve: {
            extensions: [".ts", ".tsx", ".html", ".js"]
        },
        node: {
            child_process: 'empty'
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: "babel-loader"
                },  
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: "ts-loader"
                },
                {
                    test: /\.html$/,
                    exclude: /node_modules/,
                    use: "html-loader"
                },
                {
                    test: /\.(png|jpg|jpeg|gif)$/,
                    use: "file-loader"
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: dev ? [] : ["**/*"]
            }),
            new CustomFunctionsMetadataPlugin({
                output: "functions.json",
                input: path.resolve(__dirname, './../src/functions/functions.ts')
            }),
            new HtmlWebpackPlugin({
                filename: "functions.html",
                template: path.resolve(__dirname, './../src/functions/functions.html'),
                chunks: ["polyfill", "functions"]
            }),
            new HtmlWebpackPlugin({
                filename: "taskpane.html",
                template: path.resolve(__dirname, './src/test-taskpane.html'),
                chunks: ["polyfill", "taskpane"]
            }),
            new CopyWebpackPlugin([
                {
                    to: "taskpane.css",
                    from: path.resolve(__dirname, './../src/taskpane/taskpane.css')
                }
            ]),
            new HtmlWebpackPlugin({
                filename: "commands.html",
                template: path.resolve(__dirname, './src/test-commands.html'),
                chunks: ["polyfill", "commands"]
            }),
        ],
        devServer: {
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            https: (options.https !== undefined) ? options.https : await devCerts.getHttpsServerOptions(),
            port: process.env.npm_package_config_dev_server_port || 3000
        }
    };

    return config;
};
