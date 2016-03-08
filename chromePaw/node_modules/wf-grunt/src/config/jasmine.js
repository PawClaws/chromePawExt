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

// https://github.com/gruntjs/grunt-contrib-jasmine
// https://github.com/maenu/grunt-template-jasmine-istanbul
// https://github.com/cloudchen/grunt-template-jasmine-requirejs

'use strict';

module.exports = function(settings) {
    var files = settings.files;
    var directories = settings.directories;
    var globs = settings.globs;

    return {
        jasmine: {
            options: {
                keepRunner: true,
                host: settings.wwwBaseUrl,
                junit: {
                    consolidate: true,
                    path: directories.testOutput
                }
            },
            test: {
                src: [globs.src],
                options: {
                    specs: globs.unitSpecs,
                    outfile: files.testRunner,
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfig: settings.requireConfigTest
                    }
                }
            },
            coverage: {
                src: [globs.src],
                options: {
                    specs: globs.unitSpecs,
                    outfile: files.coverageRunner,
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: directories.coverageOutput + 'coverage.json',
                        report: [
                            { type: 'text-summary' },
                            { type: 'html', options: { dir: directories.coverageOutput }}
                        ],
                        thresholds: settings.coverageThresholds,
                        template: require('grunt-template-jasmine-requirejs'),
                        templateOptions: {
                            requireConfig: settings.requireConfigCoverage
                        }
                    }
                }
            },
            integration: {
                src: [globs.src],
                options: {
                    specs: globs.integrationSpecs,
                    outfile: files.integrationRunner,
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfig: settings.requireConfigTest
                    }
                }
            },
        }
    };
};
