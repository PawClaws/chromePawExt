        document.getElementsByTagName('html')[0].setAttribute("ng-app", "record");
     document.getElementsByTagName('html')[0].setAttribute("ng-controller", "recordCtrl");

     $.get(chrome.extension.getURL("popup.html"),function(d){
        var code=d.split('<body>')[1].split('</body>')[0];
        code+='</div>'
        code='<div id="guiContainer" style="position:absolute!important; top:0!important; left:0!important; overflow:visible!important; width:100%; height:100%; background:none!important; z-index:100000!important; pointer-events:none!important;">'+code
        $('body').append(code);
        $('#dragBox').draggable();
     });

     //document.getElementsByTagName('html')[0].setAttribute("style", "margin:50px!important;");
     //document.getElementsByTagName('html')[0].setAttribute('class','ng-scope');
     //document.body.innerHTML+= type="text/html" data="'+chrome.extension.getURL("popup.html")+'"></object>';






