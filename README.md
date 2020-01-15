# Starter Frontend

This is a starter github repo for a frontend project with no external pre-configured framework dependency.

## Installation

```
yarn install
```

## Start dev server

```
yarn dev
```

## Build production version

```
yarn build
```

## Features

* ES6 support
* SASS support
* POSTCSS
* Dynamic code splitting
* Hot Module Replacement
* Lazy Loading
* Modern and Legacy JS Bundles
* Cache Busting via manifest.json
* Critical CSS
* Workbox Service Worker
* Image Optimization
* Offline compression of static resource

## Core config files

`.env`: host config settings for `webpack-dev-server':

sample settings:
```
PUBLIC_PATH='/'
DEV_SERVER_PUBLIC='http://localhost:8080'
DEV_SERVER_HOST='localhost'
DEV_SERVER_POLL=0
DEV_SERVER_PORT=8080
DEV_SERVER_HTTPS=0
```

`webpack/settings.js`: project specific setup,

`webpack/common.js`: common settings for different build types

`webpack/dev.js`: settings for local development build

`webpack/prod.js`: setting for production build
