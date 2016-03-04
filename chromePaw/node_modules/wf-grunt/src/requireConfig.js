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

var requireConfig = module.exports = {};

var _ = require('lodash');
var grunt = require('grunt');

function build(template, options) {
    var config = _.cloneDeep(template);
    return _.assign(config, options);
}

requireConfig.buildTest = function(settings) {
    var options = { baseUrl: './' };
    var config = build(settings.requireConfig, options);

    settings.requireConfigTest = config;
};

requireConfig.buildCoverage = function(settings) {
    var options = { baseUrl: '.grunt/grunt-contrib-jasmine' };
    var config = build(settings.requireConfig, options);

    // Modify the paths to account for the base url.
    // Paths that start with './' are unaffected as it means "from the baseUrl".
    _.forOwn(config.paths, function(path, key) {
        if (path.indexOf('./') !== 0) {
            config.paths[key] = '../../' + path;
        }
    });

    settings.requireConfigCoverage = config;
};

requireConfig.buildKarma = function(settings) {
    var config = build(settings.requireConfig);

    // Have to write a file here since karma requirejs adapter requires one.
    var templatePath = settings.basePath + '/templates/require-karma.config.js.tmpl';
    var template = grunt.file.read(templatePath, { encoding: 'utf8' });
    var fileData = _.template(template, { config: config });
    var outPath = settings.cwd + '/' + settings.files.requireConfigKarma;

    grunt.file.write(outPath, fileData);
};