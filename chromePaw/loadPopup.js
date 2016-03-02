$(document).ready(()=>{

        $('html').attr("ng-app", "record");
        $('html').attr("ng-controller", "recordCtrl");

        //$('head').append('<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes">');        
        var angularCode=[ '<div id="dragBox" class="ui-widget-content allowEvents">',
                   '<div id="drawer" class="allowEvents">',
                   '<button id="btnRecord" style="margin-left: 4px;"  class="btn modern embossed-link allowEvents" ng-click="fn.toggleRecord()">{{m.btnMsg}}</button>',
                   '<button id="btnShowAll" style="margin-left: 4px;"  class="btn modern embossed-link allowEvents">Show All</button>',        
		           '<div class="script-border" ng-repeat="r in m.recordings">',
                   '<button id="playBtnId" class="btn modern embossed-link playBtn allowEvents" ng-disabled="!m.script.length || m.isRecording" ng-click="fn.playback(r)">Play</button>',
                   '<button class="btn modern embossed-link allowEvents" ng-disabled="!m.script.length || m.isRecording" ng-click="fn.del($index)">Delete</button>',
			       '<button class="btn modern embossed-link allowEvents" ng-disabled="!m.script.length || m.isRecording" ng-click="fn.hide($index)">Hide</button>',
			       '</br>',
			       'Paw Script Filename:',
			       '</br>',
                   '<input type="text" class = "mac" ng-model="r.name" ng-blur="fn.addGestureToPaw($index)" ng-focus="fn.removeGestureFromPaw($index)" ng-change="fn.generatePawScript()" required pattern="[a-zA-Z0-9]+" class="allowEvents"/>',
                   //'<label><input style="display:none" type="checkbox" ng-model="m.relative"/></label>',
                   //'JS Module System:',
		           //'</br>',
                   //'<label><input type="radio" class="allowEvents" ng-model="m.umd" value="" ng-change="fn.generatePawScript()"/> None </label>',
                   //'<label><input type="radio" class="allowEvents" ng-model="m.umd" value="AMD" ng-change="fn.generatePawScript()"/> AMD </label>',
                   //'<label><input type="radio" class="allowEvents" ng-model="m.umd" value="UMD" ng-change="fn.generatePawScript()"/> UMD </label>',
                   //'<textarea style="display:none" class="js" ng-model="m.script" width="100%"></textarea>',
                   '</div>',
                   '</div>',    
                   '</div>'];
        var code=angularCode.reduce((xi0,xi1)=>xi0+xi1);
                   
                   
        code+=' </div> '
        code=' <div id="guiContainer" style="position:absolute!important; top:0!important; left:0!important; overflow:visible!important; width:100%; height:100%; background:none!important; z-index:100000!important; pointer-events:none!important;"> '+code
        $('body').append(code);
        
        
            $('#dragBox').draggable();

   
});







