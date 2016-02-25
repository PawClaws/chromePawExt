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

define(function(require) {
    'use strict';

    var Train = require('paw/Train');
    var mock = {
        mockSync: function() {
            // don't need to do anything in here
        },
        mockSyncDone: function(done) {
            done();
        },
        mockAsync: function(signal, done) {
            setTimeout(function() {
                signal();
                done();
            }, 200);
        },
        noMixProperty: 'this should not be mixed in'
    };

    describe('Train', function() {

        var target, blah;

        beforeEach(function() {
            target = {};
            blah = function(arg1) {
                arg1 = null;
            };
        });

        it('should exist', function() {
            expect(Train).toBeDefined();
        });

        it('should handle empty args', function() {
            var f = function() {
                Train.mixFunctionInto(null, 'blah', blah);
                Train.mixFunctionInto(target, null, blah);
                Train.mixFunctionInto(target, 'blah', null);
                Train.mixFunctionInto(target, 'blah');
                Train.mixFunctionInto(target);
                Train.mixFunctionInto();
            };
            expect(f).not.toThrow();
            expect(target.blah).not.toBeDefined();
        });

        it('should not overwrite existing functions', function() {
            target.blah = function() {};
            var r = Train.mixFunctionInto(target, 'blah', blah);
            expect(r).toBe(false);
            expect(target.blah.$orig).not.toBeDefined();
        });

        it('should mix in functions', function() {
            var target = {};
            Train.mixFunctionInto(target, 'mockSync', mock.mockSync);
            expect(target.mockSync).toBeDefined();
            expect(typeof target.mockSync).toBe('function');
        });
        it('should mix in objects', function() {
            var target = {};
            Train.mixObjectInto(target, mock);
            expect(target.mockSync).toBeDefined();
            expect(typeof target.mockSync).toBe('function');

            expect(target.mockSyncDone).toBeDefined();
            expect(typeof target.mockSyncDone).toBe('function');

            expect(target.mockAsync).toBeDefined();
            expect(typeof target.mockAsync).toBe('function');

            expect(target.noMixProperty).not.toBeDefined();
        });

        it('should create a new trainable object', function() {
            var target = Train.create(mock, {
                    another: function() {}
                },
                'some string');
            expect(target.__mix).toBeDefined();
            expect(target.mockSync).toBeDefined();
            expect(typeof target.mockSync).toBe('function');

            expect(target.mockSyncDone).toBeDefined();
            expect(typeof target.mockSyncDone).toBe('function');

            expect(target.mockAsync).toBeDefined();
            expect(typeof target.mockAsync).toBe('function');

            expect(target.another).toBeDefined();
            expect(typeof target.another).toBe('function');

            expect(target.noMixProperty).not.toBeDefined();
        });

    });
});
