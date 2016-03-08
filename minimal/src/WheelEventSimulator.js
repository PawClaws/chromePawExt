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
        module.exports = factory();
    }
    else if (typeof define === 'function' && define.amd) {
        define('paw/WheelEventSimulator', [], factory);
    }
    else {
        root.WheelEventSimulator = factory();
    }
}(this, function() {

    /**
     * WheelEventSimulator is designed for use in modern browsers (FF6+, IE9+).
     * Polyfill CustomEvent support for use when dispatching events.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#Browser_compatibility
     */
    (function polyfillCustomEventConstructor() {
        try {
            return new CustomEvent('?');
        }
        catch (error) {
            function CustomEventPolyfill(event, params) {
                params = params || { bubbles: false, cancelable: false, detail: undefined };
                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            }

            CustomEventPolyfill.prototype = window.Event.prototype;

            window.CustomEvent = CustomEventPolyfill;
        }
    }());

    var defaultDependencies = {
        window: window
    };

    /**
     * Good reading:
     * https://developer.mozilla.org/en-US/docs/Web/Reference/Events/wheel#bc1
     * http://stackoverflow.com/questions/10821985/detecting-mousewheel-on-the-x-axis-left-and-right-with-javascript
     *
     * Cut-and-pasted from wf-common. Depending on wf-common would introduce
     * a lot of pain bringing in its dependencies and switching the UMD headers
     * used here.
     */
    function detectMouseWheelEvent(document) {
        // Modern browsers support "wheel", even IE9+;
        // however, IE will return false when checking for 'onwheel', so
        // we need to check the documentMode property.
        if ('onwheel' in document || document.documentMode >= 9) {
            return 'wheel';
        }
        // Webkit and IE8- support at least 'mousewheel'
        else if ('onmousewheel' in document) {
            return 'mousewheel';
        }
        // let's assume that remaining browsers are older Firefox
        else {
            return 'DOMMouseScroll';
        }
    }

    /**
     * WheelEventSimulator is a utility to create and dispatch browser-specific wheel events.
     *
     * @constructor
     */
    var WheelEventSimulator = function(dependencies) {
        dependencies = dependencies || {};
        var settings = {
            window: dependencies.window || defaultDependencies.window
        };

        this.window = settings.window;
        this.eventName = detectMouseWheelEvent(settings.window.document);
    };

    WheelEventSimulator.prototype = {

        /**
         * Dispatch a wheel event on the targetOrPoint with the given options.
         *
         * @param {HTMLElement|{x:Number, y:Number}} targetOrPoint
         *     An HTMLElement or the screen position to target.
         * @param {Object} [options]
         * @param {Number} [options.deltaX] The wheel delta along the x-axis.
         * @param {Number} [options.deltaY] The wheel delta along the y-axis.
         */
        dispatch: function(targetOrPoint, options) {
            options = options || {};
            var settings = {
                deltaX: options.deltaX || 0,
                deltaY: options.deltaY || 0
            };

            var evt;
            var eventName = this.eventName;

            if (eventName === 'wheel') {
                // CF: https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent
                // delta values are signed such that positive is up.
                evt = new CustomEvent(eventName, { bubbles: true, cancelable: true });
                evt.delta = settings.deltaX || settings.deltaY;
                evt.deltaX = settings.deltaX;
                evt.deltaY = settings.deltaY;
                evt.deltaZ = 0;
                evt.deltaMode = 0x00;
            }
            else if (eventName === 'mousewheel') {
                // cf: https://developer.mozilla.org/en-US/docs/Web/API/MouseWheelEvent
                // wheelDelta values are inverted and signed such that negative is up.
                evt = new CustomEvent(eventName);
                evt.wheelDelta = -(settings.deltaX || settings.deltaY);
                evt.wheelDeltaX = -settings.deltaX;
                evt.wheelDeltaY = -settings.deltaY;
            }
            else {
                throw new Error('Your browser is not supported by WheelEventSimulator.');
            }

            var target;
            if (targetOrPoint instanceof HTMLElement) {
                target = targetOrPoint;
            }
            else {
                target = document.elementFromPoint(targetOrPoint.x, targetOrPoint.y);
            }
            target.dispatchEvent(evt);
        }
    };

    return WheelEventSimulator;
}));
