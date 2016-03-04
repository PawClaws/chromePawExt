    //Injected View
    var angularCode=
            [
                   '<div id="guiContainer" style="position:absolute!important; top:0!important; left:0!important; overflow:visible!important; width:100%; height:100%; background:none!important; z-index:100000!important; pointer-events:none!important;">', 
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
                               
    $('body').append(angularCode.reduce((xi0,xi1)=>xi0+xi1)); 
