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
        module.exports = factory(require('paw/WheelEventSimulator'));
    }
    else if (typeof define === 'function' && define.amd) {
        define('paw/Gestures', ['paw/WheelEventSimulator'], factory);
    }
    else {
        root.Gestures = factory(root.WheelEventSimulator);
    }
}(this, function(WheelEventSimulator) {

    /**
     * This provides functionality for Paw and not meant to be used separately
     *
     * @mixin
     * @exports paw/Gestures
     */
    var Gestures = {

        /**
         * Touch at a certain location or locations
         *
         * @chainable
         * @method
         * @param {object} [where] Either an object with an x and y property
         *   or an array of objects each with x and y properties
         *   The array indicates the number of fingers to touch with
         *   Ex: {x: 100, y: 100} or [{x: 100, y: 100}, {x: 400, y: 200}]
         */
        touch: function(where) {
            where = where || this.getDefaultTouchLocation();
            this.setTouches(where);
            this._triggerStart();
        },

        /**
         * Same as touch, but doesn't remove existing touches
         *
         * @chainable
         * @method
         * @param {(object|string)} where a where expression
         */
        addTouch: function(where) {
            if (!where) {
                throw new Error('"where" parameter can not be empty when adding a touch');
            }
            where = this._buildTouches(where);
            this.touches = this.touches.concat(where);
            this._triggerStart();
        },

        /**
         * Remove a touch
         *
         * @chainable
         * @method
         * @param {Number} [fingerNumber] The 0 based finger number to remove
         */
        removeTouch: function(fingerNumber) {
            if (!this.touches.length) {
                return;
            }

            // use the last touch as the finger if the finger number is invalid
            if (fingerNumber !== 0 && !fingerNumber) {
                fingerNumber = this.touches.length - 1;
            }

            if (0 <= fingerNumber && fingerNumber < this.touches.length) {
                this.touches.splice(fingerNumber, 1);
                this.clearTouchIndicators();
                this.indicateTouches(this.touches);
            }
        },

        /**
         * Moves the existing touches to the next location without releasing
         * The move is "instantaneous" and not over a duration.
         * Multiple moves make up a swipe.
         *
         * @chainable
         * @method
         * @param {object|string|object[]} toWhere a where expression
         */
        move: function(toWhere) {
            if (!this.touches || this.touches.length === 0) {
                throw new Error('There are no current touches to move from.');
            }
            this.setTouches(toWhere);
            this._triggerMove();
        },

        /**
         * Moves the currently set touches to new positions, in multiple moves over a duration.
         * If the duration is omitted or <= zero, the drag is instantaneous
         * otherwise the drag is spread out over the duration given
         *
         * @chainable
         * @method
         * @param {(object|string)} toWhere A where expression Ex: {x: 100, y: 100, duration: 300} or {duration: 300, end: [{x: 100, y: 100}, {x: 400, y: 200}] }
         * @param {Number} [duration] How long the swipe will take
         */
        drag: function(toWhere, duration, done) {
            var self = this;
            var deltas = [];
            var deltaX;
            var deltaY;
            var interval = 16;
            var segments;
            var k = 0;
            var i = 0;
            var point;
            var len = 0;

            duration = Math.max(0, duration >= 0 ? duration : this.getDefaultDuration());
            segments = Math.floor(duration / interval);

            // do an instantaneous move with no extra work
            if (duration === 0) {
                self.setTouches(toWhere);
                self._triggerMove();
                done();
            }

            var endWhere = self._buildTouches(toWhere);
            len = self.touches.length;
            for (i = 0; i < len; i++) {
                point = self.touches[i];
                if (i < endWhere.length) {
                    deltaX = (endWhere[i].x - point.x) / segments;
                    deltaY = (endWhere[i].y - point.y) / segments;
                    deltas.push({
                        x: deltaX,
                        y: deltaY
                    });
                }
            }

            function eachSegment() {
                if (k >= segments) {
                    self.setTouches(endWhere);
                    self._triggerMove();
                    done();
                    return;
                }
                else {
                    for (i = 0; i < self.touches.length; i++) {
                        self.touches[i].x += deltas[i].x;
                        self.touches[i].y += deltas[i].y;
                    }
                    self._triggerMove();
                    k++;
                    setTimeout(eachSegment, interval);
                }
            }
            eachSegment();
        },

        /**
         * Trigger a touch release event
         *
         * @chainable
         * @method
         */
        release: function() {
            this._triggerEnd();
        },

        /**
         * Waits for a duration
         *
         * @chainable
         * @method
         * @param {Number} [duration] in milliseconds. Ex: 100
         */
        wait: function(duration, done) {
            duration = duration || this.getDefaultDuration();
            if (typeof(duration) !== 'number') {
                throw new TypeError('duration should be a number');
            }

            var start = Date.now();
            var end = start + duration;

            function checkDone() {
                var timeLeft = (end - Date.now());
                if (timeLeft <= 1) {
                    done();
                }
                else {
                    setTimeout(checkDone, timeLeft);
                }
            }
            setTimeout(checkDone, duration);
        },

        /**
         * Touch and release. If touch is not available on the device, it will use mouse events.
         *
         * @chainable
         * @method
         * @param {object|string} [where] Example: {x: 100, y: 100} or [{x: 100, y: 100},{x: 100, y: 100}]
         * where can also be a string DOM selector,
         * or a single DOM node or an array of DOM nodes
         * or relative 'top left', '10% 40%' style strings
         */
        tap: function(where) {
            where = where || this.getDefaultTouchLocation();
            if (this.isTouchSupported) {
                this.touch(where).release();
            }
            else {
                this.click(where);
            }
        },

        /**
         * Tap, wait for a duration, and then tap again
         *
         * @chainable
         * @method
         * @param {object} where Example: {x: 100, y: 100 } | '100 100' | 'center center'
         * @param {Number} [msBetweenTaps] the number of milliseconds to wait between taps
         */
        doubleTap: function(where, msBetweenTaps, done) {
            msBetweenTaps = Number(msBetweenTaps) || this.getDefaultDoubleTapDuration();
            this.tap(where).wait(msBetweenTaps).tap(where).then(done);
        },

        /**
         * Touch and hold for a duration, and then release
         *
         * @chainable
         * @method
         * @param {object|string} where  Example: {x: 100, y: 100} | 'top center' | '#selector'
         * @param {Number} [msToHold] How lond to hold the touch
         */
        hold: function(where, msToHold, done) {
            msToHold = Number(msToHold) || this.getDefaultDuration();
            this.touch(where).wait(msToHold).release().then(done);
        },

        /**
         * Click at a certain location(s)
         *
         * @chainable
         * @method
         * @param {object} [where] Either an object with an x and y property
         *   or an array of objects each with x and y properties
         *   The array indicates the number of fingers to touch with
         *   Ex: {x: 100, y: 100} or [{x: 100, y: 100}, {x: 400, y: 200}]
         */
        click: function(where) {
            this.setTouches(where || this.getDefaultTouchLocation());
            this._triggerClick();
        },

        /**
         * Performs any gesture by touching at the fromWhere location(s)
         * dragging to the toWhere locations, and releasing.
         * This is a shortcut for paw.touch(fromWhere).drag(toWhere, duration).release();
         *
         * @chainable
         * @method
         * @param {object|object[]|string} fromWhere
         * @param {object|object[]|string} toWhere
         * @param {number} duration
         **/
        gesture: function(fromWhere, toWhere, duration, done) {
            this.touch(fromWhere).drag(toWhere, duration).release().then(done);
        },

        /**
         * Perform a swipe up gesture by swiping from the default swipe
         * location in array position zero, to position one.
         *
         * @chainable
         * @method
         **/
        swipeUp: function(duration, done) {
            var def = this.getDefaultSwipeLocations();
            this.touch(def[1]).drag(def[0], duration).release().then(done);
        },

        /**
         * Perform a swipe down gesture by swiping from the default swipe
         * location in array position one, to position zero.
         *
         * @chainable
         * @method
         **/
        swipeDown: function(duration, done) {
            var def = this.getDefaultSwipeLocations();
            this.touch(def[0]).drag(def[1], duration).release().then(done);
        },

        /**
         * Perform a pinch out gesture. Usually results in a zoom in.
         *
         * @chainable
         * @method
         **/
        pinchOut: function(duration, done) {
            var def = this.getDefaultPinchLocations();
            this.touch(def[0]).drag(def[1], duration).release().then(done);
        },

        /**
         * Perform a pinch in gesture. Usually results in a zoom out.
         *
         * @chainable
         * @method
         **/
        pinchIn: function(duration, done) {
            var def = this.getDefaultPinchLocations();
            this.touch(def[1]).drag(def[0], duration).release().then(done);
        },

        /**
         * Run any function in the call chain. If you want
         * to do something asynchronous the function should take 1 param a done function
         *
         * @chainable
         * @method
         * @param {function} func - The function to call
         **/
        then: function(func, done) {
            if (func.length > 0) {
                func(done);
            }
            else {
                func();
                done();
            }
        },

        /**
         * Simulate a wheel event.
         * @param {(Object|String)} where an object with x and y, or a string "where" expression
         * @param {Object} [deltas]
         * @param {Number} [deltas.deltaX] The wheel delta along the x-axis.
         * @param {Number} [deltas.deltaY] The wheel delta along the y-axis.
         * @param {Function} [done] Callback invoked after the simulated events are dispatched.
         **/
        wheel: function(where, deltas, done) {
            where = this._buildTouches(where);
            var simulator = new WheelEventSimulator();
            simulator.dispatch(where[0], deltas);
            done();
        }
    };

    return Gestures;
}));
