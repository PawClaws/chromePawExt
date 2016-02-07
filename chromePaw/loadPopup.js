document.onreadystatechange = function () {
  if (document.readyState == "interactive") {

     document.getElementsByTagName('html')[0].setAttribute("ng-app", "record");
     document.getElementsByTagName('html')[0].setAttribute("ng-controller", "recordCtrl");
     document.body.innerHTML+='<div style="height:100vh;width:100vw;"><object style="height:100vh;width:100vw;" type="text/html" data="'+chrome.extension.getURL("popup.html")+'"></object></div>';
  }
}






