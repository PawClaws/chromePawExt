$(document).ready(()=>{
    $($('.cfp-hotkeys-container').find('table')).hide();
    $($('.cfp-hotkeys-container').find('.cfp-hotkeys-close')).hide();
});
/*-------VIEW-INJECTION-------------------------------------------------------------------------*/
    //Set document as angular app and control
    $('html').attr("ng-app", "record");
    $('html').attr("ng-controller", "recordCtrl");       
    
    //Injected View
    var angularCode=
            [
                   '<div class="hidden" id="guiContainer" style="position:absolute!important; top:0!important; left:0!important; overflow:visible!important; width:100%; height:100%; background:none!important; z-index:100000!important; pointer-events:none!important;">', 
                   '<div id="dragBox" class="ui-widget-content allowEvents">',
                   '<div id="drawer" class="allowEvents">',
                   '<button id="btnRecord" style="margin-left: 4px;"  class="btn modern embossed-link allowEvents" ng-click="fn.toggleRecord()">{{m.btnMsg}}</button>',
                   '<button id="btnShowAll" style="margin-left: 4px;"  class="btn modern embossed-link allowEvents">Show All</button>',        
		           '<div class="script-border" ng-repeat="r in m.recordings">',
                   '<button id="playBtnId" class="btn modern embossed-link playBtn allowEvents" ng-disabled="!m.script.length || m.isRecording" ng-click="fn.playback(r)">Play</button>',
                   '<button class="btn modern embossed-link allowEvents" ng-disabled="!m.script.length || m.isRecording" ng-click="fn.del($index)">Delete</button>',
			       '<button class="btn modern embossed-link allowEvents" ng-disabled="!m.script.length || m.isRecording" ng-click="fn.hide($index)">Hide</button>',
			       '</br>',
                   '<input type="text" class = "mac" ng-model="r.name" ng-blur="fn.addGestureToPaw($index)" ng-focus="fn.removeGestureFromPaw($index)" ng-change="fn.generatePawScript()" required pattern="[a-zA-Z0-9]+" class="allowEvents"/>',
                   '</div></div></div></div>'
            ];
                               
    //$('body').append(angularCode.reduce((xi0,xi1)=>xi0+xi1));   
    //$('#dragBox').draggable();
    
/*-----------------------------------------------------------------------------------------------------*/   
/*---ANGULAR-CONTROLLER--------------------------------------------------------------------------------*/
    
    var paw = new Paw();
    angular.module('record', ['cfp.hotkeys']).config(['$compileProvider', function($compileProvider){
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob):/);}])
    .controller('recordCtrl', function($scope, $http, hotkeys) {
        
        hotkeys.add('r', 'Toggle Recording', function() {
            $scope.fn.toggleRecord();
        });

      hotkeys.add('p', 'Playback', function() {
            $scope.fn.playback(0);
        });        
        
        var tab = '    ';        
        var mouseDown = false; // move to top
        var eventsToRecord = ['click','scroll','contextmenu','mouseup','mousedown','mousemove','mousewheel'];
        $scope.m = {
            isRecording: false,
            btnMsg: 'Record',
            recording: [],
            recordings: [],
            script: null,
            relative: true,
            umd: 'None'
        };
        function copyTouches(ev) {
            var result = [];
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
        $scope.fn = {
            toggleRecord: function() {
                toggleEventListeners(!$scope.m.isRecording);
                $scope.m.isRecording = !$scope.m.isRecording;
                $scope.m.btnMsg = $scope.m.isRecording ? 'Stop' : 'Record';
                if (!$scope.m.isRecording) {
                    $scope.m.recording.data.unshift('$scope.m.recording.fn = function(options, done) {');
                    $scope.m.recording.data.push('            .then(done);');
                    $scope.m.recording.data.push('        }');
                    var code = recordingToCode($scope.m.recording.name, $scope.m.recording.data);
                    /*jshint -W061 */
                    eval(code); // creates fn
                    Train.mixFunctionInto(paw, $scope.m.recording.name, $scope.m.recording.fn);
                    $scope.fn.generatePawScript();
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
                }
            },
            playback: function(i) {
                var r=$scope.m.recordings[i];
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
                delete(paw[r.name]);},
            generatePawScript: function() {
                if ($scope.m.recordings.length > 0) {
                    var cmds = [];
                    var recording = null;
                    // Add the gestures object
                    cmds.push(tab + 'var gestures = {');
                    var batchlen = $scope.m.recordings.length;
                    for (var k = 0; k < batchlen; ++k) {
                        recording = $scope.m.recordings[k];
                        cmds.push(tab + tab + recording.name + ': ' + recording.fn.toString() + (k + 1 === batchlen ? '' : ','));}
                    cmds.push(tab + '};');
                    $scope.m.script = cmds.join('\n');}
                else {$scope.m.script = tab + 'var gestures = {};';}
                $scope.m.script = '/* paw script generated at ' + new Date() + ' */\n' + $scope.m.script;
                if ($scope.m.script) {
                    var data = {
                        filename: $scope.m.scriptName,
                        code: $scope.m.script
                    };
                    /*
                        SAVE OFF GENERATE SCRIPT HERE
                    */
                }
                
            },

        };
        $scope.fn.generatePawScript();
    });
    
    
/*-------------------------------------------------------------------------------------*/    

    
    








