'use strict';

const phantom = require('phantom');
const async = require('async');
const URL = 'http://www.freeproxylists.net/';
const JQUERY_URL = 'https://code.jquery.com/jquery-2.1.4.min.js';

module.exports = {

    /**
     * Retrieve the current pagination max number.
     *
     * @param {Function} callback
     * @returns {Number}
     */
    getPages: (options, callback) => {
        if (!options) {
            options = {};
        }

        if (options instanceof Function) {
            callback = options;
            options = {};
        }

        async.waterfall([
            (cb) => {
                phantom.create(ph => cb(null, ph) );
            },

            (ph, cb) => {
                ph.createPage(page => cb(null, ph, page) );
            },

            (ph, page, cb) => {
                if (!options.proxy) {
                    return cb(null, ph, page);
                }

                ph.set('proxy', options.proxy, () => {
                    cb(null, ph, page);
                });
            },

            (ph, page, cb) => {
                page.open(URL, status => {
                    if (status !== 'success') {
                        return cb(new Error(`Error opening page for ${URL}`), null, ph);
                    }
                    cb(null, ph, page);
                });
            },

            (ph, page, cb) => {
                page.includeJs(JQUERY_URL, () => cb(null, ph, page) );
            },

            (ph, page, cb) => {
                page.evaluate(
                    /* It runs on the virtual browser, so we cant use ES6 */
                    function () {
                        var paginationDiv = $('div.page').first(),
                            pages = $('a:not(:contains("Next"))', paginationDiv).last().text();

                        return pages ? parseInt(pages) : 1;
                    }
                    /* XXX */
                    , pages => {
                        cb(null, pages, ph);
                    }
                );
            }
        ], (err, pages, ph) => {
            ph.exit();

            if (err) {
                return callback(err);
            }
            callback(null, pages);
        });
    },

    /**
     * Crawl www.freeproxylists.net and retrieve a list of proxy servers.
     *
     * @param {Object} options {page, proxy}
     * @param {Function} callback function (gateways) {}
     * @returns Object[]
     *          hostname
     *          port
     *          protocol
     *          anonymity
     *          country
     *          region
     *          city
     *          uptime
     */
    crawl: (options, callback) => {
        if (!options) {
            options = {};
        }

        if (options instanceof Function) {
            callback = options;
            options = {};
        }

        const PAGE_URL = options.page ? `${URL}?page=${options.page}` : URL;

        async.waterfall([
            (cb) => {
                phantom.create(ph => cb(null, ph) );
            },

            (ph, cb) => {
                ph.createPage(page => cb(null, ph, page) );
            },

            (ph, page, cb) => {
                if (!options.proxy) {
                    return cb(null, ph, page);
                }

                ph.set('proxy', options.proxy, () => {
                    cb(null, ph, page);
                });
            },

            (ph, page, cb) => {
                page.open(URL, status => {
                    if (status !== 'success') {
                        return cb(new Error(`Error opening page for ${URL}`, null, ph));
                    }
                    cb(null, ph, page);
                });
            },

            (ph, page, cb) => {
                async.waterfall([
                    cb => {
                        page.evaluate(function () {
                            var el = document.querySelector('body');
                            return (el.innerText.indexOf('403 Forbidden') > -1);
                        }, isForbidden => {
                            if (isForbidden) {
                                return cb(new Error('Your ip is blacklisted for freeproxylists.net'), null);
                            }
                            cb();
                        });
                    },

                    cb => {
                        async.waterfall([
                            cb => {
                                page.includeJs(JQUERY_URL, () => cb());
                            },

                            cb => {
                                page.evaluate(
                                    /* It runs on the virtual browser, so we cant use ES6 */
                                    function () {
                                        var gtws = [];
                                        var table = $('table.DataGrid tbody');
                                        if (table) {

                                            var rows = table.find('tr.Odd, tr.Even');
                                            rows.each(function (index, tr) {

                                                var gateway = {};
                                                var cols = $(tr).find('td');
                                                cols.each(function (index, col) {

                                                    col = $(col);
                                                    switch (col.index()) {
                                                        case 0:
                                                            gateway.hostname = col[0].innerText.trim();
                                                            break;
                                                        case 1:
                                                            gateway.port = col[0].innerText.trim();
                                                            break;
                                                        case 2:
                                                            gateway.protocol = col[0].innerText.trim().toLowerCase();
                                                            break;
                                                        case 3:
                                                            gateway.anonymity = col[0].innerText.trim();
                                                            break;
                                                        case 4:
                                                            gateway.country = col[0].innerText.trim();
                                                            break;
                                                        case 5:
                                                            gateway.region = col[0].innerText.trim();
                                                            break;
                                                        case 6:
                                                            gateway.city = col[0].innerText.trim();
                                                            break;
                                                        case 7:
                                                            gateway.uptime = col[0].innerText.trim();
                                                            break;
                                                    }

                                                    gateway.provider = 'FreeProxyLists';
                                                    gtws.push(gateway);
                                                });
                                            });
                                        }

                                        return gtws;
                                    }
                                    /* XXX */
                                    , gateways => {
                                        gateways = gateways
                                            .filter(n => {
                                                return !!n
                                                    && !!n.hostname
                                                    && !!n.port
                                                    && !!n.protocol;
                                            });

                                        cb(null, gateways);
                                    }
                                );
                            }
                        ], cb);
                    }
                ], (err, gateways) => {
                    ph.exit();

                    if (err) {
                        return callback(err);
                    }
                    callback(null, gateways, ph);
                });
            }
        ]);
    }
};
