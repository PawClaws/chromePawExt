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

/* global module, DocumentTouch, NodeList */
(function(root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('paw/Train'), require('paw/Gestures'), require('paw/ViewportRelative'));
    }
    else if (typeof define === 'function' && define.amd) {
        define('paw/Paw', ['paw/Train', 'paw/Gestures', 'paw/ViewportRelative'], factory);
    }
    else {
        root.Paw = factory(root.Train, root.Gestures, root.ViewportRelative);
    }
}(this, function(Train, Gestures, ViewportRelative) {

    'use strict';

    var POINT_REGEX = /^\s*(top|left|right|center|bottom|\d+\.?\d*(px|%))\s+(top|left|right|center|bottom|\d+\.?\d*(px|%))\s*$/i;

    /*
     * Polyfill Array.isArray is if isn't there
     * From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
     */
    if (!Array.isArray) {
        Array.isArray = function(vArg) {
            var isArray;
            isArray = vArg instanceof Array;
            return isArray;
        };
    }

    /*
     * A config of the differet types of mouse events
     */
    var MOUSE_EVENTS = {
        start: 'mousedown',
        move: 'mousemove',
        end: 'mouseup',
        click: 'click'
    };

    /**
     * Create a Paw instance
     *
     * @class
     * @mixes Gestures
     * @constructor
     * @param {(object|object[])} mixins Objects whose functions will be mixed in to this Paw instance
     */

    function Paw(mixins) {
        this.showTouches = true;
        this.clearTouchIndicatorsAfter = 0; // > 0 will clear touch indicators that haven't been cleared after this much time
        this.touches = [];
        this.touchIndicators = [];
        this.isTouchSupported = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) ? true : false;
        this.hasMultiTouch = true;
        Train.mixObjectInto(this, Gestures);
        if (mixins) {
            if (!Array.isArray(mixins)) {
                mixins = [mixins];
            }
            for (var i = 0; i < mixins.length; i++) {
                if (typeof(mixins[i]) === 'object') {
                    Train.mixObjectInto(this, mixins[i]);
                }
            }
        }
        this.relativePositions = {};

        // Defaults for single finger gestures
        this.DEFAULT_TOUCH_LOCATION = '70% center';

        // Defaults for swipes
        this.DEFAULT_SWIPE_LOCATIONS = [
            ['70% 45%'],
            ['70% 95%']
        ];

        // Defaults for pinches
        this.DEFAULT_PINCH_LOCATIONS = [
            ['70% 45%', '70% 55%'],
            ['70% 40%', '70% 60%']
        ];

        // Default duration
        this.DEFAULT_DURATION = 300;

        // Default double tap duration
        this.DEFAULT_DOUBLE_TAP_DURATION = 120;
    }

    Paw.prototype.getDefaultTouchLocation = function() {
        return this.DEFAULT_TOUCH_LOCATION;
    };

    Paw.prototype.getDefaultSwipeLocations = function() {
        return this.DEFAULT_SWIPE_LOCATIONS;
    };

    Paw.prototype.getDefaultPinchLocations = function() {
        return this.DEFAULT_PINCH_LOCATIONS;
    };

    Paw.prototype.getDefaultDuration = function() {
        return this.DEFAULT_DURATION;
    };

    Paw.prototype.getDefaultDoubleTapDuration = function() {
        return this.DEFAULT_DOUBLE_TAP_DURATION;
    };

    /*
     * @param {(string|object)} where The default touch location. Used for tap, doubleTap, touch
     */
    Paw.prototype.setDefaultTouchLocation = function(where) {
        if (this.isPoint(where) || POINT_REGEX.test(where)) {
            this.DEFAULT_TOUCH_LOCATION = where;
        }
    };

    /*
     * @param {(string[]|object[])} arrayOfArrayOfPoints The default swipe locations. Used for swipe swipeUp swipeDown
     */
    Paw.prototype.setDefaultSwipeLocations = function(arrayOfArrayOfPoints) {
        this.DEFAULT_SWIPE_LOCATIONS = arrayOfArrayOfPoints;
    };

    /*
     * @param {(string[]|object[])} arrayOfArrayOfPoints The default pinch locations. Used for pinchIn pinchOut
     */
    Paw.prototype.setDefaultPinchLocations = function(arrayOfArrayOfPoints) {
        this.DEFAULT_PINCH_LOCATIONS = arrayOfArrayOfPoints;
    };

    /*
     * @param {Number} duration The default duration Used for swipe pinch wait
     */
    Paw.prototype.setDefaultDuration = function(duration) {
        if (duration >= 0) {
            this.DEFAULT_DURATION = duration;
        }
    };

    /*
     * @param {Number} duration The default duration Used for doubleTap
     */
    Paw.prototype.setDefaultDoubleTapDuration = function(duration) {
        if (duration >= 0) {
            this.DEFAULT_DOUBLE_TAP_DURATION = duration;
        }
    };

    /*
     * Make a copy of an object by serializing and deserializing it
     * @param {object} obj - The object to copy
     */
    Paw.prototype._copy = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    Paw.prototype.clearTouchIndicators = function() {
        for (var i = this.touchIndicators.length - 1; i >= 0; i--) {
            if (this.touchIndicators[i]) {
                this.touchIndicators[i].style.opacity = 0;
            }
        }
    };

    /*
     * Show the touches on screen.
     * @param object[] touches - Array of points
     * If touches is falsy or an empty array, it will remove the touch indicators from view
     */
    Paw.prototype.indicateTouches = function(touches) {
        var self = this,
            touch, i, id, ti, len;
        var cti = function() {
            self.clearTouchIndicators();
        };
        if (!this.showTouches) {
            return;
        }
        if (!touches || touches.length === 0) {
            setTimeout(cti, 60);
            return;
        }
        len = touches.length;

        for (i = 0; i < len; i++) {
            touch = touches[i];
            id = 'paw_touch_' + i;
            ti = this.touchIndicators[i];
            if (!ti) {
                ti = document.createElement('div');
                document.body.appendChild(ti);
                this.touchIndicators[i] = ti;
                ti.id = id;
                ti.className = 'finger';
                ti.style.position = 'absolute';
                ti.style.top = '0px';
                ti.style.left = '0px';
                ti.style.zIndex = '9999';
                ti.style.height = '30px';
                ti.style.width = '30px';
                ti.style.backgroundColor = 'red';
                ti.style.border = 'solid 2px #FFAAAA';
                ti.style.borderRadius = '20px';
                ti.style.pointerEvents = 'none';
            }
            if (ti.style.opacity !== '0.6') {
                ti.style.opacity = '0.6';
            }
            ti.style.transform = 'translate(' + (touch.x - 15) + 'px, ' + (touch.y - 15) + 'px)';

            if (self.clearTouchIndicatorsAfter > 0) {
                clearTimeout(ti.timeout);
                ti.timeout = setTimeout(cti, self.clearTouchIndicatorsAfter);
            }
        } // end loop
    };

    Paw.prototype._triggerClick = function() {
        this.indicateTouches(this.touches);
        //this._triggerMouse('start');
        //this._triggerMouse('end');
        this._triggerMouse('click');
        this.indicateTouches(); // clears touch indicators
    };

    Paw.prototype._triggerStart = function() {
        this.indicateTouches(this.touches);
        this._triggerTouch('start');
    };

    Paw.prototype._triggerEnd = function() {
        this._triggerTouch('end');
        if (this.touches.length > 0) {
            var point = this.touches[0];
            var el = document.elementFromPoint(point.x, point.y);
            this.element = el;
        }
        this.setTouches(); // removes touches
        this.indicateTouches(); // clears touch indicators
    };

    Paw.prototype._triggerMove = function() {
        this._triggerTouch('move');
        this.indicateTouches(this.touches);
    };

    /**
     * Creates a list of touches that is compatible with the browser.
     * It will use the built in document.createTouchList if available.
     *
     * @private
     * @method
     * @param {object[]} points An array of points
     * @returns {object[]}
     */
    Paw.prototype._createTouchList = function(points) {
        var len = points.length;
        var i = 0;
        var point;

        // Get the element to dispatch touches based on the location of the first touch
        if (len > 0) {
            point = points[0];
            var el = document.elementFromPoint(point.x, point.y);
            this.element = el;
        }

        if (document.createTouchList) {
            var _touches = [];
            for (; i < len; ++i) {
                point = points[i];
                var touch = document.createTouch(window,
                    this.element,
                    i,
                    point.x, point.y,
                    point.x, point.y
                );

                _touches.push(touch);
            }
            var result = document.createTouchList.apply(document, _touches);
            return result;
        }
        else {
            var touchlist = [];
            for (; i < len; ++i) {
                point = points[i];
                touchlist.push({
                    target: this.element,
                    identifier: Date.now() + i,
                    pageX: point.x,
                    pageY: point.y,
                    screenX: point.x,
                    screenY: point.y,
                    clientX: point.x,
                    clientY: point.y
                });
            }
            return touchlist;
        }
    };

    /*
     * trigger touch event
     * @param {string} type
     * @returns {Boolean}
     */
    Paw.prototype._triggerTouch = function(type) {
        var event = document.createEvent('Event');
        var touchlist = this._createTouchList((type === 'end' || type === 'cancel') ? [] : this.touches);

        event.initEvent('touch' + type, true, true);
        event.touches = touchlist;
        event.targetTouches = touchlist;
        event.changedTouches = touchlist;
        this.element = this.element || document.body;
        return this.element.dispatchEvent(event);
    };

    /*
     * trigger mouse event
     * @param {string} type
     * @returns {Boolean}
     */
    Paw.prototype._triggerMouse = function(type) {
        var touchList = this._createTouchList(this.touches);
        for (var i = 0; i < touchList.length; i++) {
            var ev = document.createEvent('MouseEvent');
            ev.initMouseEvent(MOUSE_EVENTS[type], true, true, window, 0,
                touchList[i].pageX, touchList[i].pageY, touchList[i].clientX, touchList[i].clientY,
                false, false, false, false,
                0, null);

            this.element = document.elementFromPoint(touchList[i].pageX, touchList[i].pageY) || document.body;
            this.element.dispatchEvent(ev);
        }
    };

    Paw.prototype.isDOMNode = function(obj) {
        return obj &&
            typeof obj === 'object' &&
            obj.nodeType &&
            obj.nodeType === 1;
    };

    Paw.prototype.isDOMNodeArray = function(obj) {
        return obj instanceof NodeList ||
            (Array.isArray(obj) &&
            obj.length > 0 &&
            this.isDOMNode(obj[0]));
    };

    Paw.prototype.isPoint = function(obj) {
        return typeof obj === 'object' &&
            obj.x !== null &&
            obj.x !== undefined &&
            obj.y !== null &&
            obj.y !== undefined;
    };

    // obj can be a string DOM selector, a DOM node, and array of DOM nodes, or a jQuery object

    Paw.prototype._getElements = function(obj) {
        var selection;
        var selector;
        if (typeof obj === 'string') {
            selection = document.querySelectorAll(obj);
            selector = obj;
        }
        // Allow obj to be a DOM node
        else if (this.isDOMNode(obj)) {
            selection = [obj];
            selector = obj;
        }
        // or a jQuery selector
        else if (obj.selector && obj.each) {
            selector = obj.selector;
            selection = [];
            obj.each(function(i, el) {
                selection.push(el);
            });
        }
        // or an array of DOM nodes
        else if (this.isDOMNodeArray(obj)) {
            selection = obj;
            selector = obj;
        }

        if (!selector || selection.length === 0) {
            throw new Error('Selector did not match anything:', selector);
        }
        return selection;
    };

    /*
     * Convert a string or jquery selector into touches
     */
    Paw.prototype._buildTouches = function(where) {
        var selection, i, k, wherek, vd;
        if (!where) {
            throw new Error('Parameter "where" is empty when building touches');
        }

        // make it an array if it is not
        if (!Array.isArray(where)) {
            where = [where];
        }

        // get the viewport dimensions once upfront
        vd = this.getViewportDimensions();

        for (k = 0; k < where.length; k++) {
            wherek = where[k];

            // if it looks like a point-string, convert relative values to pixels
            if (this.isPoint(wherek) || POINT_REGEX.test(wherek)) {
                where[k] = ViewportRelative.pointToPixels(wherek, vd);

                // assume it is a selector, or DOM node
            }
            else {
                selection = this._getElements(wherek);
                where.splice(k, 1); // remove the selector from the list

                // insert matched elements in the right spot
                for (i = 0; i < selection.length; i++) {
                    var bounds = selection[i].getBoundingClientRect();
                    where.splice(k, 0, {
                        x: bounds.left + (bounds.width / 2),
                        y: bounds.top + (bounds.height / 2)
                    });
                }
                k = k + (selection.length - 1);

            }
        }
        return where;
    };

    /*
     * Set touches
     * @param {object} touches Ex: {x: 1, y: 2} or [{x: 1, y: 2}, {x: 1, y: 2}]
     */
    Paw.prototype.setTouches = function(touches) {
        if (!touches) {
            this.touches.length = 0;
            return;
        }
        this.touches = this._copy(this._buildTouches(touches)); // copy
        return this.touches;
    };

    Paw.prototype.getViewportWidth = function() {
        if (window && window.innerWidth) {
            return window.innerWidth;
        }
        else if (window && window.document && window.document.body && window.document.body.offsetWidth) {
            return window.document.body.offsetWidth;
        }
        else {
            return 0;
        }
    };

    Paw.prototype.getViewportHeight = function() {
        if (window && window.innerHeight) {
            return window.innerHeight;
        }
        else if (window && window.document && window.document.body && window.document.body.offsetHeight) {
            return window.document.body.offsetHeight;
        }
        else {
            return 0;
        }
    };

    Paw.prototype.getViewportDimensions = function() {
        return {
            width: this.getViewportWidth(),
            height: this.getViewportHeight()
        };
    };

    return Paw;
}));
