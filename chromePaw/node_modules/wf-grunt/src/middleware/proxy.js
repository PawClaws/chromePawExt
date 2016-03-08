/*
 * Copyright 2014 WebFilings, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Originally lifted from Karma; since modified:
// https://github.com/karma-runner/karma/blob/master/lib/middleware/proxy.js
// https://github.com/karma-runner/karma/blob/master/LICENSE

'use strict';

var url = require('url');
var httpProxy = require('http-proxy');

var parseProxyConfig = function(proxies) {
    var proxyConfig = {};
    var endsWithSlash = function(str) {
        return str.substr(-1) === '/';
    };

    if (!proxies) {
        return proxyConfig;
    }

    Object.keys(proxies).forEach(function(proxyPath) {
        var proxyUrl = proxies[proxyPath];
        var proxyDetails = url.parse(proxyUrl);
        var pathname = proxyDetails.pathname;

        // normalize the proxies config
        if (endsWithSlash(proxyPath) && !endsWithSlash(proxyUrl)) {
            proxyUrl += '/';
        }

        if (!endsWithSlash(proxyPath) && endsWithSlash(proxyUrl)) {
            proxyPath += '/';
        }

        if (pathname === '/'  && !endsWithSlash(proxyUrl)) {
            pathname = '';
        }

        proxyConfig[proxyPath] = {
            host: proxyDetails.hostname,
            port: proxyDetails.port,
            baseProxyUrl: pathname,
            https: proxyDetails.protocol === 'https:'
        };

        // If there's a host bu no port, use HTTP/HTTPS defaults.
        if (proxyConfig.host && !proxyConfig[proxyPath].port) {
            proxyConfig[proxyPath].port = proxyConfig[proxyPath].https ? '443' : '80';
        }
    });

    return proxyConfig;
};

// Returns a handler which understands the proxies and its redirects,
// along with the proxy to use.
var createProxyHandler = function(proxy, proxyConfig, proxyValidateSSL) {
    var proxies = parseProxyConfig(proxyConfig);
    var proxiesList = Object.keys(proxies).sort().reverse();
    var getRequestHostAndPort = function(request) {
        var parts = request.headers.host.split(':');
        return {
            host: parts[0],
            port: parts[1] || '80'
        };
    };

    if (!proxiesList.length) {
        return function(request, response, next) {
            return next();
        };
    }

    // The handler:
    return function(request, response, next) {
        var requestHostAndPort;
        var proxyKey;
        var proxiedUrl;
        var replacementPattern;

        for (var i = 0; i < proxiesList.length; i++) {
            proxyKey = proxiesList[i];
            proxiedUrl = proxies[proxyKey];
            replacementPattern = null;

            // Does the proxy key use regex pattern matching/replacement?
            if (proxyKey.match(/\(.*\)/) && request.url.match(proxyKey)) {
                replacementPattern = new RegExp(proxyKey);
            }
            // Match the proxy key against the beginning of the url.
            else if (request.url.indexOf(proxyKey) === 0) {
                replacementPattern = proxyKey;
            }

            if (replacementPattern) {
                // log.debug('proxying request - %s to %s:%s', request.url, proxiedUrl.host, proxiedUrl.port);
                requestHostAndPort = getRequestHostAndPort(request);
                request.url = request.url.replace(replacementPattern, proxiedUrl.baseProxyUrl);
                proxy.proxyRequest(request, response, {
                    host: proxiedUrl.host || requestHostAndPort.host,
                    port: proxiedUrl.port || requestHostAndPort.port,
                    target: { https: proxiedUrl.https, rejectUnauthorized: proxyValidateSSL }
                });
                return;
            }
        }
        return next();
    };
};

module.exports = function(proxies) {
    var routingProxy = new httpProxy.RoutingProxy({ changeOrigin: true });
    return createProxyHandler(routingProxy, proxies);
};
