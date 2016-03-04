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

    var ViewportRelative = require('paw/ViewportRelative');
    var viewport = {
        width: 1024,
        height: 768
    };

    describe('ViewportRelative.pointToString', function() {

        it('should convert a point to a string correctly', function() {
            var result = ViewportRelative.pointToString({x:10, y:40});
            expect(result).toBe('10px 40px');

            result = ViewportRelative.pointToString({x:'10%', y:40});
            expect(result).toBe('10% 40px');

            result = ViewportRelative.pointToString({x:'10%', y:'40%'});
            expect(result).toBe('10% 40%');
        });

        it('should not convert objects that are not points', function() {
            var input = {not:'an', object: true};
            var result = ViewportRelative.pointToString(input);
            expect(result).toBe(input);

            expect(ViewportRelative.pointToString(0)).not.toBeDefined();
            expect(ViewportRelative.pointToString(null)).not.toBeDefined();
        });
    });

    describe('ViewportRelative.isOrderReversed', function() {

        it('should handle reversed x and y values', function() {
            expect(ViewportRelative.isOrderReversed({x:'top', y:'left'})).toBe(true);
            expect(ViewportRelative.isOrderReversed({x:'top', y:'right'})).toBe(true);
            expect(ViewportRelative.isOrderReversed({x:'top', y:'center'})).toBe(true);
            expect(ViewportRelative.isOrderReversed({x:'bottom', y:'left'})).toBe(true);
            expect(ViewportRelative.isOrderReversed({x:'bottom', y:'right'})).toBe(true);
            expect(ViewportRelative.isOrderReversed({x:'bottom', y:'center'})).toBe(true);
            expect(ViewportRelative.isOrderReversed({x:'top', y:'100px'})).toBe(true);
            expect(ViewportRelative.isOrderReversed({x:'top', y:'100'})).toBe(true);
            expect(ViewportRelative.isOrderReversed({x:'top', y: 100})).toBe(true);
            expect(ViewportRelative.isOrderReversed({x:'top', y:'50%'})).toBe(true);

            expect(ViewportRelative.isOrderReversed({x:'left', y:'top'})).toBe(false);
            expect(ViewportRelative.isOrderReversed({x:'right', y:'top'})).toBe(false);
            expect(ViewportRelative.isOrderReversed({x:'center', y:'top'})).toBe(false);
            expect(ViewportRelative.isOrderReversed({x:'left', y:'bottom'})).toBe(false);
            expect(ViewportRelative.isOrderReversed({x:'right', y:'bottom'})).toBe(false);
            expect(ViewportRelative.isOrderReversed({x:'center', y:'bottom'})).toBe(false);
            expect(ViewportRelative.isOrderReversed({x:'100', y:'top'})).toBe(false);
            expect(ViewportRelative.isOrderReversed({x:'100px', y:'top'})).toBe(false);
            expect(ViewportRelative.isOrderReversed({x: 100, y:'top'})).toBe(false);
            expect(ViewportRelative.isOrderReversed({x:'50%', y:'top'})).toBe(false);

            expect(ViewportRelative.isOrderReversed({x:'center', y:'right'})).toBe(true);
            expect(ViewportRelative.isOrderReversed({x:'center', y:'left'})).toBe(true);
            expect(ViewportRelative.isOrderReversed({x:'center', y:'center'})).toBe(false);

            expect(ViewportRelative.isOrderReversed({x:'50%', y:'20%'})).toBe(false);
            expect(ViewportRelative.isOrderReversed({x:'20', y:'100px'})).toBe(false);
            expect(ViewportRelative.isOrderReversed({x:'20%', y:'100px'})).toBe(false);
            expect(ViewportRelative.isOrderReversed({x:'20%', y:100})).toBe(false);
            expect(ViewportRelative.isOrderReversed({x:20, y:100})).toBe(false);

        });
    });


    describe('ViewportRelative.valueToPixels', function() {

        it('should handle bad input', function() {
            // cant' get these to work
            expect(ViewportRelative.valueToPixels).toBeDefined();
            expect(typeof ViewportRelative.valueToPixels === 'function').toBeTruthy();
            expect(ViewportRelative.valueToPixels('10%', 'x', null)).not.toBeDefined();
            expect(ViewportRelative.valueToPixels('10%', 'x', 'bogus')).not.toBeDefined();
            expect(ViewportRelative.valueToPixels('10%', 'x', {})).not.toBeDefined();
            expect(ViewportRelative.valueToPixels('10%', 'z', viewport)).not.toBeDefined();
            expect(ViewportRelative.valueToPixels('A%', 'x', viewport)).not.toBeDefined();
            expect(ViewportRelative.valueToPixels({}, 'x', viewport)).not.toBeDefined();
        });
        it('should handle percentages for x', function() {
            expect(ViewportRelative.valueToPixels('10%', 'x', viewport)).toBe(viewport.width / 10.0);
            expect(ViewportRelative.valueToPixels('0%', 'x', viewport)).toBe(0);
            expect(ViewportRelative.valueToPixels('100%', 'x', viewport)).toBe(viewport.width);
        });
        it('should handle percentages for y', function() {
            expect(ViewportRelative.valueToPixels('10%', 'y', viewport)).toBe(viewport.height / 10.0);
            expect(ViewportRelative.valueToPixels('0%', 'y', viewport)).toBe(0);
            expect(ViewportRelative.valueToPixels('100%', 'y', viewport)).toBe(viewport.height);
        });
        it('should handle numbers for x or y', function() {
            expect(ViewportRelative.valueToPixels('10', 'y', viewport)).toBe(10);
            expect(ViewportRelative.valueToPixels('0', 'y', viewport)).toBe(0);
            expect(ViewportRelative.valueToPixels('100', 'y', viewport)).toBe(100);
            expect(ViewportRelative.valueToPixels('10', 'x', viewport)).toBe(10);
            expect(ViewportRelative.valueToPixels('0', 'x', viewport)).toBe(0);
            expect(ViewportRelative.valueToPixels('100', 'x', viewport)).toBe(100);

            expect(ViewportRelative.valueToPixels('10px', 'y', viewport)).toBe(10);
            expect(ViewportRelative.valueToPixels('0px', 'y', viewport)).toBe(0);
            expect(ViewportRelative.valueToPixels('100px', 'y', viewport)).toBe(100);
            expect(ViewportRelative.valueToPixels('10px', 'x', viewport)).toBe(10);
            expect(ViewportRelative.valueToPixels('0px', 'x', viewport)).toBe(0);
            expect(ViewportRelative.valueToPixels('100px', 'x', viewport)).toBe(100);
        });
        it('should handle words for x', function() {
            expect(ViewportRelative.valueToPixels('top', 'x', viewport)).toBe(undefined);
            expect(ViewportRelative.valueToPixels('bottom', 'x', viewport)).toBe(undefined);
            expect(ViewportRelative.valueToPixels('left', 'x', viewport)).toBe(0);
            expect(ViewportRelative.valueToPixels('right', 'x', viewport)).toBe(viewport.width);
            expect(ViewportRelative.valueToPixels('center', 'x', viewport)).toBe(viewport.width / 2);
            expect(ViewportRelative.valueToPixels('bogus', 'x', viewport)).toBe(undefined);
        });
        it('should handle words for y', function() {
            expect(ViewportRelative.valueToPixels('top', 'y', viewport)).toBe(0);
            expect(ViewportRelative.valueToPixels('bottom', 'y', viewport)).toBe(768);
            expect(ViewportRelative.valueToPixels('left', 'y', viewport)).toBe(undefined);
            expect(ViewportRelative.valueToPixels('right', 'y', viewport)).toBe(undefined);
            expect(ViewportRelative.valueToPixels('center', 'y', viewport)).toBe(384);
            expect(ViewportRelative.valueToPixels('bogus', 'y', viewport)).toBe(undefined);
        });
    });

    describe('ViewportRelative.pointToPixels', function() {

        it('should handle points with x,y as numbers', function() {
            var point = { x: 101, y: 201 };
            var result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(101);
            expect(result.y).toBe(201);
        });
        it('should handle points with x,y as a string with 2 pixel numbers', function() {
            var point = '101 201';
            var result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(101);
            expect(result.y).toBe(201);
        });
        it('should handle points with x,y as a string with 2 pixel numbers with px units', function() {
            var point = '101px 201px';
            var result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(101);
            expect(result.y).toBe(201);
        });
        it('should handle points with x,y as a string with 2 percentage numbers', function() {
            var point = '20% 50%';
            var result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(204.8);
            expect(result.y).toBe(384);
        });
        it('should handle points with x,y as a string with mixed numbers', function() {
            var point = '123 50%';
            var result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(123);
            expect(result.y).toBe(384);
        });
        it('should handle points with x,y as a string with two words', function() {
            // top row
            var point = 'left top';
            var result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(0);
            expect(result.y).toBe(0);

            point = 'right top';
            result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(1024);
            expect(result.y).toBe(0);

            point = 'center top';
            result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(512);
            expect(result.y).toBe(0);

            // middle row
            point = 'left center';
            result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(0);
            expect(result.y).toBe(384);

            point = 'right center';
            result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(1024);
            expect(result.y).toBe(384);

            point = 'center center';
            result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(512);
            expect(result.y).toBe(384);

            // bottom row
            point = 'left bottom';
            result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(0);
            expect(result.y).toBe(768);

            point = 'right bottom';
            result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(1024);
            expect(result.y).toBe(768);

            point = 'center bottom';
            result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(512);
            expect(result.y).toBe(768);

        });

        it('should handle points with x,y as a string with two words in the wrong order', function() {
            // top row
            var point = 'bottom right';
            var result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(1024);
            expect(result.y).toBe(768);

            point = 'center right';
            result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(1024);
            expect(result.y).toBe(384);
        });

        it('should handle points with x,y as a string with two words of mixed types', function() {
            // top row
            var point = 'bottom 100%';
            var result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(1024);
            expect(result.y).toBe(768);

            point = 'center 10%';
            result = ViewportRelative.pointToPixels(point, viewport);
            expect(result.x).toBe(512);
            expect(result.y).toBe(76.8);
        });
    });

    describe('ViewportRelative.pointToPercent', function() {

        it('should convert a point in pixels to percentage values', function() {

            var point = '1024 768';
            var result = ViewportRelative.pointToPercent(point, viewport);
            expect(result.x).toBe('100%');
            expect(result.y).toBe('100%');

            point = '0 0';
            result = ViewportRelative.pointToPercent(point, viewport);
            expect(result.x).toBe('0%');
            expect(result.y).toBe('0%');

            point = '512 384';
            result = ViewportRelative.pointToPercent(point, viewport);
            expect(result.x).toBe('50%');
            expect(result.y).toBe('50%');
        });
    });
    describe('ViewportRelative.normalizePoint', function() {

        it('should normalize a point', function() {
            var result = ViewportRelative.normalizePoint('');
            expect(result.x).toBeDefined();
            expect(result.y).toBeDefined();
            expect(result.x).toBe('center');
            expect(result.y).toBe('center');

            result = ViewportRelative.normalizePoint(null);
            expect(result.x).toBeDefined();
            expect(result.y).toBeDefined();
            expect(result.x).toBe('center');
            expect(result.y).toBe('center');

            result = ViewportRelative.normalizePoint(' TOP  center  ');
            expect(result.x).toBeDefined();
            expect(result.y).toBeDefined();
            expect(result.x).toBe('top');
            expect(result.y).toBe('center');
        });
    });
});
