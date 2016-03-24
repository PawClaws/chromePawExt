var paw=new Paw();
var recordings=[];

window.gapi_onload = function(){
    console.log('gapi loaded.', gapi.auth, gapi.client);

    // Do things you want with gapi.auth and gapi.client.
}


chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
    console.log(token);

});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

  if(request.action=='requestUpdate'){
      sendResponse({recordings:recordings});
   }
   else if(request.action=='suggestUpdate'){
        recordings=request.recordings;

        sendResponse({recordings:recordings});

   }
      else if(request.action=='upload-drive'){
      chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
          console.log(token);
          downloadFile('0B6SuDw3PGAvDWHpOVXlLcG9IRWc',token);
      });

   else if(request.action=='download-drive'){
      chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
          console.log(token);
          downloadFile('0B6SuDw3PGAvDWHpOVXlLcG9IRWc',token);
      });

   }
   });








