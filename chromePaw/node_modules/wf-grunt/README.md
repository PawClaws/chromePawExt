WebFilings Grunt [![Build Status](https://travis-ci.org/WebFilings/wf-grunt.png)](https://travis-ci.org/WebFilings/wf-grunt)
================

> Opinionated Suite of Common Grunt Tasks for JavaScript Libraries.

- [Consuming This Library](#consuming-this-library)
- [Advanced Configuration](#advanced-configuration)
- [Task Reference](#task-reference)
- [Credits](#credits)


Consuming This Library
----------------------

#### Expectations

This is an opinionated solution, and expects the following project structure:

- `docs/` project design and API documentation
- `examples/` sample applications and such
- `out/` output from build tasks
- `src/` source files
- `test/` test files
- `tools/` supporting tools for code quality, builds, etc.
- `index.html` the default web page for the project

If you want to meet these expectations simply, use the
[Yeoman generator for wf-js projects](https://github.com/WebFilings/generator-wf-js):

#### Installation

```bash
# init npm for your project if you haven't already:
$ npm init

# install wf-js-grunt
$ npm install --save-dev git+ssh://git@github.com:WebFilings/wf-js-grunt.git#{version}
```

#### Basic Configuration

```javascript
// In Gruntfile.js
module.exports = function(grunt) {
    require('wf-js-grunt').init(grunt);
};
```

Yes, it's that easy to configure!


Advanced Configuration
----------------------

This project tries to use sensible defaults, but chances are good you'll want to:

- modify the default settings for wf-js-grunt;
- modify or extend the default configuration for the plugins wf-js-grunt uses; or,
- extend the grunt configuration to work with project-specific plugins and tasks.

#### Modify the Default Settings for wf-js-grunt

Modification of the settings for wf-js-grunt is done through the `options` property
of the `config` parameter passed into `wfJsGrunt.init(grunt, config)`.

```javascript
// Example using all the available options:
module.exports = function(grunt) {
    require('wf-js-grunt').init(grunt, {
        options: {

            // Setup a RequireJS config template to use with Jasmine and Karma.
            // All paths should be based on the project root.
            // DEFAULT: undefined
            requireConfig: {
                paths: {
                    file: 'path/to/file.js',
                    alias: 'path/to/directory',
                    'your-project-name': './src'
                },
                shim: {
                    // As you need....
                }
            },

            // Set code coverage thresholds. Disable by setting to null.
            // If coverage dips below these values, the relevant tasks will fail.
            // DEFAULT: 90% across the board.
            coverageThresholds: {
                statements: 90,
                branches: 90,
                functions: 90,
                lines: 90
            },

            // Change the default port used by the provided Connect web server.
            // DEFAULT: 9000
            wwwPort: 9000,

            // Forward HTTP requests made to the provided Connect web server.
            // DEFAULT: undefined
            proxies: {
                // Can forward to another host.
                '/requested/path': 'http://host:port/forwarded/path',
                // Can forward/redirect to same host.
                '/requested/path': '/forwarded/path',
                // Can use regex pattern matching and replacements.
                '/requested/path/(.*\\.html)': '/forwarded/path/$1',
            },

            // Enable Karma testing with SauceLabs by supplying your credentials.
            // If the username and accessKey are set, then karma will launch
            // browsers on SauceLabs to run the tests; if not, karma will run
            // locally in development mode, allowing you to connect local browsers:
            // DEFAULT: undefined
            sauceLabs: {
                buildNumber: 'build number from CI server',
                testName: 'my repo unit tests',
                username: 'your_username',
                accessKey: 'your_accessKey'
            },

            // Modify the list of subtasks run when a built-in alias task is run.
            // This is handy for adding custom tasks from outside of wf-js-grunt
            // into the various workflow tasks provided.
            onAliasTaskRunning: function(name, tasks) {
                if (name === 'lint') {
                    tasks.unshift('customTask');
                }
            },

            // Add custom middleware for the connect server.
            // This function should return a list of middleware that will
            // be prepended to the middleware already present in wf-grunt.
            middleware: function(connect, options) {
                return [
                    customMiddleware
                ];
            }
        }
    });
};
```

#### Modify or Extend the Default Configuration for the Plugins wf-js-grunt Uses

wf-js-grunt uses many common and popular plugins -- such as `grunt-contrib-watch`
and `grunt-contrib-jshint` -- and configures these plugins to suit its needs.
If you have to make use of these plugins in additional ways, it is simple to merge
custom configuration settings into the configuration built up by wf-js-grunt.

```javascript
// Example of merging custom settings for plugins used by wf-js-grunt.
module.exports = function(grunt) {
    require('wf-js-grunt').init(grunt, {

        // Add a configuration property for the plugin you want to modify or extend.
        // The values are merged into the configuration built up by wf-js-grunt.
        jshint: {

            // MODIFICATION:
            // Add a global var to the hinting rules for the files in src/.
            // wf-js-grunt has already specified a src target and configured it,
            // so you can just tweak those settings to suit your need.
            src: {
                options: {
                    globals: {
                        foo: true
                    }
                }
            },

            // EXTENSION:
            // Add a custom jshint target, available via: `grunt jshint:custom`.
            custom: {
                src: ['some/glob/**/*.js'],
                options: {
                    browser: true
                }
            }
         }
    });
};
```

#### Extend the Grunt Configuration for Project-Specific Plugins and Tasks

Another common scenario is that you want to configure plugins and tasks that live
outside of wf-js-grunt. As described above, since configuration properties are
merged over the configuration generated by wf-js-grunt, this is easy:

```javascript
// Example of specifying configuration for project-specific plugins and tasks.
module.exports = function(grunt) {
    require('wf-js-grunt').init(grunt, {
        adhoc: {
            // ...
        }
    });

    grunt.loadNpmTasks('grunt-adhoc');
};
```


Task Reference
--------------

To see a list of the tasks available:

```bash
$ grunt -h
```

#### Workflow Tasks

The following tasks will combine a number of single tasks in a meaningful way.

```
$ grunt          Check code quality (lint, test, cover, docs).
$ grunt ci       Check code quality on CI server.
$ grunt qa       Check code quality and open the project web site.
$ grunt serve    Open the project web site.
$ grunt dev      Lint and test, open the project web site and watch.
$ grunt lint     Lint files and watch.
$ grunt test     Run tests, open the spec runner and watch.
$ grunt cover    Run code coverage, open the coverage report and watch.
$ grunt analyze  Run complexity analysis, open the report and watch.
$ grunt docs     Generate API docs, open the index and watch.
```

Most of the tasks above start a watch after first executing. If the task is failing
out of the gate, you can force it to continue into a watch state by appending
the `--force` flag to the end of your command like so:

```
# this task fails cause there's a broken test,
# but you wanted to launch the HTML spec runner and start a watch :(
$ grunt test

# just force the task to continue past the failure
$ grunt test --force
```

#### Watches

The tasks that start a watch will, on changes to relevant source files,
refresh both the console output and HTML pages served from the site.
The intent is to eliminate context switching between your editor
and your feedback mechanism of choice.

If you want to start a watch even when tasks are failing, start the watch first:

```
$ grunt watch:dev
$ grunt watch:lint
$ grunt watch:test
$ grunt watch:cover
$ grunt watch:docs
```

#### Node Server

This project uses a [Connect][Connect] web server to serve files from the project.

```
$ grunt connect:run    Start the project's web server and kill after task finishes.
$ grunt connect:serve  Start the project's web server and keep it alive.
```

#### Linting

```
$ grunt jshint           Validate all files with JSHint.
$ grunt jshint:examples  Validate example files.
$ grunt jshint:node      Validate node files.
$ grunt jshint:src       Validate source files.
$ grunt jshint:test      Validate test files.
```

#### Static Analysis

```
$ grunt plato  Run code complexity analysis using Plato.
```

#### Testing & Code Coverage

```
$ grunt jasmine                 Run jasmine specs and istanbul code coverage headlessly.
$ grunt jasmine:coverage        Run istanbul code coverage.
$ grunt jasmine:test            Run jasmine unit tests.
$ grunt jasmine:integration     Run jasmine integration tests.
```

#### Cross-Browser Testing

We use [Karma][Karma] and [SauceLabs][SauceLabs] to do cross-browser testing.

```
$ grunt karma:local  Start karma and wait for local browsers to connect.
$ grunt karma:sauce  Start karma launch browsers on SauceLabs.
```

If you supply your sauce labs credentials in the configuration for wf-grunt,
then the `karma:sauce` target will be available. If you do not, then the
`karma:local` target will be available. This means you can just run
`grunt karma` and run locally or on sauce depending on your environment.

The `:local` target is useful for fixing test failures from SauceLabs browsers.
It will start Karma, run tests on PhantomJS for a quick sanity check, and then wait.
You can then connect devices to the Karma server and start fixing things.
Just point your browsers to the URL Karma logs after it is started.

#### API Documentation

```
$ grunt jsdoc  Generate source documentation using jsdoc.
```

#### Shell Commands

```
$ grunt shell                       Run shell commands.
$ grunt shell:installPreCommitHook  Install git pre commit hook for code quality.
$ grunt shell:installPrePushHook    Install git pre push hook for code quality.
$ grunt shell:openCoverage          Open the istanbul code coverage report.
$ grunt shell:openDocs              Open the API docs.
$ grunt shell:openTest              Open the jasmine spec runner.
$ grunt shell:openWeb               Open the project's web site.
```

#### Cleaning Up

```
$ grunt clean           Clean all output files and folders.
$ grunt clean:coverage  Clean code coverage output.
$ grunt clean:docs      Clean generated API documentation.
$ grunt clean:test      Clean test output.
```

#### Git Hooks

```
$ grunt precommit  Run lint and test tasks.
$ grunt prepush    Run lint, test, cover and docs tasks.
```


Credits
-------

- [Node][Node]: server-side JavaScript
- [NPM][NPM]: package manager for server-side JavaScript
- [Grunt][Grunt]: task runner
- [Connect][Connect]: local dev server
- [RequireJs][RequireJs]: module loader
- [JSDoc][JSDoc]: API documentation generator
- [JSHint][JSHint]: JavaScript source file validator
- [Plato][Plato]: JavaScript code visualization, static analysis, and complexity
- [Jasmine][Jasmine]: test framework
- [Istanbul][Istanbul]: code coverage framework
- [Karma][Karma]: multi-client test runner
- [SauceLabs][SauceLabs]: browsers in the cloud

[Node]: http://nodejs.org/api/
[NPM]: https://npmjs.org/
[Grunt]: http://gruntjs.com/
[Connect]: http://www.senchalabs.org/connect/
[RequireJs]: http://requirejs.org/
[JSDoc]: http://usejsdoc.org/
[JSHint]: http://www.jshint.com/docs/
[Plato]: https://github.com/es-analysis/plato
[Jasmine]: http://pivotal.github.io/jasmine/
[Istanbul]: https://github.com/gotwarlost/istanbul
[Karma]: http://karma-runner.github.io/
[SauceLabs]: https://saucelabs.com/platforms

[DefaultJSHintConfiguration]: https://github.com/WebFilings/wf-js-grunt/blob/master/src/config/jshint.js
