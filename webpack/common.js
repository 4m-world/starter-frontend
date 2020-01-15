// const LEGACY_CONFIG = 'legacy'
// const MODERN_CONFIG = 'modern'

const path = require('path');
const merge = require('webpack-merge');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const pkg = require('../package.json');
const settings = require('./settings');

const configureBabeLoader = (browserList) => {
    return {
        test: /\.js$/,
        exclude: settings.babelLoaderConfig.exclude,
        use: {
            loader: 'babel-loader',
            options: {
                cacheDirectory: true,
                presets: [
                    [
                        '@babel/preset-env', {
                            modules: false,
                            corejs: {
                                version: 3,
                                proposals: true
                            },
                            useBuiltIns: 'usage',
                            targets: {
                                browsers: browserList
                            }
                        }
                    ]
                ],
                plugins: [
                    '@babel/plugin-syntax-dynamic-import',
                    '@babel/plugin-transform-runtime'
                ]
            }
        }
    };
};

const configureEntries = () => {
    let entries = {};
    for (const [key, value] of Object.entries(settings.entries)) {
        entries[key] = path.resolve(__dirname, '../', settings.paths.src.js + value);
    }

    return entries;
};

const configureHtml = () => {
    return {
        template:  path.resolve(__dirname, `../${settings.paths.src.base}/index.html`),
        filename: 'index.html',
        inject: true
    };
};

const configureManifest = (fileName) => {
    return {
        fileName,
        basePath: settings.manifestConfig.basePath,
        map: (file) => {
            file.name = file.name.replace(/(\.[a-f0-9]{32})(\..*)$/, '$2');
            return file;
        }
    };
};

configureFontLoader = () => {
    return {
        test: /\.(ttf|eot|woff2?)$/i,
        use: [
            {
                loader: 'file-loader',
                options: {
                    name: 'fonts/[name].[ext]'
                }
            }
        ]
    };
};

const baseConfig = {
    name: pkg.name,
    entry: configureEntries(),
    output: {
        path: path.resolve(__dirname, '../', settings.paths.dist.base),
        publicPath: settings.urls.publicPath()
    },
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            '~': path.resolve(__dirname, '../' + settings.paths.src.base)
        }
    },
    module: {
        rules: [
            configureFontLoader()
        ]
    },
    plugins: [
        new WebpackNotifierPlugin({title: 'Webpack', excludeWarnings: true, alwaysNotify : true})
    ]
};

const legacyConfig = {
    module: {
        rules: [
            configureBabeLoader(Object.values(pkg.browserslist.legacyBrowsers))
        ]
    },
    plugins: [
        new CopyWebpackPlugin(
            settings.copyWebpackConfig
        ),
        new HtmlWebpackPlugin(configureHtml()),
        new ManifestPlugin(configureManifest('manifest-legacy.json'))
    ]
};

const modernConfig = {
    module: {
        rules: [
            configureBabeLoader(Object.values(pkg.browserslist.modernBrowsers))
        ]
    },
    plugins: [
        new ManifestPlugin(
            configureManifest('manifest.json')
        )
    ]
};

module.exports = {
    'legacyConfig': merge.strategy({
        module: 'prepend',
        plugins: 'prepend'
    })(
        baseConfig,
        legacyConfig
    ),
    'modernConfig': merge.strategy({
        module: 'prepend',
        plugins: 'prepend'
    })(
        baseConfig,
        modernConfig
    )
};