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

Array.isArray = null;

define(function(require) {
    'use strict';

    var Paw = require('paw/Paw');

    //touchShield keeps Paw from tapping the spec links
    var touchShield = document.createElement('div');
    touchShield.className = 'touch-shield';
    touchShield.style.position = 'absolute';
    touchShield.style.width = '100%';
    touchShield.style.height = '100%';
    touchShield.style.zIndex = '9999';
    document.body.appendChild(touchShield);

    var mockgestures = {
        mockSync: function() {
            // don't need to do anything in here
        },
        mockSyncDone: function(done) {
            done();
        },
        mockAsync: function(done) {
            setTimeout(function() {
                done();
            }, 200);
        },
        noMixProperty: 'this should not be mixed in'
    };

    describe('Array', function() {
        it('isArray should polyfill', function() {
            expect(Array.isArray).toBeDefined();
            expect(Array.isArray([])).toBe(true);
            expect(Array.isArray('nope')).toBe(false);
            expect(Array.isArray(9)).toBe(false);
            expect(Array.isArray(true)).toBe(false);
            expect(Array.isArray({})).toBe(false);

        });
    });

    describe('Paw', function() {
        var paw;
        var dims;
        var dispatchedEvents = [];
        var listenForEvents = [
            'touchstart',
            'touchend',
            'touchmove',
            'mousedown',
            'mouseup',
            'click',
            'wheel', 'mousewheel', 'DOMMouseScroll'
        ];

        function pushEvent(ev) {
            dispatchedEvents.push(ev);
        }

        function getDispatchedEventTypes() {
            return dispatchedEvents.map(function(evt) {
                return evt.type;
            });
        }

        // distance between two points
        // point: { x, y }

        function distance(point1, point2) {
            var xLength = point2.x - point1.x;
            var yLength = point2.y - point1.y;
            return Math.sqrt(Math.pow(xLength, 2) + Math.pow(yLength, 2));
        }

        function distanceBetweenTouches(event) {
            if (event.touches.length < 2) {
                throw 'at least two touches are needed to measure distance';
            }

            return distance({
                x: event.touches[0].pageX,
                y: event.touches[0].pageY
            }, {
                x: event.touches[1].pageX,
                y: event.touches[1].pageY
            });
        }

        beforeEach(function() {
            paw = new Paw(mockgestures);
            dims = paw.getViewportDimensions();
            dispatchedEvents.length = 0;

            for (var i = 0; i < listenForEvents.length; i++) {
                window.addEventListener(listenForEvents[i], pushEvent);
            }
            touchShield.style.display = 'block';
        });

        afterEach(function() {
            paw.release();
            paw.__mix.reset();
            paw.clearTouchIndicators();
            for (var i = 0; i < listenForEvents.length; i++) {
                window.removeEventListener(listenForEvents[i], pushEvent);
            }
            touchShield.style.display = 'none';
        });

        it('should not set defaults to invalid values', function() {
            paw.setDefaultDuration(100);
            paw.setDefaultDuration(-100);
            expect(paw.getDefaultDuration()).toBe(100);

            paw.setDefaultTouchLocation('center center');
            paw.setDefaultTouchLocation(57);
            expect(paw.getDefaultTouchLocation()).toBe('center center');

            paw.setDefaultDoubleTapDuration(100);
            paw.setDefaultDoubleTapDuration(-100);
            expect(paw.getDefaultDoubleTapDuration()).toBe(100);
        });

        it('should throw exceptions for missing input', function() {
            expect(paw._buildTouches).toThrow();
            expect(function() {
                paw._getElements('.nomatch');
            }).toThrow();
        });

        it('should report viewport size', function() {
            var vd = paw.getViewportDimensions();
            expect(vd).toBeDefined();
            expect(vd.width).toEqual(jasmine.any(Number));
            expect(vd.height).toEqual(jasmine.any(Number));

            // force the other code branch
            window.innerWidth = 0;
            window.innerHeight = 0;
            vd = paw.getViewportDimensions();
            expect(vd).toBeDefined();
            expect(vd.width).toEqual(jasmine.any(Number));
            expect(vd.height).toEqual(jasmine.any(Number));
        });

        it('should mixin an objects methods passed in the constructor', function() {
            expect(paw.mockSync).toBeDefined();
            expect(paw.mockSyncDone).toBeDefined();
            expect(paw.mockAsync).toBeDefined();
            expect(paw.noMixProperty).not.toBeDefined();
            expect(function() {
                var p = new Paw(null);
                p = new Paw(['nope', 5, true, {}]);
                p = new Paw(5);
            }).not.toThrow();
        });

        it('should set touch locations correctly', function() {
            paw.touch('bottom right');
            expect(paw.touches[0].x).toBe(dims.width);
            expect(paw.touches[0].y).toBe(dims.height);

            paw.touch('center center');
            expect(paw.touches[0].x).toBe(dims.width / 2);
            expect(paw.touches[0].y).toBe(dims.height / 2);

            paw.addTouch('bottom right');
            expect(paw.touches[1].x).toBe(dims.width);
            expect(paw.touches[1].y).toBe(dims.height);
            expect(paw.touches.length).toBe(2);

            paw.touch();
            var def = paw._buildTouches(paw.getDefaultTouchLocation());
            expect(paw.touches[0].x).toBe(def[0].x);
            expect(paw.touches[0].y).toBe(def[0].y);
            expect(paw.touches.length).toBe(1);

            paw.release();
            expect(paw.touches.length).toBe(0);
        });

        it('should not add touches if where is not specified', function() {
            paw.touch('center center');
            expect(paw.addTouch).toThrow();
            expect(paw.touches.length).toBe(1);
        });

        it('should set and get defaults', function() {
            var wheres;

            paw.setDefaultTouchLocation('top left');
            expect(paw.getDefaultTouchLocation()).toBe('top left');

            wheres = [
                ['60% 45%'],
                ['60% 95%']
            ];
            paw.setDefaultSwipeLocations(wheres);
            expect(paw.getDefaultSwipeLocations()).toBe(wheres);

            wheres = [
                ['60% 45%', '60% 55%'],
                ['60% 40%', '60% 60%']
            ];
            paw.setDefaultPinchLocations(wheres);
            expect(paw.getDefaultPinchLocations()).toBe(wheres);

            paw.setDefaultDuration(155);
            expect(paw.getDefaultDuration()).toBe(155);

            paw.setDefaultDoubleTapDuration(155);
            expect(paw.getDefaultDoubleTapDuration()).toBe(155);
        });

        it('should swipe over a duration of 500ms', function() {
            var ran = false;
            var DURATION = 500;
            var startTime, duration;

            runs(function() {
                startTime = new Date();
                paw
                    .touch('bottom right')
                    .drag('center center', DURATION)
                    .then(function() {
                        var endTime = new Date();
                        duration = endTime - startTime;
                        ran = true;
                    });
            });
            waitsFor(function() {
                return ran;
            }, 'should swipe over a duration of 500ms (timeout)', 800);
            runs(function() {
                expect(duration).toBeGreaterThan(499);
                expect(paw.touches.length).toBe(1);
                expect(paw.touches[0].x).toBe(dims.width / 2);
                expect(paw.touches[0].y).toBe(dims.height / 2);
            });
        });

        it('should swipe correctly with 0 duration', function() {
            var ran = false;
            runs(function() {
                paw.touch('bottom right').drag('center center', 0).then(function() {
                    ran = true;
                });
            });
            waitsFor(function() {
                return ran;
            }, 'should not take longer than 100ms', 100);
            runs(function() {
                expect(paw.touches.length).toBe(1);
                expect(paw.touches[0].x).toBe(dims.width / 2);
                expect(paw.touches[0].y).toBe(dims.height / 2);
            });
        });

        it('should swipe correctly with defaults', function() {
            var ran = false;
            runs(function() {
                paw.swipeUp().then(function() {
                    ran = true;
                });
            });
            waitsFor(function() {
                return ran;
                //default duration is 300, so it shouldn't take more than 500ms.
            }, 'should not take longer than 500ms', 500);
            runs(function() {
                //detault behavior is to release, so we expect 0 touches.
                expect(paw.touches.length).toBe(0);
            });
        });

        it('should remove touches', function() {
            paw.touch(['center center', 'bottom right', 'top left']);
            paw.removeTouch(1);
            expect(paw.touches.length).toBe(2);
            expect(paw.touches[1].x).toBe(0);
            expect(paw.touches[1].y).toBe(0);
            paw.removeTouch();
            expect(paw.touches.length).toBe(1);
            expect(paw.touches[0].x).toBe(dims.width / 2);
            expect(paw.touches[0].y).toBe(dims.height / 2);
        });

        it('should not remove touches if there are none', function() {
            paw.removeTouch(0);
            expect(paw.touches.length).toBe(0);
        });

        it('should remove the middle touch', function() {
            paw.touch([{
                x: 1,
                y: 2
            }, {
                x: 3,
                y: 4
            }, {
                x: 5,
                y: 6
            }]);
            paw.removeTouch(1);
            expect(paw.touches).toEqual([{
                x: 1,
                y: 2
            }, {
                x: 5,
                y: 6
            }]);
        });

        it('should not remove anything if the finger number is greater than the touches', function() {
            paw.touch([{
                x: 1,
                y: 2
            }, {
                x: 3,
                y: 4
            }, {
                x: 5,
                y: 6
            }]);
            paw.removeTouch(3);
            expect(paw.touches).toEqual([{
                x: 1,
                y: 2
            }, {
                x: 3,
                y: 4
            }, {
                x: 5,
                y: 6
            }]);
        });

        it('should wait', function() {
            var start = Date.now();
            var yep = false;
            runs(function() {
                paw.wait(300).then(function() {
                    yep = true;
                    var waitTime = Date.now() - start;
                    expect(waitTime).toBeGreaterThan(299);
                    expect(waitTime).toBeLessThan(350);
                });
            });
            waitsFor(function() {
                return yep;
            });
        });

        it('should wait for a default duration of 300ms', function() {
            var start = Date.now();
            var ran = false;
            runs(function() {
                paw.wait().then(function() {
                    ran = true;
                });
            });
            waitsFor(function() {
                return ran;
            }, 'should not wait more than 350ms', 350);
            runs(function() {
                var waitTime = Date.now() - start;
                expect(waitTime).toBeGreaterThan(299);
            });
        });


        it('should throw if the wait duration is not a number', function() {
            function wait() {
                paw.wait('this string is not a number').then(function() {
                    // discard
                });
            }

            expect(wait).toThrow(new TypeError('duration should be a number'));
        });

        it('should correctly identify an array of DOM nodes', function() {
            // re-polyfill isArray
            Array.isArray = function(vArg) {
                var isArray;
                isArray = vArg instanceof Array;
                return isArray;
            };

            var el, i, tests, result;
            for (i = 0; i < 4; i++) {
                el = document.createElement('div');
                el.className = 'test';
                document.body.appendChild(el);
            }
            var nodes = document.querySelectorAll('.test');
            var node = document.querySelector('.test');
            expect(paw.isDOMNodeArray(nodes)).toBe(true);
            expect(paw.isDOMNodeArray('nope')).toBe(false);
            expect(paw.isDOMNode(node)).toBe(true);
            expect(paw.isDOMNode('nope')).toBe(false);

            var mockJquerySelector = document.querySelectorAll('.test');
            mockJquerySelector.selector = '.test';
            mockJquerySelector.each = function(fn) {
                // fn expects to be called with index, element
                for (var i = 0; i < mockJquerySelector.length; i++) {
                    fn(i, mockJquerySelector[i]);
                }
            };

            tests = [
                '.test',
                node,
                nodes,
                mockJquerySelector
            ];
            for (i = 0; i < tests.length; i++) {
                result = paw._getElements(tests[i]);
                expect(result.length).toBe(i === 1 ? 1 : 4);
            }
            expect(function() {
                paw._getElements(5);
            }).toThrow();
        });

        it('should dispatch mousedown, mouseup, and click when click() is invoked', function() {
            var ran = false;
            runs(function() {
                paw.click().then(function() {
                    ran = true;
                });
            });
            waitsFor(function() {
                return ran;
            });

            runs(function() {
                expect(getDispatchedEventTypes()).toEqual([
                    'mousedown',
                    'mouseup',
                    'click'
                ]);

            });
        });

        it('should click in a default location when tap() is invoked and touch is not supported', function() {
            var ran = false;
            runs(function() {
                paw.isTouchSupported = false;
                paw.tap().then(function() {
                    ran = true;
                });
            });

            waitsFor(function() {
                return ran;
            });

            runs(function() {
                expect(getDispatchedEventTypes()).toEqual([
                    'mousedown',
                    'mouseup',
                    'click'
                ]);
            });
        });

        it('should dispatch mousedown, mouseup, click, when tap() is invoked and touch is not supported', function() {
            var ran = false;
            runs(function() {
                paw.isTouchSupported = false;
                paw.tap('center center').then(function() {
                    ran = true;
                });
            });

            waitsFor(function() {
                return ran;
            });

            runs(function() {
                expect(getDispatchedEventTypes()).toEqual([
                    'mousedown',
                    'mouseup',
                    'click'
                ]);
            });
        });

        it('should dispatch touchstart, touchend when tap() is invoked and touch is supported', function() {
            var ran = false;
            runs(function() {
                paw.isTouchSupported = true;
                paw.tap('center center').then(function() {
                    ran = true;
                });
            });

            waitsFor(function() {
                return ran;
            });

            runs(function() {
                expect(getDispatchedEventTypes()).toEqual([
                    'touchstart',
                    'touchend'
                ]);

            });
        });

        it('should dispatch touchend when release() is invoked', function() {
            var ran = false;

            runs(function() {
                paw.isTouchSupported = true;
                paw.release().then(function() {
                    ran = true;
                });
            });

            waitsFor(function() {
                return ran;
            });

            runs(function() {
                expect(getDispatchedEventTypes()).toEqual([
                    'touchend'
                ]);

            });
        });

        it('should dispatch touchstart, touchmove when touch() then move() is invoked', function() {
            var ran = false;

            runs(function() {
                paw.isTouchSupported = true;
                paw
                    .touch({
                        x: 1,
                        y: 2
                    })
                    .move({
                        x: 3,
                        y: 4
                    }).then(function() {
                        ran = true;
                    });
            });

            waitsFor(function() {
                return ran;
            });

            runs(function() {
                expect(getDispatchedEventTypes()).toEqual([
                    'touchstart',
                    'touchmove'
                ]);

            });
        });

        it('should dispatch touchstart, touchmove, touchend when swipeUp() is invoked and touch is supported', function() {
            var ran = false;

            runs(function() {
                paw.isTouchSupported = true;
                paw.swipeUp().then(function() {
                    ran = true;
                });
            });

            waitsFor(function() {
                return ran;
            });

            runs(function() {
                var eventTypes = getDispatchedEventTypes();

                expect(eventTypes.length).toBeGreaterThan(3);
                expect(eventTypes[0]).toBe('touchstart');
                expect(eventTypes[1]).toBe('touchmove');
                for (var i = 2; i < eventTypes.length - 1; i++) {
                    expect(eventTypes[i]).toBe('touchmove');
                }
                expect(eventTypes[eventTypes.length - 1]).toBe('touchend');

                var startY = dispatchedEvents[0].touches[0].clientY;
                // touchend has no touches, so get the second to last event which is a touchmove
                var endY = dispatchedEvents[dispatchedEvents.length - 2].touches[0].clientY;
                expect(startY).toBeGreaterThan(endY);

            });
        });

        it('should dispatch touchstart, touchmove, touchend when gesture() is invoked and touch is supported', function() {
            var ran = false;

            runs(function() {
                paw.isTouchSupported = true;
                paw.gesture('80% 80%', '10% 10%', 200).then(function() {
                    ran = true;
                });
            });

            waitsFor(function() {
                return ran;
            });

            runs(function() {
                var eventTypes = getDispatchedEventTypes();

                expect(eventTypes.length).toBeGreaterThan(3);
                expect(eventTypes[0]).toBe('touchstart');
                expect(eventTypes[1]).toBe('touchmove');
                for (var i = 2; i < eventTypes.length - 1; i++) {
                    expect(eventTypes[i]).toBe('touchmove');
                }
                expect(eventTypes[eventTypes.length - 1]).toBe('touchend');

                var startY = dispatchedEvents[0].touches[0].clientY;
                // touchend has no touches, so get the second to last event which is a touchmove
                var endY = dispatchedEvents[dispatchedEvents.length - 2].touches[0].clientY;
                expect(startY).toBeGreaterThan(endY);

            });
        });

        it('should dispatch touchstart, touchmove, touchend when swipeDown() is invoked and touch is supported', function() {
            var ran = false;
            runs(function() {
                paw.isTouchSupported = true;
                paw.swipeDown().then(function(done) {
                    ran = true;
                    done(); //just to cover the condional in then()
                });
            });

            waitsFor(function() {
                return ran;
            });

            runs(function() {
                var eventTypes = getDispatchedEventTypes();

                expect(eventTypes.length).toBeGreaterThan(3);
                if (eventTypes.length < 3) {
                    return;
                }

                expect(eventTypes[0]).toBe('touchstart');
                expect(eventTypes[1]).toBe('touchmove');
                for (var i = 2; i < eventTypes.length - 1; i++) {
                    expect(eventTypes[i]).toBe('touchmove');
                }
                expect(eventTypes[eventTypes.length - 1]).toBe('touchend');

                var startY = dispatchedEvents[0].touches[0].clientY;
                // touchend has no touches, so get the second to last event which is a touchmove
                var endY = dispatchedEvents[dispatchedEvents.length - 2].touches[0].clientY;
                expect(endY).toBeGreaterThan(startY);

            });
        });

        it('should double-click when doubleTap() is invoked and touch is not supported', function() {
            var ran = false;
            runs(function() {
                paw.isTouchSupported = false;
                paw.doubleTap('center center').then(function() {
                    ran = true;
                });
            });
            waitsFor(function() {
                return ran;
            });
            runs(function() {
                expect(getDispatchedEventTypes()).toEqual([
                    'mousedown',
                    'mouseup',
                    'click',
                    'mousedown',
                    'mouseup',
                    'click'
                ]);
            });
        });

        it('should doubleTap with specified delay between taps', function() {
            var ran = false;
            var EXPECTED_DELAY = 200;
            runs(function() {
                paw.isTouchSupported = false;
                paw.doubleTap('center center', EXPECTED_DELAY).then(function() {
                    ran = true;
                });
            });
            waitsFor(function() {
                return ran;
            }, 'should not take too long to doubleTap', EXPECTED_DELAY * 2);
            runs(function() {
                expect(getDispatchedEventTypes()).toEqual([
                    'mousedown',
                    'mouseup',
                    'click',
                    'mousedown',
                    'mouseup',
                    'click'
                ]);

                var actualDelay = dispatchedEvents[3].timeStamp - dispatchedEvents[2].timeStamp;
                expect(actualDelay).toBeGreaterThan(EXPECTED_DELAY - 1);
            });
        });

        it('should hold', function() {
            var ran = false;
            runs(function() {
                paw.hold('center center').then(function() {
                    ran = true;
                });
            });
            waitsFor(function() {
                return ran;
            });
            runs(function() {
                expect(getDispatchedEventTypes()).toEqual([
                    'touchstart',
                    'touchend'
                ]);
            });
        });

        it('should hold with specified delay', function() {
            var ran = false;
            var EXPECTED_DELAY = 200;
            runs(function() {
                paw.hold('center center', EXPECTED_DELAY).then(function() {
                    ran = true;
                });
            });
            waitsFor(function() {
                return ran;
            }, 'should not take too long to hold', EXPECTED_DELAY * 2);
            runs(function() {
                var eventTypes = getDispatchedEventTypes();
                expect(eventTypes).toEqual([
                    'touchstart',
                    'touchend'
                ]);
                if (eventTypes.length < 2) {
                    return;
                }

                var actualDelay = dispatchedEvents[1].timeStamp - dispatchedEvents[0].timeStamp;
                expect(actualDelay).toBeGreaterThan(EXPECTED_DELAY - 1);
            });
        });

        it('should have a greater distance between touches after pinchOut()', function() {
            var ran = false;
            runs(function() {
                paw.isTouchSupported = false;
                paw.pinchOut().then(function() {
                    ran = true;
                });
            });
            waitsFor(function() {
                return ran;
            });
            runs(function() {
                var eventTypes = getDispatchedEventTypes();

                expect(eventTypes[0]).toBe('touchstart');
                expect(eventTypes[1]).toBe('touchmove');
                for (var i = 2; i < eventTypes.length - 1; i++) {
                    expect(eventTypes[i]).toBe('touchmove');
                }
                expect(eventTypes[eventTypes.length - 1]).toBe('touchend');

                var firstDistance = distanceBetweenTouches(dispatchedEvents[0]);
                var lastEventWithTouches = dispatchedEvents[dispatchedEvents.length - 2];
                var lastDistance = distanceBetweenTouches(lastEventWithTouches);
                expect(lastDistance).toBeGreaterThan(firstDistance);
            });
        });

        it('should have a smaller distance between touches after pinchIn()', function() {
            var ran = false;
            runs(function() {
                paw.isTouchSupported = false;
                paw.pinchIn().then(function() {
                    ran = true;
                });
            });
            waitsFor(function() {
                return ran;
            });
            runs(function() {
                var eventTypes = getDispatchedEventTypes();

                expect(eventTypes[0]).toBe('touchstart');
                expect(eventTypes[1]).toBe('touchmove');
                for (var i = 2; i < eventTypes.length - 1; i++) {
                    expect(eventTypes[i]).toBe('touchmove');
                }
                expect(eventTypes[eventTypes.length - 1]).toBe('touchend');

                var firstDistance = distanceBetweenTouches(dispatchedEvents[0]);
                var lastEventWithTouches = dispatchedEvents[dispatchedEvents.length - 2];
                var lastDistance = distanceBetweenTouches(lastEventWithTouches);
                expect(firstDistance).toBeGreaterThan(lastDistance);
            });
        });

        it('should buildTouches with a DOM element', function() {
            var touches = paw._buildTouches(touchShield);
            expect(touches.length).toBe(1);
            expect(touches[0].x).toEqual(jasmine.any(Number));
            expect(touches[0].y).toEqual(jasmine.any(Number));
        });

        it('should build touches from string selectors', function() {
            var touches = paw._buildTouches('.touch-shield');
            expect(touches.length).toBe(1);
            expect(touches[0].x).toEqual(jasmine.any(Number));
            expect(touches[0].y).toEqual(jasmine.any(Number));
        });

        it('should not create touch indicators if showTouches is false', function() {
            paw.showTouches = false;
            paw.tap();
            expect(paw.touchIndicators.length).toBe(0);
        });

        it('should not throw when clearing nonexistent touch indicators', function() {
            var ran = false;
            runs(function() {
                paw.showTouches = true;
                paw.touch().then(function() {
                    ran = true;
                });
            });
            waitsFor(function() {
                return ran;
            });
            runs(function() {
                expect(paw.touchIndicators[0]).toBeDefined();
                var oldTi = paw.touchIndicators[0];
                paw.touchIndicators[0] = null;
                expect(function() {
                    paw.clearTouchIndicators();
                }).not.toThrow();
                paw.touchIndicators[0] = oldTi;
                paw.clearTouchIndicators();
            });
        });

        it('should clear touch indicators after a timeout if set', function() {
            var ran = false;
            spyOn(paw, 'clearTouchIndicators').andCallThrough();
            runs(function() {
                paw.showTouches = true;
                paw.clearTouchIndicatorsAfter = 500;
                paw.touch().wait(600).then(function() {
                    ran = true;
                });
                expect(paw.touchIndicators[0]).toBeDefined();
                expect(paw.touchIndicators[0].style.opacity).toBeGreaterThan(0);
            });
            waitsFor(function() {
                return ran;
            });
            runs(function() {
                expect(paw.clearTouchIndicators).toHaveBeenCalled();
                expect(paw.touchIndicators[0]).toBeDefined();
                expect(paw.touchIndicators[0].style.opacity).toEqual('0');
            });
        });

        it('should polyfill creation of touchLists', function() {
            var tl = document.createTouchList;
            document.createTouchList = null;
            var list = paw._createTouchList([{
                x: 100,
                y: 101
            }]);
            expect(list[0].pageX).toEqual(100);
            expect(list[0].pageY).toEqual(101);
            document.createTouchList = tl;
        });

        it('should call indicate Touches a minimal amount of times', function() {
            spyOn(paw, 'indicateTouches');
            var ran = false;
            runs(function() {
                paw.tap().then(function() {
                    ran = true;
                });
            });
            waitsFor(function() {
                return ran;
            });
            runs(function() {
                expect(paw.indicateTouches.calls.length).toBe(2);
            });
        });

        it('should dispatch a wheel event', function() {
            // WheelEventSimulator uses 'DOMMouseScroll' for phantom
            // But PhantomJS does not dispatch it
            if (window.phantom) {
                return;
            }

            var ran = false;
            runs(function() {
                document.onmousewheel = function() {};
                paw.wheel('center center', { deltaY: 100 }).wait(200).then(function() {
                    ran = true;
                });
            });
            waitsFor(function() {
                return ran;
            });
            runs(function() {
                var eventTypes = getDispatchedEventTypes();
                expect(eventTypes).toEqual([
                    'wheel'
                ]);
            });
        });

    });
});
