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

    var WheelEventSimulator = require('paw/WheelEventSimulator');

    describe('WheelEventSimulator#detectMouseWheelEvent', function() {
        it('should return "wheel" for IE9+', function() {
            var fakeWindow = {
                document: {
                    documentMode: 9
                }
            };

            var simulator = new WheelEventSimulator({ window: fakeWindow });
            expect(simulator.eventName).toBe('wheel');
        });

        it('should return "onmousewheel" for webkit', function() {
            var fakeWindow = {
                document: {
                    onmousewheel: 'anything'
                }
            };
            var simulator = new WheelEventSimulator({ window: fakeWindow });
            expect(simulator.eventName).toBe('mousewheel');
        });

        it('should return "DOMMouseScroll" for other browsers', function() {
            var fakeWindow = {
                document: {}
            };
            var simulator = new WheelEventSimulator({ window: fakeWindow });
            expect(simulator.eventName).toBe('DOMMouseScroll');
        });
    });

    describe('WheelEventSimulator', function() {
        var simulator;
        var target;
        var mouseScrollEventName;

        function setMouseScrollEventName(name) {
            mouseScrollEventName = name;
        }
        function dispatchEvent(options) {
            simulator = new WheelEventSimulator();
            if (mouseScrollEventName) {
                simulator.eventName = mouseScrollEventName;
            }
            target = document.createElement('div');
            spyOn(target, 'dispatchEvent');
            simulator.dispatch(target, options);
            expect(target.dispatchEvent).toHaveBeenCalled();
            return target.dispatchEvent.mostRecentCall.args[0];
        }
        describe('dispatching in browsers supporting "wheel" event', function() {
            beforeEach(function() {
                setMouseScrollEventName('wheel');
            });
            it('should dispatch a "wheel" event', function() {
                var evt = dispatchEvent();
                expect(evt.type).toBe('wheel');
            });
            it('should set event deltaX to options.deltaX', function() {
                var evt = dispatchEvent({ deltaX: 20 });
                expect(evt.deltaX).toBe(20);
            });
            it('should set event deltaY to options.deltaY', function() {
                var evt = dispatchEvent({ deltaY: 30 });
                expect(evt.deltaY).toBe(30);
            });
            it('should set event delta to whichever of x or y is non-zero', function() {
                var evt = dispatchEvent({ deltaX: 10, deltaY: 0 });
                expect(evt.delta).toBe(10);
                evt = dispatchEvent({ deltaX: 0, deltaY: 20 });
                expect(evt.delta).toBe(20);
            });
            it('should set event deltaZ to 0', function() {
                var evt = dispatchEvent();
                expect(evt.deltaZ).toBe(0);
            });
            it('should set event deltaMode to pixel', function() {
                var evt = dispatchEvent();
                expect(evt.deltaMode).toBe(0x00);
            });
        });
        describe('dispatching in browsers supporting "mousewheel" event', function() {
            beforeEach(function() {
                setMouseScrollEventName('mousewheel');
            });
            it('should dispatch a "mousewheel" event', function() {
                var evt = dispatchEvent();
                expect(evt.type).toBe('mousewheel');
            });
            it('should set event wheelDeltaX to the inverse of options.deltaX', function() {
                var evt = dispatchEvent({ deltaX: 20 });
                expect(evt.wheelDeltaX).toBe(-20);
            });
            it('should set event wheelDeltaY to the inverse of options.deltaY', function() {
                var evt = dispatchEvent({ deltaY: 30 });
                expect(evt.wheelDeltaY).toBe(-30);
            });
            it('should set event delta to the inverse of whichever of x or y is non-zero', function() {
                var evt = dispatchEvent({ deltaX: 10, deltaY: 0 });
                expect(evt.wheelDelta).toBe(-10);
                evt = dispatchEvent({ deltaX: 0, deltaY: 20 });
                expect(evt.wheelDelta).toBe(-20);
            });
        });
        describe('dispatching in old browsers not supporting "wheel" or "mousewheel"', function() {
            beforeEach(function() {
                simulator = new WheelEventSimulator();
                simulator.eventName = '?';
                target = jasmine.createSpyObj('target', ['dispatchEvent']);
            });
            it('should throw', function() {
                var invocation = function() {
                    simulator.dispatch(target);
                };
                expect(invocation).toThrow('Your browser is not supported by WheelEventSimulator.');
            });
            it('should not dispatch an event', function() {
                try {
                    simulator.dispatch(target);
                }
                catch (error) {
                    expect(target.dispatchEvent).not.toHaveBeenCalled();
                }
            });
        });
        describe('dispatching at screen position', function() {
            var element;
            function createTestElement() {
                var element = document.createElement('div');
                element.style.position = 'absolute';
                element.style.top = 0;
                element.style.left = 0;
                element.style.width = '100px';
                element.style.height = '100px';
                // must be above the .touch-shield defined in PawSpec
                element.style.zIndex = 10000;
                return element;
            }
            beforeEach(function() {
                element = createTestElement();
                document.body.appendChild(element);
            });
            afterEach(function() {
                document.body.removeChild(element);
            });
            it('should dispatch on the element at screen position', function() {
                simulator = new WheelEventSimulator();
                simulator.eventName = 'wheel';
                spyOn(element, 'dispatchEvent');
                var point = { x: 50, y: 50 };
                simulator.dispatch(point, {});
                expect(element.dispatchEvent).toHaveBeenCalled();
            });
        });
    });
});
