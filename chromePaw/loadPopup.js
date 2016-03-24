/*-------VIEW-INJECTION------------------------*/
    //Set document as angular app and control
var paw=new Paw();
    var selector=$('[ng-app]')

    if(selector.length>0){

        alert('PawClaws Says: Recording is not currently available on pages built with Angular js. Playback is available manually via the altPlay event');

        jQuery(window).on('altPlay',(ev,script)=>{
            var altPlay=new Paw();
            Train.mixFunctionInto(altPlay,'altPlayScript', script);
            altPlay['altPlayScript'].call(altPlay);
        });

    }
else{

    $('html').attr("ng-app", "record");
    $('html').attr("ng-controller", "recordCtrl");


/*------Controller Instantiation----------------------------------*/
    var app=angular.module('record', ['cfp.hotkeys']);
    app.config(['$compileProvider', function($compileProvider){
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob):/);}]);
    app.controller('recordCtrl', function($scope, $http, hotkeys) {


      /*CUSTOM EVENTS*******************************************/


      jQuery(window).on('scriptPicker',function(){
        $scope.fn.toggleRecord();
      });

      jQuery(window).on('toggleRecord',function(){
        $scope.fn.toggleRecord();
      });
      jQuery(window).on('downloadPawScript',function(){
        $scope.fn.downloadPawScript();
      });
      jQuery(window).on('authorize',function(){
	$scope.fn.handleAuthClick();
      });
      //... 230 more lines ...
        hotkeys.add('esc', 'Toggle Recording', function() {
            $scope.fn.toggleRecord();
        });

      [0,1,2,3,4,5,6,7,8,9].forEach((e,i,a)=>{
          jQuery(window).on('play'+e.toString(),function(){
            if($scope.m.recordings[e]){
                $scope.fn.playback(e);
            }
          });
          hotkeys.add(e.toString(), 'Play recording #', function() {
            if($scope.m.recordings[e]){
                $scope.fn.playback(e);
            }
            })
          hotkeys.add('ctrl+'+e.toString(),'Save recording #',function(){
                if($scope.m.recordings[e]){
                    console.log($scope.fn.generateSpecificPawScript(e));
                }
          })
        })

        chrome.runtime.sendMessage({action:"requestUpdate"},function(res){
                if(res){
                    if(res.recordings){
                            $scope.m.recordings=res.recordings;


                    }
                }


            });




    /***********************************************************************/


        var sendUpdates=false;
        var tab = '';
        var mouseDown = false; // move to top
        var eventsToRecord = ['click','scroll','contextmenu','mouseup','mousedown','mousemove','mousewheel'];
        $scope.m = {
            isRecording: false,
            btnMsg: 'Record',
            recording: [],
            recordings: [],
            script: null,
            relative: true,
            umd: 'None',
            sendUpdates: false
        };
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
                code += '';
            }
            return code;
        }
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
                    $scope.m.recording.data.push(['.wait(', wait, ')']);
                }
            }
            $scope.m.lastEvent = Date.now();
            var touches = copyTouches(ev);

            // map to paw functions
            var evtype = ev.type;
            if (evtype === 'touchstart' || evtype === 'mousedown') {
                mouseDown = true;
                $scope.m.recording.data.push(['.touch(', touchesToString(touches), ')']);
            }
            else if (evtype === 'touchmove'  || evtype === 'mousemove') {
                if (mouseDown==true) {
                    $scope.m.recording.data.push(['.move(', touchesToString(touches), ')']);
                }
            }
            else if (evtype === 'touchend' || evtype === 'touchcancel' || evtype === 'mouseup') {
                mouseDown = false;
                $scope.m.recording.data.push(['.release()']);
            }
            else if (evtype === 'click') {
                $scope.m.recording.data.push(['.tap(', touchesToString(touches), ')']);
            }
            else if (evtype === 'mousewheel' || evtype === 'scroll') {
                $scope.m.recording.data.push([
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
                    $scope.m.recording.data.unshift('r.fn = function(options, done) {');
                    $scope.m.recording.data.push('.then(done);');
                    $scope.m.recording.data.push('}');




                    chrome.runtime.sendMessage({
                            action:'suggestUpdate',
                            recordings: $scope.m.recordings
                            },
                            function(res){


                            });
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
                    $scope.m.script = '';
                    $scope.m.recording.data.push('this');
                }
            },
            playback: function(i) {
                var r=$scope.m.recordings[i];
                var code = recordingToCode(r.name,r.data);

                    eval(code);
                    Train.mixFunctionInto(paw, r.name,r.fn);

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
	    downloadPawScript: function() {
                $scope.fn.generatePawScript();

                // download to filesystem, leaving in for the future

                var blob = new Blob([$scope.m.script], {
                    type: 'text/javascript'
                });
                var scriptURL = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.download = $scope.m.scriptName;
                a.href = scriptURL;
                a.target = '_blank';
                a.click();
            },

    /**
     * Initiate auth flow in response to user clicking authorize button.
     *
     * @param {Event} event Button click event.
     */
    /*handleAuthClick: function() {
	var CLIENT_ID = '216899417108-8thjf5om26hi720pocobscbveqqfdt25.apps.googleusercontent.com';
	var SCOPES = 'https://www.googleapis.com/auth/drive';
        gapi.auth.authorize(
            {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
            handleAuthResult);
        return false;
    },*/
            generatePawScript: function() {
                if ($scope.m.recordings.length > 0) {
                    var cmds = [];
                    var recording = null;
                    // Add the gestures object
                    cmds.push('{');
                    var batchlen = $scope.m.recordings.length;
                    for (var k = 0; k < batchlen; ++k) {
                        recording = $scope.m.recordings[k];


                        var rFunc=recording.fn.toString();

                        cmds.push('"'+recording.name +'"'+ ': ' + '"'+rFunc+'"' + (k + 1 === batchlen ? '' : ','));}
                    cmds.push('}');
                    $scope.m.script = cmds.join('');

                    }
                else {$scope.m.script = '{}';}
                //$scope.m.script = '/* paw script generated at ' + new Date() + ' */\n' + $scope.m.script;
                if ($scope.m.script) {
                    var data = {
                        filename: $scope.m.scriptName,
                        code: $scope.m.script
                    };

            }





            },
            generateSpecificPawScript: function(k) {

                    var cmds = [];
                    var recording = null;
                    // Add the gestures object
                    //cmds.push('{');


                        recording = $scope.m.recordings[k];


                        var rFunc=recording.fn.toString();

                        cmds.push('"'+rFunc+'"' + '');
                    //cmds.push('}');
                    return cmds.join('');

            }

        };

        $scope.fn.generatePawScript();



    });

    angular.element(document).ready(()=>{
        $($('.cfp-hotkeys-container').find('table')).hide();
        $($('.cfp-hotkeys-container').find('.cfp-hotkeys-close')).hide();


    });
/*-------------------------------------------------------------------------------------*/
}












