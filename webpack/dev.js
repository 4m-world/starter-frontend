const LEGACY_CONFIG = 'legacy';
const MODERN_CONFIG = 'modern';

const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const Dashboard = require('webpack-dashboard');
// const DashboardPlugin = require('webpack-dashboard/plugin');
// const dashboard = new Dashboard();

const settings = require('./settings');
const common = require('./common');
// const pkg = require('../package.json')

const configureLinting = () => {
    return {
        test: /\.js$/,
        include: path.resolve(__dirname, '../' + settings.paths.src.base),
        enforce: 'pre',
        loader: 'eslint-loader',
        options: {
            emitWarning: true
        }
    };
};

const configureDevServer = () => {
    return {
        public: settings.devServerConfig.public(),
        contentBase: path.resolve(__dirname, '../' + settings.paths.assets),
        host: settings.devServerConfig.host(),
        port: settings.devServerConfig.port(),
        https: !!parseInt(settings.devServerConfig.https()),
        disableHostCheck: true,
        hot: true,
        overlay: true,
        inline: true,
        open: true,
        quiet: true,
        watchContentBase: true,
        watchOptions: {
            poll: !!parseInt(settings.devServerConfig.poll()),
            ignored: /node_modules/
        },
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    };
};

const configureImageLoader = (buildType) => {
    return {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        use: [
            {
                loader: 'file-loader',
                options: {
                    name: 'img/[name].[hash].[ext]'
                }
            }
        ]
    };
};

const configureStyleLoader = (buildType) => {
    if (buildType == LEGACY_CONFIG) {
        return {
            test: /\.(scss|pcss|css)$/,
            loader: 'ignore-loader'
        };
    }

    if (buildType == MODERN_CONFIG) {
        return {
            test: /\.(scss|pcss|css)$/,
            use: [
                {
                    loader: 'style-loader'
                },
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 2,
                        sourceMap: true
                    }
                },
                {
                    loader: 'resolve-url-loader'
                },
                {
                    loader: 'sass-loader',
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        sourceMap: true
                    }
                }
            ]
        };
    }
};

module.exports = [
    merge(
        common.legacyConfig,
        {
            output: {
                filename: path.join('./js', '[name]-legacy.[hash].js'),
                publicPath: settings.devServerConfig.public() + '/'
            },
            mode: 'development',
            devtool: 'inline-source-map',
            devServer: configureDevServer(),
            module: {
                rules: [
                    configureStyleLoader(LEGACY_CONFIG),
                    configureImageLoader(LEGACY_CONFIG)
                ]
            },
            plugins: [
                new webpack.HotModuleReplacementPlugin()
            ]
        }
    ),
    merge(
        common.modernConfig,
        {
            output: {
                filename: path.join('./js', '[name].[hash].js'),
                publicPath: settings.devServerConfig.public() + '/'
            },
            mode: 'development',
            devtool: 'inline-source-map',
            devServer: configureDevServer(),
            module: {
                rules: [
                    configureLinting(),
                    configureStyleLoader(MODERN_CONFIG),
                    configureImageLoader(MODERN_CONFIG)
                ]
            },
            plugins: [
                new webpack.HotModuleReplacementPlugin(),
                // Todo: review how to integrate dashboard plugin as it has bug running with current set of plugins
                // new DashboardPlugin({ port: 3001, })
            ]
        }
    )
];