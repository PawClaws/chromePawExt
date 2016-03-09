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

/* global module */
(function(root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('Q'));
    }
    else if (typeof define === 'function' && define.amd) {
        define('paw/Train', ['Q'], factory);
    }
    else {
        root.Train = factory(root.Q);
    }
}(this, function(Q) {

    'use strict';
    var Train = {};


    // borrowed from angular injector that looks at parameter names
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    // Extract param names from the function definition

    function getParamNames(fn) {
        var fnText,
            argDecl,
            paramNames;

        if (typeof fn === 'function') {
            if (!(paramNames = fn.$params)) {
                paramNames = [];
                fnText = fn.toString().replace(STRIP_COMMENTS, '');
                argDecl = fnText.match(FN_ARGS);
                var list = argDecl[1].split(FN_ARG_SPLIT);
                for (var i = 0; i < list.length; i++) {
                    paramNames.push(list[i].trim());
                }
            }
        }
        return paramNames;
    }

    function makeObjectChainable(target) {
        if (!target || target.__mix) {
            return;
        }
        target.__mix = {
            deferredStack: [],
            deferreds: [],

            /*
             * Cleans up the deferred chain
             */
            cleanQueue: function() {
                var self = target;
                while (self.__mix.deferreds.length > 0 && self.__mix.deferreds[0].promise.isFulfilled()) {
                    self.__mix.deferreds.shift();
                }
            },

            /*
             * Clear out the wait queue. Should not normally be needed unless a gesture never calls done
             */
            reset: function() {
                var self = target;
                var len = self.__mix.deferreds.length;
                for (var i = 0; i < len; ++i) {
                    self.__mix.deferreds[i].resolve(this);
                }
                self.__mix.deferreds.length = 0;
            },

            toString: function() {
                var self = target;
                var result = '',
                    s, d;
                var len = self.__mix.deferreds.length;
                for (var i = 0; i < len; ++i) {
                    d = self.__mix.deferreds[i];
                    s = d.promise.inspect();
                    result += ' ' + String(d.NAME) + ':' + String(s.state);
                }
                return result.trim();
            }

        };
    }

    /*
     * Add a function to target that is wrapped and chainable.
     * The function should take 2 arguments an options and a
     * done method to call when finished.
     * @param {object} target
     * @param {string} name
     * @param {function} func
     * @returns {boolean} If the function was mixed in, false if not
     */
    Train.mixFunctionInto = function(target, name, func) {
        if (!target || !name || !func) {
            return false;
        }

        if (target[name]) {
            return false; // should we overwrite or not. Right now we only mix once.
        }

        makeObjectChainable(target);
        var params = getParamNames(func);

        target[name] = function() {
            var self = this;
            var d = Q.defer();
            d.NAME = name;

            function done() {
                if (d.queue && d.queue.length) {
                    // wait for other things in this sub-queue to finish before resolving
                    Q.all(d.queue).then(function() {
                        d.resolve();
                        setTimeout(function() {
                            self.__mix.cleanQueue();
                        }, 0);
                    });
                }
                else {
                    d.resolve();
                    setTimeout(function() {
                        self.__mix.cleanQueue();
                    }, 0);
                }
            }

            // build up the arguments to call the wrapped function with
            var args = [];
            var matchedDone = false;

            for (var i = 0; i < func.length; i++) {
                // magic to automatically pass the done func to the param named done
                if (params[i] === 'done') {
                    matchedDone = true;
                    args[i] = done;
                }
                else {
                    args[i] = arguments[i];
                }
            }

            function task() {
                self.__mix.deferredStack.push(d);
                func.apply(self, args);
                // auto call done if the function doesn't take a done callback
                if (func.length < args.length || !matchedDone) {
                    done();
                }
                self.__mix.deferredStack.pop();
            }

            self.__mix.cleanQueue.call(self);

            var taskQueue = self.__mix.deferreds;
            if (self.__mix.deferredStack.length > 0) {
                var top = self.__mix.deferredStack[self.__mix.deferredStack.length - 1];
                top.queue = top.queue || [];
                taskQueue = top.queue;
            }

            // if there are existing pending promises, chain it on the end
            var lastDeferred = taskQueue[taskQueue.length - 1];
            taskQueue.push(d);

            if (lastDeferred && d !== lastDeferred) {
                lastDeferred.promise.then(task);
            }
            else {
                task();
            }

            return self;
        };
        target[name].$params = params;
        target[name].$orig = func;
        return true;
    };

    /*
     * Adds all of the functions from source onto target as wrapped chainable functions
     * @param {object} source
     */
    Train.mixObjectInto = function(target, source) {
        if (!source || typeof source !== 'object') {
            return false;
        }
        var keys = Object.keys(source);
        var len = keys.length;
        var i = 0;
        var key = '';
        for (; i < len; ++i) {
            key = keys[i];
            if (typeof source[key] === 'function') {
                Train.mixFunctionInto(target, key, source[key]);
            }
        }
        return true;
    };

    /*
     * Create a new object by mixing together all of the passed in objects
     * @param object[] arguments
     */
    Train.create = function() {
        var result = function() {};
        var len = arguments.length;
        var i = 0;
        var arg;
        for (; i < len; ++i) {
            arg = arguments[i];
            if (typeof arg === 'object') {
                Train.mixObjectInto(result, arg);
            }
        }
        return result;
    };

    return Train;
}));
