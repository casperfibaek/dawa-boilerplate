const path = require('path');
const webpack = require('webpack');                               // eslint-disable-line
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');        // eslint-disable-line
const CleanWebpackPlugin = require('clean-webpack-plugin');       // eslint-disable-line
const CompressionPlugin = require("compression-webpack-plugin");  // eslint-disable-line
const ExtractTextPlugin = require("extract-text-webpack-plugin"); // eslint-disable-line
const HtmlWebpackPlugin = require('html-webpack-plugin');         // eslint-disable-line

module.exports = {
    entry: [
        './dev/index.js',
    ],
    output: {
        filename: 'dawa.min.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                include: path.resolve(__dirname, 'src'),
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{
                        loader: 'css-loader',
                        options: {
                            minimize: false,
                        },
                    }],
                }),
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                include: path.resolve(__dirname, 'src'),
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            useRelativePath: true,
                            name: '[name].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src'),
                loader: 'babel-loader',
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new webpack.optimize.AggressiveMergingPlugin(),
        new ExtractTextPlugin('dawa.css'),
        new UglifyJSPlugin({
            sourceMap: true,
            exclude: [/\.min\.js$/gi],
        }),
        new CompressionPlugin({
            test: /\.(js|css)$/,
            include: path.resolve(__dirname, 'src'),
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'dev/index.html'),
            favicon: path.join(__dirname, 'dev/favicon.ico'),
            xhtml: true,
        }),
    ],
};
