const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env) => ({
    mode: 'development',
    context: __dirname,
    devtool: "inline-sourcemap",
    entry: './src/js/app.js',
    devServer: {
        host: 'localhost',
        port: 3000,
        hot: true,
        open: true
    },
    output: {
        path: path.join(__dirname, "dist/js"),
        filename: "app.bundle.js",
        publicPath: '/'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'index.html')
        }),
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'development'
        })
    ]
});