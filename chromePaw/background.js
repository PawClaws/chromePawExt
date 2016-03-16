var init=(paw)=>{
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    
  if(request.action=='requestUpdate'){
      sendResponse({paw:paw.exportState()});
   }
   else if(request.action=='suggestUpdate'){
        paw=paw.importState(request.paw);
        init(paw);
        //var state=paw.exportState();
        //console.log(state);
        //sendResponse({paw:state});
        
   }
    
   })
   
    
  
 };
 
init(new Paw());



