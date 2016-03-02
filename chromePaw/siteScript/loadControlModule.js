
    /* global angular, Paw, Train, ViewportRelative */
var paw = new Paw();
angular.module('record', ['cfp.hotkeys'])
    .config([
        '$compileProvider',
        function($compileProvider) {
            // Added to allow blob URLs
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob):/);
        }
    ])
    .controller('recordCtrl', function($scope, $http, hotkeys) {

        hotkeys.add('r', 'Toggle Recording', function() {
            $scope.fn.toggleRecord();
        });
        hotkeys.add('n', 'Next Recording', function() {
            if ($scope.m.isRecording) {
                $scope.fn.toggleRecord();
                $scope.fn.toggleRecord();
            }
        });
        hotkeys.add('esc', 'Stop Recording', function() {
            if ($scope.m.isRecording) {
                $scope.fn.toggleRecord();
            }
        });

        var tab = '    ';
        var umdHeader =
            '/* global module */\n' +
            '(function(root, factory) {\n' +
            tab + 'if (typeof exports === \'object\') {\n' +
            tab + tab + 'module.exports = factory();\n' +
            tab + '}\n' +
            tab + 'else if (typeof define === \'function\' && define.amd) {\n' +
            tab + tab + 'define(\'paw/CustomGestures\',[], factory); // You may want to change the require path/name\n' +
            tab + '}\n' +
            tab + 'else {\n' +
            tab + tab + 'root.CustomGestures = factory(); // You may want to change the global var name\n' +
            tab + '}\n' +
            '}(this, function() {\n' +
            '\n' +
            tab + '\'use strict\';\n';

        var umdFooter = '\n' + tab + 'return gestures;\n}));\n';

        var amdHeader = 'define(function(/* require */) {\n';
        var amdFooter = '\n' + tab + 'return gestures;\n});\n';
        var autoStopInterval;
        var mouseDown = false; // move to top
        var eventsToRecord = [
            'click',
            'scroll',
            'contextmenu',
            'mouseup',
            'mousedown',
            'mousemove',
            'mousewheel',
            'touchstart',
            'touchend',
            'touchmove',
            'touchcancel'
        ];

        // View Model
        $scope.m = {
            secondsLeft: 0,
            isRecording: false,
            btnMsg: 'Record',
            msg: 'Press ESC to stop recording',
            recording: [],
            recordings: [],
            script: null,
            relative: true,
            umd: null
        };

        function autoStop() {
            //var left = $scope.m.stopAt - Date.now();
            //$scope.$apply(function() {
            //    if (left <= 0) {
            //        $scope.fn.toggleRecord();
            //    }
            //    else {
            //        $scope.m.secondsLeft = Math.ceil(left / 1000);
            //    }
            //});
            return;
        }

        function copyTouches(ev) {
            var result = [];
            //console.log(ev);
            var touches = ev.touches;
            if (touches) {
                var len = touches.length;
                for (var i = 0; i < len; i++) {
                    result.push({
                        x: touches[i].pageX,
                        y: touches[i].pageY,
                    });
                }
            }
            else {
                result.push({
                    x: ev.pageX,
                    y: ev.pageY,
                });
            }
            return result;
        }

        /**
         * Convert touches to js code string. Slightly different than JSON.stringify (no quotes)
         * @param {object} touches x,y object (point) or and array of points
         */

        function touchesToString(touches) {
            var newpoint, vd, i;
            if (!touches) {
                return '';
            }

            vd = paw.getViewportDimensions();

            for (i = 0; i < touches.length; i++) {
                newpoint = touches[i];
                if ($scope.m.relative) {
                    newpoint = ViewportRelative.pointToPercent(newpoint, vd);
                }
                newpoint = ViewportRelative.pointToString(newpoint);
                touches[i] = newpoint;
            }
            if (touches.length === 1) {
                touches = touches[0];
            }
            return JSON.stringify(touches).replace(/\"/g, '\'');
        }

        function record(ev) {
            ev.preventDefault();
            var wait = 0;
            if ($scope.m.lastEvent) {
                wait = Date.now() - $scope.m.lastEvent;
                $scope.m.stopAt = Date.now() + 3100;
            }
            if (wait > 0) {
                // just increase the wait time if the previous record is a wait too
                var prevRecord = $scope.m.recording.data[$scope.m.recording.data.length - 1];
                if (prevRecord && prevRecord[1] === '.wait(') {
                    prevRecord[2] += wait;
                } else {
                    $scope.m.recording.data.push(['            ', '.wait(', wait, ')']);
                }
            }
            $scope.m.lastEvent = Date.now();
            var touches = copyTouches(ev);

            // map to paw functions
            var evtype = ev.type;
            if (evtype === 'touchstart' || evtype === 'mousedown') {
                mouseDown = true;
                $scope.m.recording.data.push(['            ', '.touch(', touchesToString(touches), ')']);
            }
            else if (evtype === 'touchmove'  || evtype === 'mousemove') {
                if (mouseDown==true) {
                    $scope.m.recording.data.push(['            ', '.move(', touchesToString(touches), ')']);
                }
            }
            else if (evtype === 'touchend' || evtype === 'touchcancel' || evtype === 'mouseup') {
                mouseDown = false;
                $scope.m.recording.data.push(['            ', '.release()']);
            }
            else if (evtype === 'click') {
                $scope.m.recording.data.push(['            ', '.tap(', touchesToString(touches), ')']);
            }
            else if (evtype === 'mousewheel' || evtype === 'scroll') {
                $scope.m.recording.data.push([
                    '            ',
                    '.wheel(',
                    touchesToString(touches),
                    ', { deltaX: ',
                    ev.deltaX,
                    ', deltaY: ',
                    ev.deltaY,
                    '})'
                ]);
            } else {
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                console.log(ev);
                console.log('-------------------------------');
            }
        }

        function recordingToCode(name, records) {
            var code = '';
            var first = true;
            for (var i = 0; i < records.length; i++) {
                var line = records[i];
                if (Array.isArray(line)) {
                    if (first && line[1] === '.wait(') {
                        first = false;
                        continue;
                    }
                    first = false;
                    code  += line.join('');
                }
                if (typeof(line) === 'string') {
                    code  += line;
                }
                code += '\n';
            }
            return code;
        }

        function cancelEvent(event) {
            event.preventDefault();
        }

        function toggleEventListeners(enable) {
            var fnToCall = enable ? 'addEventListener' : 'removeEventListener';
            if (enable) {
                window.addEventListener('touchmove', cancelEvent);
            } else {
                window.removeEventListener('touchmove', cancelEvent);
            }

            for (var i = 0; i < eventsToRecord.length; i++) {
                var key = eventsToRecord[i];
                window[fnToCall](key, record);
            }
        }

        // Functions available to be called from the view
        $scope.fn = {
            toggleRecord: function() {
                toggleEventListeners(!$scope.m.isRecording);
                $scope.m.isRecording = !$scope.m.isRecording;
                $scope.m.btnMsg = $scope.m.isRecording ? 'Stop' : 'Record';

                if (!$scope.m.isRecording) {

                    // stopped recording
                    $scope.m.recording.data.unshift('$scope.m.recording.fn = function(options, done) {');
                    $scope.m.recording.data.push('            .then(done);');
                    $scope.m.recording.data.push('        }');

                    var code = recordingToCode($scope.m.recording.name, $scope.m.recording.data);

                    /*jshint -W061 */
                    eval(code); // creates fn
                    Train.mixFunctionInto(paw, $scope.m.recording.name, $scope.m.recording.fn);

                    $scope.fn.generatePawScript();
                    $scope.m.stopAt = null;
                    $scope.m.secondsLeft = 0;
                    clearTimeout(autoStopInterval);
                }
                else {
                    // start recording, clear everything
                    var name = 'gesture' + ($scope.m.recordings.length + 1);
                    $scope.m.recording = {
                        name: name,
                        data: [],
                        fn: null
                    };
                    $scope.m.recordings.push($scope.m.recording);
                    $scope.m.lastEvent = null;
                    $scope.m.script = '/* Nothing here yet */';
                    $scope.m.recording.data.push('            this');
                    $scope.m.stopAt = Date.now() + 5100;
                    autoStopInterval = setInterval(autoStop, 400);
                    $scope.m.secondsLeft = 5;
                }
            },
            playback: function(r) {
                paw[r.name].call(paw);
            },
            del: function(i) {
                var r = $scope.m.recordings[i];
                delete(paw[r.name]);
                $scope.m.recordings.splice(i, 1);
                $scope.fn.generatePawScript();
            },
            addGestureToPaw: function(i) {
                var r = $scope.m.recordings[i];
                Train.mixFunctionInto(paw, r.name, r.fn);
            },
            removeGestureFromPaw: function(i) {
                var r = $scope.m.recordings[i];
                delete(paw[r.name]);
            },
            downloadPawScript: function() {
                $scope.fn.generatePawScript();

                // download to filesystem, leaving in for the future
                /*
                var blob = new Blob([$scope.m.script], {
                    type: 'text/javascript'
                });
                var scriptURL = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.download = $scope.m.scriptName;
                a.href = scriptURL;
                a.target = '_blank';
                a.click();
                */
            },
            generatePawScript: function() {
                if ($scope.m.recordings.length > 0) {
                    var cmds = [];
                    var recording = null;

                    // Add the gestures object
                    cmds.push(tab + 'var gestures = {');
                    var batchlen = $scope.m.recordings.length;
                    for (var k = 0; k < batchlen; ++k) {
                        recording = $scope.m.recordings[k];
                        cmds.push(tab + tab + recording.name + ': ' + recording.fn.toString() + (k + 1 === batchlen ? '' : ','));
                    }
                    cmds.push(tab + '};');

                    $scope.m.script = cmds.join('\n');
                }
                else {
                    $scope.m.script = tab + 'var gestures = {};';
                }

                // If they want a UMD header, add one
                if ($scope.m.umd) {
                    if ($scope.m.umd === 'AMD') {
                        $scope.m.script = amdHeader + $scope.m.script + amdFooter;
                    }
                    if ($scope.m.umd === 'UMD') {
                        $scope.m.script = umdHeader + $scope.m.script + umdFooter;
                    }
                }
                $scope.m.script = '/* paw script generated at ' + new Date() + ' */\n' + $scope.m.script;

                if ($scope.m.script) {
                    // log it to the console
                    console.log($scope.m.script);

                    // send to catcher
                    var data = {
                        filename: $scope.m.scriptName,
                        code: $scope.m.script
                    };
                    /*
                        SAVE OFF GENERATE SCRIPT HERE
                    */
                }
            }
        };
        $scope.fn.generatePawScript();
    });

