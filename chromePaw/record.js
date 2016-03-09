#!/usr/bin/env node

/*
 * Copyright 2014-2015 Workiva Inc.
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

var connect = require('connect');
var http = require('http');
var getRawBody = require('raw-body');
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var open = require('open');
var ip = require('ip');
var moment = require('moment');

var CODE_DIR = path.resolve(process.cwd(), "src");

var acceptedFileRegex = /^\w+\.js$/i;

function writeCodeToFile(data, res, next) {
    var filename = data.filename || 'CustomGestures.js';
    if (!acceptedFileRegex.test(filename)) {
        next('Invalid filename');
    }
    var filepath = path.join(CODE_DIR, filename);

    mkdirp(CODE_DIR, function(err) {
        if (err) {
            next(err);
            return;
        }
        if (fs.existsSync(filepath)) {
            var old = filepath.replace('.js', moment().format('.MM-DD-YYYY_HH-mm') + '.js');
            fs.renameSync(filepath, old)
        }
        fs.writeFile(filepath, data.code, function(err) {
            if (err) {
                next(err);
            } else {
                res.write('Ok');
                res.end();
                next();
            }
        });
    });
}

function customGestures(req, res, next) {
    if (req.url === '/CustomGestures') {
        getRawBody(req, {
                length: req.headers['content-length'],
                limit: '1mb',
                encoding: 'utf8'
            },
            function(err, string) {
                if (err) {
                    return next(err);
                }

                if (req.method === 'POST') {
                    writeCodeToFile(JSON.parse(string), res, next);
                } else if (req.method === 'GET') {
                    // serve the code back!
                }
            });
    } else {
        next(); // TODO pass through requests that aren't for me
    }
}

var app = connect()
    .use(connect.favicon())
    .use(customGestures)
    .use(connect.static(path.resolve(__dirname)))

var port = process.env.PAW_PORT || process.env.PORT || 3000;
http.createServer(app).listen(port);
var url = "http://" + ip.address() + ':' + port + '/examples/record/index.html';
console.log('To record gestures open: ', url);
open(url);
