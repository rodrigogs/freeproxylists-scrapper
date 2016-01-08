# FreeProxyLists Scrapper

[![Build Status](https://travis-ci.org/rodrigogs/freeproxylists-scrapper.svg?branch=master)](https://travis-ci.org/rodrigogs/freeproxylists-scrapper)
[![npm version](https://badge.fury.io/js/freeproxylists-scrapper.svg)](https://badge.fury.io/js/freeproxylists-scrapper)
[![npm](https://img.shields.io/npm/dt/freeproxylists-scrapper.svg)](https://www.npmjs.com/package/freeproxylists-scrapper)

Page scrapper that retrieves proxy server information from FreeProxyLists website.

Make sure phantomjs is installed!

> npm install freeproxylists-scrapper

```javascript
var FreeProxyLists = require('freeproxylists-scrapper');

FreeProxyLists.getPages(function (err, pages) {
    if (err) {
        return console.log('Dammit!');
    }
    FreeProxyLists.crawl(pages, function (err, proxylist) {
        if (err) {
            return console.log('Dammit!');
        }
        for (proxy in proxylist) {
            // You have a proxy here
        }
    });
});
```

## License

[Licence](https://github.com/rodrigogs/freeproxylists-scrapper/blob/master/LICENSE) © Rodrigo Gomes da Silva
# FreeProxyLists Scrapper

[![Build Status](https://travis-ci.org/rodrigogs/freeproxylists-scrapper.svg?branch=master)](https://travis-ci.org/rodrigogs/freeproxylists-scrapper)
[![npm version](https://badge.fury.io/js/freeproxylists-scrapper.svg)](https://badge.fury.io/js/freeproxylists-scrapper)
[![npm](https://img.shields.io/npm/dt/freeproxylists-scrapper.svg)](https://www.npmjs.com/package/freeproxylists-scrapper)

Page scrapper that retrieves proxy server information from FreeProxyLists website.

Make sure phantomjs is installed!

> npm install freeproxylists-scrapper

```javascript
var FreeProxyLists = require('freeproxylists-scrapper');

FreeProxyLists.getPages(function (err, pages) {
    if (err) {
        return console.log('Dammit!');
    }
    FreeProxyLists.crawl(pages, function (err, proxylist) {
        if (err) {
            return console.log('Dammit!');
        }
        for (proxy in proxylist) {
            // You have a proxy here
        }
    });
});
```

## License

[Licence](https://github.com/rodrigogs/freeproxylists-scrapper/blob/master/LICENSE) © Rodrigo Gomes da Silva
