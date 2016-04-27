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
          downloadFile('0B6SuDw3PGAvDYlFDcTNzcEh3NmM',token,callback);
      });



   }

  else if(request.action=='save'){
      chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
          console.log("Blobbing some more");
          var blob = new Blob([request.data], {
              type: 'text/javascript'
          });
          result = insertFileIntoFolder('0B3BcNfReJqCZWU1nZlZNQnktQlU',blob,token,function(fileid){
              downloadFile(fileid.id, token, null);
          });




          downloadFile(result.id,token,null);
      });



  }

   });








