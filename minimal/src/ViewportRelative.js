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
        define('paw/ViewportRelative', [], factory);
    }
    else {
        root.ViewportRelative = factory();
    }
}(this, function() {

    'use strict';

    var supportedWords = {
        'x': {
            'left': 0,
            'right': 1,
            'center': 0.5
        },
        'y': {
            'top': 0,
            'bottom': 1,
            'center': 0.5
        }
    };

    function normalizePoint(point) {
        if (!point) {
            point = {
                x: 'center',
                y: 'center'
            };
        }
        if (typeof(point) === 'string') {
            var pointSplit = point.trim().split(/\s+/g);
            point = {
                x: (pointSplit[0]).toLowerCase(),
                y: (pointSplit[1] || '').toLowerCase()
            };
            point.y = point.y || 'center';
        }
        return point;
    }

    function isOrderReversed(point) {
        var xVal = supportedWords.x[point.x];
        var yVal = supportedWords.y[point.y];
        var yRevVal = supportedWords.y[point.x];
        var xRevVal = supportedWords.x[point.y];

        // see if the word gives away the position
        // these will be true if definitely the right word
        // false if not, and null if maybe aka could be either (ie center)

        var xIsX = xVal    === 1 || xVal    === 0; // left or right are first
        var yIsY = yVal    === 1 || yVal    === 0; // top or bottom are second
        var xIsY = yRevVal === 1 || yRevVal === 0; // top or bottom are first
        var yIsX = xRevVal === 1 || xRevVal === 0; // left or right are second

        // update with 'center' being indeterminate
        if (xVal === 0.5) {
            xIsX = null;
        }
        if (yVal === 0.5) {
            yIsY = null;
        }
        if (xRevVal === 0.5) {
            yIsX = null;
        }
        if (yRevVal === 0.5) {
            xIsY = null;
        }

        // we return true if we can for sure say that the arguments
        // are reversed, otherwise assume they are in x,y order
        if (xIsY === true && !yIsY) {
            return true;
        }
        if (yIsX === true && !xIsY) {
            return true;
        }
        return false;
    }

    function valueToPixels(maybeRelativeValue, axis, viewportDimensions) {
        var type = typeof(maybeRelativeValue);
        var max;
        var percent;
        var result;
        var wordMultiplier;

        if (type === 'number') {
            return maybeRelativeValue;
        }

        var num = Number(maybeRelativeValue);
        if (!isNaN(num)) {
            return num;
        }

        // check our inputs
        if (!viewportDimensions || typeof viewportDimensions !== 'object') {
            // throw 'Viewport Dimensions are required';
            return undefined;
        }
        if (!(viewportDimensions.width >= 0 && viewportDimensions.height >= 0)) {
            //throw 'Viewport width and height must be >= 0';
            return undefined;
        }
        if (!(axis === 'x' || axis === 'y')) {
            //throw 'Axis must be either x or y';
            return undefined;
        }
        if (type === 'string') {
            // trim and lowercase the input
            maybeRelativeValue = maybeRelativeValue.trim().toLowerCase();
            max = axis === 'x' ? viewportDimensions.width : viewportDimensions.height;

            // if it is a percentage
            if (maybeRelativeValue.indexOf('%') === maybeRelativeValue.length - 1) {
                maybeRelativeValue = maybeRelativeValue.replace('%', '');
                percent = Number(maybeRelativeValue) / 100.0;
                if (isNaN(percent)) {
                    //throw 'Relative value not in expected ##% format';
                    return undefined;
                }

                result = Math.round(max * percent * 1000) / 1000;
            } else if (maybeRelativeValue.indexOf('px') === maybeRelativeValue.length - 2) {
                maybeRelativeValue = maybeRelativeValue.replace('px', '');
                result = Number(maybeRelativeValue);
                if (isNaN(result)) {
                    return undefined;
                }
            } else {
                wordMultiplier = supportedWords[axis][maybeRelativeValue];
                // if it is a supported word
                if (wordMultiplier !== undefined) {
                    result = wordMultiplier * max;
                } else {
                    maybeRelativeValue = Number(maybeRelativeValue);
                    if (!isNaN(maybeRelativeValue)) {
                        result = maybeRelativeValue;
                    }
                }
            }
        }

        return result;
    }

    /*
     * @param {object} point the point to convert
     * @return a point that has x,y properties as pixels
     */
    function pointToPixels(point, viewportDimensions) {
        point = normalizePoint(point);

        var xAxis = 'x';
        var yAxis = 'y';
        var reversed = isOrderReversed(point);
        if (reversed) {
            xAxis = 'y';
            yAxis = 'x';
        }
        var xVal = valueToPixels(point.x, xAxis, viewportDimensions);
        var yVal = valueToPixels(point.y, yAxis, viewportDimensions);

        // if the order is reversed, swap variables
        if (reversed) {
            var temp = xVal;
            xVal = yVal;
            yVal = temp;
        }
        // set the x,y values
        point.x = xVal;
        point.y = yVal;

        return point;
    }

    function pointToPercent(point, viewportDimensions) {
        point = normalizePoint(point);
        point.x = (point.x / viewportDimensions.width * 100);
        point.y = (point.y / viewportDimensions.height * 100);
        point.x = (Math.round(point.x * 1000) / 1000) + '%';
        point.y = (Math.round(point.y * 1000) / 1000) + '%';
        return point;
    }

    function pointToString(point) {
        if (!point) {
            return undefined;
        }
        if (point && point.x !== null && point.x !== undefined && point.y !== null && point.y !== undefined) {
            if (typeof point.x === 'number') {
                point.x = point.x + 'px';
            }
            if (typeof point.y === 'number') {
                point.y = point.y + 'px';
            }
            return point.x + ' ' + point.y;
        }
        return point;
    }

    // export an object with the public functions on it
    return {
        normalizePoint: normalizePoint,
        isOrderReversed: isOrderReversed,
        valueToPixels: valueToPixels,
        pointToPixels: pointToPixels,
        pointToPercent: pointToPercent,
        pointToString: pointToString
    };

}));
