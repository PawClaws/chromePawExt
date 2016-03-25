var paw=new Paw();
var recordings=[];


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

  if(request.action=='requestUpdate'){
      sendResponse({recordings:recordings});
   }
   else if(request.action=='suggestUpdate'){
        recordings=request.recordings;

        sendResponse({recordings:recordings});

   }
      else if(request.action=='requestDownload'){
      chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
          console.log(token);
          downloadFile('0B3BcNfReJqCZVjZnTXBBWi1kbms',token);
      });



   }

  else if(request.action=='save'){
      chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
          console.log("Blobbing some more");
          var blob = new Blob([request.data], {
              type: 'text/javascript'
          });
          insertFile(blob,token);      });



  }

   });








