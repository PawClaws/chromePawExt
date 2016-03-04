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

// https://github.com/gruntjs/grunt-contrib-connect

'use strict';

module.exports = function(settings) {

    function getCommonMiddleware(connect, options) {
        var middleware = [
            require('../middleware/proxy')(settings.proxies),
            require('connect-livereload')({
                port: settings.livereloadPort,
                ignore: ['.css', '.svg', '.ico', '.woff', '.png', '.jpg', '.jpeg'],
            }),
            connect.static(options.base),
            connect.favicon()
        ];
        // prepend custom middleware
        if (settings.middleware) {
            middleware = [].concat(settings.middleware(connect, options), middleware);
        }
        return middleware;
    }

    return {
        connect: {
            options: {
                hostname: '0.0.0.0',
                port: settings.wwwPort,
                base: '.'
            },
            run: {
                options: {
                    middleware: function(connect, options) {
                        return getCommonMiddleware(connect, options);
                    }
                }
            },
            serve: {
                options: {
                    keepalive: true,
                    middleware: function(connect, options) {
                        return [
                            connect.logger('dev')
                        ].concat(getCommonMiddleware(connect, options));
                    }
                }
            }
        }
    };
};
