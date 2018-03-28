const path = require('path');
const webpack = require('webpack');     // eslint-disable-line
const HtmlWebpackPlugin = require('html-webpack-plugin'); // eslint-disable-line
const CopyWebpackPlugin = require('copy-webpack-plugin'); // eslint-disable-line

module.exports = {
    entry: [
        './dev/index.js',
    ],
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        hot: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                include: path.resolve(__dirname, 'src'),
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                include: path.resolve(__dirname, 'src'),
                use: [{
                    loader: 'file-loader',
                    options: {},
                }],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'dev/index.html'),
            favicon: path.join(__dirname, 'dev/favicon.ico'),
            xhtml: true,
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
};
