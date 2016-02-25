document.onreadystatechange = function () {
  if (document.readyState == "interactive") {

     //document.getElementsByTagName('html')[0].setAttribute("ng-app", "record");
     //document.getElementsByTagName('html')[0].setAttribute("ng-controller", "recordCtrl");
     //document.getElementsByTagName('html')[0].setAttribute("style", "margin:50px!important;");
     //document.getElementsByTagName('html')[0].setAttribute('class','ng-scope');
     document.body.innerHTML+='<object style="position:absolute!important; top:0!important; left:0!important; height:100%!important; width:100%!important; background-color:rgba(0,0,0,0)!important; z-index:100!important;" type="text/html" data="'+chrome.extension.getURL("popup.html")+'"></object>';
  }
}






