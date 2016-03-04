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

// https://github.com/gruntjs/grunt-contrib-watch

'use strict';

module.exports = function(settings) {
    var livereloadPort = settings.livereloadPort;
    var files = settings.files;
    var globs = settings.globs;

    return {
        watch: {
            complexity: {
                files: [globs.src],
                tasks: ['clean:complexity', 'plato:complexity'],
                options: {
                    livereload: livereloadPort
                }
            },
            coverage: {
                files: [globs.src, globs.templates, globs.test, globs.testTemplates],
                tasks: ['clean:coverage', 'jasmine:coverage'],
                options: {
                    livereload: livereloadPort
                }
            },
            test: {
                files: [
                    files.index, globs.src, globs.templates, globs.unitSpecs, globs.testTemplates, globs.examples,
                    globs.html, globs.css
                ],
                tasks: ['clean:test', 'jasmine:test'],
                options: {
                    livereload: livereloadPort
                }
            },
            integration: {
                files: [
                    files.index, globs.src, globs.templates, globs.integrationSpecs, globs.testTemplates,
                    globs.examples, globs.html, globs.css
                ],
                tasks: ['clean:test', 'jasmine:integration'],
                options: {
                    livereload: livereloadPort
                }
            },
            dev: {
                files: [
                    files.index, globs.src, globs.templates, globs.test, globs.testTemplates,
                    globs.examples, globs.html, globs.css
                ],
                tasks: ['jshint', 'clean:test', 'jasmine:test'],
                options: {
                    livereload: livereloadPort
                }
            },
            docs: {
                files: [files.docsReadme, globs.src],
                tasks: ['clean:docs', 'jsdoc'],
                options: {
                    livereload: livereloadPort
                }
            },
            lint: {
                files: [globs.src, globs.test, globs.tools],
                tasks: ['jshint']
            },
            serve: {
                files: [
                    files.index, globs.src, globs.templates, globs.test, globs.testTemplates,
                    globs.examples, globs.html, globs.css
                ],
                tasks: [],
                options: {
                    livereload: livereloadPort
                }
            }
        }
    };
};
