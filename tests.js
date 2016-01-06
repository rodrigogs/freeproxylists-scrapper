import test from 'ava';
import FreeProxyLists from './index';

test.cb('get pagination number', t => {
    t.plan(1);
    FreeProxyLists.getPages(pages => {
        t.is(typeof pages, 'number');
        t.end();
    });
});

test.cb('crawl the proxy list from FreeProxyLists', t => {
    t.plan(1);
    FreeProxyLists.crawl(gateways => {
        t.true((gateways instanceof Array), 'Return should be an array');
        t.end();
    });
});

test.cb('crawl the proxy list from FreeProxyLists passing a specific page number', t => {
    t.plan(2);
    FreeProxyLists.getPages(pages => {
        t.is(typeof pages, 'number', 'GetPages return type should be a number');

        FreeProxyLists.crawl(pages, gateways => {
            t.true((gateways instanceof Array), 'Crawl return type should be an array');
            t.end();
        });
    });
});