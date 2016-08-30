import test from 'ava';
import FreeProxyLists from './index';

test('get pagination number', t => {
    return FreeProxyLists.getPages().then(pages => {
        t.is(typeof pages, 'number', 'Pages from getPages must be a number');
    });
});

test('crawl the proxy list from FreeProxyLists', t => {
    return FreeProxyLists.crawl().then(gateways => {
        t.true((gateways instanceof Array), 'Return should be an array');
    });
});

test('crawl the proxy list from FreeProxyLists passing a specific page number', t => {
    return FreeProxyLists.getPages().then(pages => {
        t.is(typeof pages, 'number', 'GetPages return type should be a number');

        return FreeProxyLists.crawl({page: pages}).then(gateways => {
            t.true((gateways instanceof Array), 'Crawl return type should be an array');
        });
    });
});
