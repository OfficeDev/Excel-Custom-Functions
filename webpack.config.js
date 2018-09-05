const path = require('path');

module.exports = {
  entry: './src/index.ts',
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
    hot: true,
    inline: true,
    headers: {
        "Access-Control-Allow-Origin": "*"
    }
}
};