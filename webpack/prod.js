const LEGACY_CONFIG = 'legacy';
const MODERN_CONFIG = 'modern';

const git = require('git-rev-sync');
const glob = require('glob-all');
const merge = require('webpack-merge');
const moment = require('moment');
const path = require('path');
const webpack = require('webpack');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CreateSymlinkPlugin = require('symlink-webpack-plugin');
const CriticalCssPlugin = require('critical-css-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin')
const ImageminWebpWebpackPlugin = require('imagemin-webp-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const PurgecssPlugin = require('purgecss-webpack-plugin')
// const WhitelisterPlugin = require('purgcss-whitelister')
const SaveRemoteFilePlugin = require('save-remote-file-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const zopfli = require('@gfx/zopfli');

const settings = require('./settings');
const common = require('./common');
const pkg = require('../package.json');

const configureBanner = () => {
    return {
        banner: [
            '/*!',
            ' * @project        ' + settings.name,
            ' * @name           ' + '[filebase]',
            ' * @author         ' + pkg.author.name,
            ' * @build          ' + moment().format('llll') + ' ET',
            ' * @release        ' + git.long() + ' [' + git.branch() + ']',
            ' * @copyright      Copyright (c) ' + moment().format('YYYY') + ' ' + settings.copyright,
            ' *',
            ' */',
            ''
        ].join('\n'),
        raw: true
    };
};

const configureBundleAnalyzer = (buildType) => {
    if (buildType === LEGACY_CONFIG) {
        return {
            analyzerMode: 'static',
            reportFilename: 'report-legacy.html'
        };
    }

    if (buildType === MODERN_CONFIG) {
        return {
            analyzerMode: 'static',
            reportFilename: 'report-modern.html'
        };
    }
};

const configureCompression = () => {
    return {
        filename: '[path].gz.[query]',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8,
        deleteOriginalAssets: false,
        compressionOptions: {
            numiterations: 15,
            level: 9
        },
        algorithm(input, compressionOptions, callback) {
            return zopfli.gzip(input, compressionOptions, callback);
        }
    };
};

const configureCriticalCss = () => {
    return (settings.criticalCssConfig.pages.map((row) => {
        const criticalSrc = settings.urls.critical + row.url;
        const criticalDest = settings.criticalCssConfig.base + row.template + settings.criticalCssConfig.suffix;
        let criticalWidth = settings.criticalCssConfig.criticalWidth;
        let criticalHeight = settings.criticalCssConfig.criticalHeight;
        // Handle Google AMP templates
        if (row.template.indexOf(settings.criticalCssConfig.ampPrefix) !== -1) {
            criticalWidth = settings.criticalCssConfig.ampCriticalWidth;
            criticalHeight = settings.criticalCssConfig.ampCriticalHeight;
        }
        console.log("source: " + criticalSrc + " dest: " + criticalDest);
        return new CriticalCssPlugin({
            base: './',
            src: criticalSrc,
            dest: criticalDest,
            extract: false,
            inline: false,
            minify: true,
            width: criticalWidth,
            height: criticalHeight,
        });
    })
    );
};

const configureCleanWebpack = () => {
    return {
        cleanOnceBeforePatterns: settings.paths.dist.clean,
        verbose: true,
        dry: false
    };
};

// const configureHtml = () => {
//     return {
//         templateContent: '',
//         filename: 'index.html',
//         inject: true
//     }
// }

const configureImageLoader = (buildType) => {
    if (buildType === LEGACY_CONFIG) {
        return {
            test: /\.(png|jpe?g|svg|gid|webp)$/i,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: 'img/[name].[hash].[ext]'
                    }
                }
            ]
        };
    }

    if (buildType === MODERN_CONFIG) {
        return {
            test: /\.(png|jpe?g|svg|gid|webp)$/i,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: 'img/[name].[hash].[ext]'
                    }
                },
                {
                    loader: 'img-loader',
                    options: {
                        plugins: [
                            require('imagemin-gifsicle')({
                                interlaced: true,
                            }),
                            require('imagemin-mozjpeg')({
                                progressive: true,
                                arithmetic: false,
                            }),
                            require('imagemin-optipng')({
                                optimizationLevel: 5,
                            }),
                            require('imagemin-svgo')({
                                plugins: [
                                    { convertPathData: false },
                                ]
                            })
                        ]
                    }
                }
            ]
        };
    }
};

const configureOptimization = (buildType) => {
    if (buildType === LEGACY_CONFIG) {
        return {
            splitChunks: {
                cacheGroups: {
                    default: false,
                    common: false,
                    styles: {
                        name: settings.vars.cssName,
                        test: /\.(scss|pcss|css)$/,
                        chunks: 'all',
                        enforce: true
                    }
                }
            },
            minimizer: [
                new TerserPlugin(configureTerser()),
                new OptimizeCssAssetsPlugin({
                    cssProcessorOptions: {
                        map: {
                            inline: false,
                            annotation: true
                        },
                        safe: true,
                        discardComments: true
                    }
                })
            ]
        };
    }

    if (buildType === MODERN_CONFIG) {
        return {
            minimizer: [
                new TerserPlugin(configureTerser())
            ]
        };
    }
};

const configureStyleLoader = (buildType) => {
    if (buildType === LEGACY_CONFIG) {
        return {
            test: /\.(scss|pcss|css)$/,
            use: [
                MiniCssExtractPlugin.loader,
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
                    loader: 'sass-loader'
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

    if (buildType === MODERN_CONFIG) {
        return {
            test: /\.(scss|pcss|css)$/,
            loader: 'ignore-loader'
        };
    }
};

const configureTerser = () => {
    return {
        cache: true,
        parallel: true,
        sourceMap: true
    };
};

const configureFavicon = () => {
    return {
        logo: path.resolve(__dirname, '../' + settings.faviconConfig.logo),
        prefix: settings.faviconConfig.prefix,
        cache: false,
        inject: true,
        favicons: {
            appName: pkg.name,
            appDescription: pkg.description,
            developerName: pkg.author.name,
            developerURL: pkg.author.url,
            path: settings.paths.dist.base
        }
    };
};
const configureWorkbox = () => {
    return { ...settings.workboxConfig };
};

module.exports = [
    merge(
        common.legacyConfig,
        {
            mode: 'production',
            output: {
                filename: path.join('./js', '[name]-legacy.[chunkhash].js')
            },
            devtool: 'source-map',
            optimization: configureOptimization(LEGACY_CONFIG),
            module: {
                rules: [
                    configureStyleLoader(LEGACY_CONFIG),
                    configureImageLoader(LEGACY_CONFIG)
                ]
            },
            plugins: [
                new MiniCssExtractPlugin({
                    path: path.resolve(__dirname, '../' + settings.paths.dist.base),
                    filename: path.join('./css', '[name].[chunkhash].css')
                }),
                new webpack.BannerPlugin(configureBanner()),
                // new HtmlWebpackPlugin(configureHtml()),
                new FaviconsWebpackPlugin(configureFavicon()),
                // Todo: recheck the issue of process on powershell disabled accounts
                // new CreateSymlinkPlugin(
                //     settings.createSymlinkConfig,
                //     true
                // ),
                new SaveRemoteFilePlugin(
                    settings.saveRemoteFileConfig
                ),
                new CompressionPlugin(
                    configureCompression()
                ),
                new BundleAnalyzerPlugin(
                    configureBundleAnalyzer(LEGACY_CONFIG)
                )
            ].concat(configureCriticalCss())
        }
    ),
    merge(
        common.modernConfig,
        {
            mode: 'production',
            output: {
                filename: path.join('./js', '[name].[chunkhash].js')
            },
            devtool: 'source-map',
            optimization: configureOptimization(MODERN_CONFIG),
            module: {
                rules: [
                    configureStyleLoader(MODERN_CONFIG),
                    configureImageLoader(MODERN_CONFIG)
                ]
            },
            plugins: [
                new CleanWebpackPlugin(configureCleanWebpack()),
                new webpack.BannerPlugin(configureBanner()),
                new ImageminWebpWebpackPlugin(),
                new WorkboxPlugin.GenerateSW(configureWorkbox()),
                new CompressionPlugin(configureCompression()),
                new BundleAnalyzerPlugin(configureBundleAnalyzer(MODERN_CONFIG))
            ]
        }

    )
];