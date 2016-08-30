'use strict';

const phantom = require('phantom');
const async = require('async');
const validator = require('validator');
const Promise = require('bluebird');

const URL = 'http://www.freeproxylists.net/';
const JQUERY_URL = 'https://code.jquery.com/jquery-2.1.4.min.js';

/**
 * Loads a new page.
 *
 * @param {Object} options
 * @returns {Promise}
 */
function _loadPage(options) {
    options = options || {};

    return new Promise((resolve, reject) => {
        let instance,
            page;

        phantom.create(['--ignore-ssl-errors=yes', '--load-images=no', '--cookies-file=cookies.txt'])
            .then(ph => {
                instance = ph;
                return instance.createPage();
            })
            .then(createdPage => {
                page = createdPage;
                if (options.proxy) {
                    return page.setProxy(options.proxy);
                } else {
                    return Promise.resolve();
                }
            })
            .then(() => page.open(options.url || URL))
            .then(status => {
                if (status !== 'success') {
                    throw new Error(`Error opening page for ${URL}`, null, ph);
                }
                return page.includeJs(JQUERY_URL);
            })
            .then(() => {
                let ret = {instance: instance, page: page};
                ret.exit = () => ret.instance.exit();
                return Promise.resolve(ret);
            })
            .then(_verifyDisponibility)
            .then(resolve)
            .catch(err => {
                instance.exit();
                reject(err);
            });
    });
}

/**
 *
 * @param loaded
 */
function _verifyDisponibility(loaded) {
    return new Promise((resolve, reject) => {
        loaded.page.evaluate(function () {
            var el = $('body');
            if (el.html().indexOf('403 Forbidden') > -1) {
                return 'forbidden';
            }
            if (el.html().indexOf('recaptcha_challenge_field') > -1) {
                return 'captcha';
            }
        }).then(status => {
            if (status === 'forbidden') {
                throw new Error('Your ip is blacklisted for freeproxylists.net');
            }
            if (status === 'captcha') {
                throw new Error('Captcha detected!');
            }
            resolve(loaded);
        }).catch(reject);
    });
}

/**
 * Retrieve the current pagination max number.
 *
 * @param {Object} options
 * @param {function} callback
 * @returns {Promise}
 */
function _getPages(options, callback) {
    options = options || {};

    if (options instanceof Function) {
        callback = options;
        options = {};
    }

    return new Promise((resolve, reject) => {
        _loadPage(options).then(loaded => {
            loaded.page.evaluate(function () {
                var paginationDiv = $('div.page').first(),
                    pages = $('a:not(:contains("Next"))', paginationDiv).last().text();

                try {
                    pages = parseInt(pages);
                } catch (ex) {
                    pages = 1;
                }

                return pages;
            }).then(pages => {
                loaded.exit();
                if (callback) {
                    callback(null, pages);
                }
                resolve(pages);
            });

        }).catch(err => {
            if (callback) {
                return callback(err);
            }
            reject(err);
        });
    });
}

/**
 * Crawl www.freeproxylists.net and retrieve a list of proxy servers.
 *
 * @param {Object} options
 * @param {function} callback
 * @returns {Promise} Object[]
 *          hostname
 *          port
 *          protocol
 *          anonymity
 *          country
 *          region
 *          city
 *          uptime
 */
function _crawl(options, callback) {
    options = options || {};

    if (options instanceof Function) {
        callback = options;
        options = {};
    }

    options.url = options.page ? `${URL}?page=${options.page}` : URL;

    return new Promise((resolve, reject) => {
        _loadPage(options).then(loaded => {
            loaded.page.evaluate(function () {
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
                        });

                        gtws.push(gateway);
                    });
                }

                return gtws;
            }).then(gateways => {
                gateways = (gateways || [])
                    .filter(n => {
                        return n
                            && n.hostname
                            && validator.isIP(n.hostname)
                            && n.port
                            && n.protocol;
                    });

                loaded.exit();
                if (callback) {
                    callback(null, gateways);
                }
                resolve(gateways);
            });

        }).catch(err => {
            if (callback) {
                return callback(err);
            }
            reject(err);
        });
    });
}

/**
 * @module FreeProxyListsProvider
 */
module.exports = {
    getPages: _getPages,
    crawl: _crawl
};
