'use strict';

const phantom = require('phantom');
const URL = 'http://www.freeproxylists.net/';
const JQUERY_URL = 'https://code.jquery.com/jquery-2.1.4.min.js';

module.exports = {

    /**
     * Retrieve the current pagination max number.
     * 
     * @param {Function} callback
     * @returns {Number}
     */
    getPages: (callback) => {
        phantom.create(ph => {
            ph.createPage(page => {
                page.open(URL, status => {

                    page.includeJs(JQUERY_URL, () => {
                        page.evaluate(
                            /* It runs on the virtual browser, so we cant use ES6 */
                            function () {
                                var paginationDiv = $('div.page').first(),
                                    pages = $('a:not(:contains("Next"))', paginationDiv).last().text();

                                return pages ? parseInt(pages) : 1;
                            }
                            /* XXX */
                            , pages => {
                                callback(pages);
                                ph.exit();
                            }
                        );
                    });
                });
            });
        });
    },

    /**
     * Crawl www.freeproxylists.net and retrieve a list of proxy servers.
     * 
     * @param {Number} page Page number
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
    crawl: (page, callback) => {
        if (page instanceof Function) {
            callback = page;
            page = null;
        }

        const PAGE_URL = page ? `${URL}?page=${page}` : URL;

        phantom.create(ph => {
            ph.createPage(page => {
                page.open(URL, status => {
                    console.log(`Opened page ${URL} with ${status}`);

                    page.evaluate(function () {
                        var el = document.querySelector('body');
                        return (el.innerText.indexOf('403 Forbidden') > -1);
                    }, isForbidden => {
                        if (isForbidden) {
                            console.log('This ip is blacklisted for freeproxylists.net');
                            callback([]);
                            return ph.exit();
                        }
                    });

                    page.includeJs(JQUERY_URL, () => {
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

                                callback(gateways);
                                ph.exit();
                            }
                        );
                    });
                });
            });
        });
    }
};
