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

// https://github.com/gruntjs/grunt-contrib-jshint

'use strict';

var _ = require('lodash');

var JASMINE_GLOBALS = {
    afterEach: true,
    beforeEach: true,
    describe: true,
    expect: true,
    it: true,
    jasmine: true,
    runs: true,
    spyOn: true,
    xdescribe: true,
    xit: true,
    waits: true,
    waitsFor: true
};

var REQUIREJS_GLOBALS = {
    define: true,
    require: true,
    requirejs: true
};

module.exports = function(settings) {
    var files = settings.files;
    var globs = settings.globs;

    return {
        jshint: {
            options: {
                camelcase: true,
                curly: true,
                eqeqeq: true,
                forin: true,
                immed: true,
                indent: 4,
                latedef: true,
                newcap: true,
                noarg: true,
                noempty: false,
                nonew: true,
                quotmark: 'single',
                undef: true,
                unused: true,
                trailing: true,
                maxdepth: 5
            },
            examples: {
                src: [globs.examples],
                options: {
                    devel: true,
                    browser: true,
                    ignores: [globs.vendor],
                    globals: _.assign({}, REQUIREJS_GLOBALS)
                }
            },
            src: {
                src: [globs.src],
                options: {
                    browser: true,
                    globals: _.assign({}, REQUIREJS_GLOBALS)
                }
            },
            test: {
                src: [globs.test],
                options: {
                    browser: true,
                    globals: _.assign({}, REQUIREJS_GLOBALS, JASMINE_GLOBALS)
                }
            },
            tools: {
                src: [files.gruntfile, globs.tools],
                options: {
                    node: true
                }
            }
        }
    };
};
