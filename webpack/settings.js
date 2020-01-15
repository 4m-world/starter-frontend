require('dotenv').config();

const path = require('path');

module.exports = {
    name: 'project name',
    copyright: 'copyright goes to',
    paths: {
        src: {
            base: './src/',
            js: './src/app/',
            css: './src/css/'
        },
        dist: {
            base: './dist/',
            clean: [
                '**/*'
            ]
        },
        'assets': './public/'
    },
    urls: {
        critical: "http://example.test/",
        publicPath: () => process.env.PUBLIC_PATH || '/dist/'
    },
    vars: {
        cssName: 'styles'
    },
    babelLoaderConfig: {
        exclude: [
            /node_modules/
        ]
    },
    entries: {
        "app": "index.js"
    },
    manifestConfig: {
        basePath: ""
    },
    copyWebpackConfig: [
        {
            from: path.resolve(__dirname, '../src/img'),
            to: path.resolve(__dirname, '../dist/img'),
            toType: 'dir'
        }
    ],
    devServerConfig: {
        public: () => process.env.DEV_SERVER_PUBLIC || 'http://localhost:8080',
        host: () => process.env.DEV_SERVER_HOST || 'localhost',
        poll: () => process.env.DEV_SERVER_POLL || false,
        port: () => process.env.DEV_SERVER_PORT || 8080,
        https: () => process.env.DEV_SERVER_HTTPS || false
    },
    criticalCssConfig: {
        base: './dist/criticalcss/',
        suffix: '_critical.min.css',
        criticalHeight: 1200,
        criticalWidth: 1200,
        ampPrefix: 'amp_',
        ampCriticalHeight: 19200,
        ampCriticalWidth: 600,
        pages: [
            {
                url: '',
                template: 'index'
            }
        ]
    },
    faviconConfig: {
        logo: './src/img/favicon-src.png',
        prefix: 'img/favicons/'
    },
    workboxConfig: {
        swDest: '../sw.js',
        swDest: "../sw.js",
        precacheManifestFilename: "js/precache-manifest.[manifestHash].js",
        importScripts: [
            //           "/dist/workbox-catch-handler.js"
        ],
        exclude: [
            /\.(png|jpe?g|gif|svg|webp)$/i,
            /\.map$/,
            /^manifest.*\\.js(?:on)?$/,
        ],
        globDirectory: "./web/",
        globPatterns: [
            "offline.html",
            "offline.svg"
        ],
        offlineGoogleAnalytics: true,
        runtimeCaching: [
            {
                urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
                handler: "cacheFirst",
                options: {
                    cacheName: "images",
                    expiration: {
                        maxEntries: 20
                    }
                }
            }
        ]
    },
    createSymlinkConfig: [
        {
            origin: 'img/favicons/favicon.ico',
            symlink: '../favicon.ico'
        }
    ],
    saveRemoteFileConfig: [
        {
            url: "https://www.google-analytics.com/analytics.js",
            filepath: "js/analytics.js"
        }
    ]
};
