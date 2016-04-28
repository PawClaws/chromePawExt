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
  
    
   });
   
   
  
 



