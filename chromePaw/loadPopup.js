$('html').attr("ng-app", "record");
$('html').attr("ng-controller", "recordCtrl");
$('head').append('<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes">');
     $.get(chrome.extension.getURL("popup.html"),function(d){
        var code=d.split('<body>')[1].split('</body>')[0];
        code+='</div>'
        code='<div id="guiContainer" style="position:absolute!important; top:0!important; left:0!important; overflow:visible!important; width:100%; height:100%; background:none!important; z-index:100000!important; pointer-events:none!important;">'+code
        $('body').append(code);
        $('#dragBox').draggable();
        
     });







