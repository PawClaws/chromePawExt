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

var wfJsGrunt = module.exports = {};

var _ = require('lodash');
var settings = require('./settings');

// Build and initialize the grunt configuration from the config files.
// Override those defaults with the values given in the object passed into wf-js-grunt.
function initConfig(grunt, wfJsGruntConfig) {
    var config = { settings: settings };
    var files = grunt.file.expand({ cwd: settings.basePath + '/src' }, 'config/*.js');

    // Add configuration for each file in /config
    files.forEach(function(file) {
        var taskConfig = require('./' + file);
        _.merge(config, taskConfig(settings));
    });

    // Merge in the configuration passed to wf-js-grunt.
    // Don't include the options.
    _.merge(config, _.omit(wfJsGruntConfig, 'options'));

    grunt.initConfig(config);
}

// Load custom and third-party plugin tasks.
function loadTasks(grunt) {
    grunt.loadTasks(settings.basePath + '/src/tasks');
    grunt.file.expand(settings.basePath + '/node_modules/grunt-*/tasks').forEach(grunt.loadTasks);
}

wfJsGrunt.init = function(grunt, config) {
    // Need grunt the be passed in so we can configure the correct context.
    if (!grunt || !grunt.package || grunt.package.name !== 'grunt') {
        throw new Error('`wfJsGrunt.init()` requires grunt as its first parameter.');
    }

    config = config || {};

    settings.init(config.options);

    initConfig(grunt, config);
    loadTasks(grunt);
};