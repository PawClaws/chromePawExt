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

// https://github.com/karma-runner/grunt-karma
// http://karma-runner.github.io/0.12/index.html
// https://github.com/karma-runner/karma-sauce-launcher

'use strict';

var _ = require('lodash');
var grunt = require('grunt');

function isSauceLabsEnabled(settings) {
    return (
        settings.sauceLabs &&
        settings.sauceLabs.username &&
        settings.sauceLabs.accessKey
    );
}

module.exports = function(settings) {
    var files = settings.files;
    var globs = settings.globs;

    var config = {
        options: {
            port: 9876,
            captureTimeout: 5000,
            reportSlowerThan: 500,
            colors: true,
            reporters: ['dots'],
            logLevel: 'INFO',
            frameworks: [
                'jasmine',
                'requirejs'
            ],
            files: [
                { pattern: globs.src, included: false },
                { pattern: globs.test, included: false },
                files.requireConfigKarma
            ],
            proxies: settings.proxies,
            preprocessors: {}
        }
    };

    // Add additional files as needed.
    [globs.bower, globs.src.replace(/\.js$/, '.html')].forEach(function(pattern) {
        if (grunt.file.expand(pattern).length) {
            config.options.files.push({ pattern: pattern, included: false });
        }
    });

    // If not given SauceLabs config, run locally
    if (!isSauceLabsEnabled(settings)) {
        _.merge(config, {
            local: {
                autoWatch: true,
                browsers: ['PhantomJS'],
                reporters: ['progress']
            }
        });
    }
    // If given SauceLabs config, run on SauceLabs.
    else {
        _.merge(config, {
            sauce: {
                buildNumber: settings.sauceLabs.buildNumber,
                browsers: [
                    'SL_chrome',
                    'SL_firefox',
                    'SL_safari',
                    'SL_ie_9',
                    'SL_ie_10',
                    'SL_ie_11'
                ],
                captureTimeout: 120000,
                customLaunchers: {
                    SL_chrome: {
                        base: 'SauceLabs',
                        browserName: 'chrome'
                    },
                    SL_firefox: {
                        base: 'SauceLabs',
                        browserName: 'firefox'
                    },
                    SL_safari: {
                        base: 'SauceLabs',
                        browserName: 'safari',
                        platform: 'OS X 10.9',
                        version: '7'
                    },
                    SL_ie_9: {
                        base: 'SauceLabs',
                        browserName: 'internet explorer',
                        platform: 'Windows 7',
                        version: '9'
                    },
                    SL_ie_10: {
                        base: 'SauceLabs',
                        browserName: 'internet explorer',
                        platform: 'Windows 7',
                        version: '10'
                    },
                    SL_ie_11: {
                        base: 'SauceLabs',
                        browserName: 'internet explorer',
                        platform: 'Windows 7',
                        version: '11'
                    }
                },
                reporters: ['dots', 'saucelabs'],
                sauceLabs: {
                    testName: settings.sauceLabs.testName,
                    username: settings.sauceLabs.username,
                    accessKey: settings.sauceLabs.accessKey,
                    connectOptions: {
                        port: 5757,
                        logfile: 'sauce_connect.log'
                    }
                },
                singleRun: true
            }
        });
    }

    return {
        karma: config
    };
};