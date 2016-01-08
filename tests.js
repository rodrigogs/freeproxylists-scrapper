import test from 'ava';
import FreeProxyLists from './index';

test.cb('get pagination number', t => {
    t.plan(2);
    FreeProxyLists.getPages((err, pages) => {
        t.ifError(err, 'Unexpected error getting pagination');
        t.is(typeof pages, 'number', 'Pages from getPages must be a number');
        t.end();
    });
});

test.cb('crawl the proxy list from FreeProxyLists', t => {
    t.plan(2);
    FreeProxyLists.crawl((err, gateways) => {
        t.ifError(err, 'Unexpected error crawling page');
        t.true((gateways instanceof Array), 'Return should be an array');
        t.end();
    });
});

test.cb('crawl the proxy list from FreeProxyLists passing a specific page number', t => {
    t.plan(4);
    FreeProxyLists.getPages((err, pages) => {
        t.ifError(err, 'Unexpected error getting pagination');
        t.is(typeof pages, 'number', 'GetPages return type should be a number');

        FreeProxyLists.crawl(pages, (err, gateways) => {
            t.ifError(err, 'Unexpected error crawling page');
            t.true((gateways instanceof Array), 'Crawl return type should be an array');
            t.end();
        });
    });
});