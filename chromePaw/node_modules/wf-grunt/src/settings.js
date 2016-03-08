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

'use strict';

var settings = module.exports = {};

var _ = require('lodash');
var requireConfig = require('./requireConfig');

// NOTE: The paths in files, directories and globs are all relative to the cwd,
// which will be the location of the Gruntfile that consumes this lib.

var files = {
    coverageRunner: '_coverage.runner.html',
    docsReadme: 'docs/README.md',
    gruntfile: 'Gruntfile.js',
    index: 'index.html',
    requireConfigKarma: '.grunt/wf-js-grunt/require-karma.config.js',
    testRunner: '_test.runner.html',
    integrationRunner: '_integration.runner.html'

};

var directories = {
    apiOutput: 'docs/api/',
    complexityOutput: 'out/complexity/',
    coverageOutput: 'out/coverage/',
    testOutput: 'out/test/'
};

var globs = {
    bower: 'bower_components/**/*.js',
    css: 'examples/**/*.css',
    html: 'examples/**/*.html',
    examples: 'examples/**/*.js',
    unitSpecs: 'test/**/!(*Integration)*Spec.js',
    integrationSpecs: 'test/**/*IntegrationSpec.js',
    src: 'src/**/*.js',
    templates: 'src/**/*.html',
    test: 'test/**/*.js',
    testTemplates: 'test/**/*.html',
    tools: 'tools/**/*.js',
    vendor: 'examples/vendor/**/*.js'
};

var defaults = {
    coverageThresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90
    },
    livereloadPort: 35729,
    onAliasTaskRunning: function(/*name, subtasks*/) {},
    proxies: {},
    requireConfig: {},
    sauceLabs: null,
    wwwPort: 9000
};

settings.init = function(options) {
    var basePath = __dirname + '/..';

    // Apply options over top of default settings.
    _.assign(settings, defaults, options || {});

    // Add settings that are not configurable.
    settings.basePath = basePath;
    settings.cwd = process.cwd();
    settings.directories = directories;
    settings.files = files;
    settings.globs = globs;
    settings.wwwBaseUrl = 'http://0.0.0.0:' + settings.wwwPort + '/';

    // RequireJs configs need to be built from a template because
    // jasmine, istanbul and karma all need slightly different configurations.
    requireConfig.buildCoverage(settings);
    requireConfig.buildTest(settings);
    requireConfig.buildKarma(settings);
};