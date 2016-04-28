chrome.tabs.executeScript({"code":"jQuery(window).trigger('stopRecording',[])"});


var emitEventOnClick=(selector,event,callback,functionParams)=>{
        $(selector).click(()=>{
                chrome.tabs.executeScript({
                    "code":"jQuery(window).trigger('"+event+"',"+functionParams+")"
                },callback);
            });
}



var populateRecordingContainer=(o)=>{ 
    $('#recordingContainer').html('');
    console.log(o);
    o.forEach((e,i,a)=>{
		console.log(i.toString());
        var recObj=$('#abstractRecording').html();
        recObj=recObj.replace('_insertFileName',e.name);
        $('#recordingContainer').append(recObj);
    });
	console.log('20');
	$.makeArray($('#recordingContainer').children()).forEach((e,i,a)=>{
		console.log('22');
		$($(e).find('.btnPlay')).click(()=>{
			chrome.tabs.executeScript({"code":"jQuery(window).trigger('play"+i.toString()+"',[])"});
		});
		$($(e).find('.btnSave')).click(()=>{
			chrome.tabs.executeScript({"code":"jQuery(window).trigger('save"+i.toString()+"',[])"});
		});
		$($(e).find('.btnDelete')).click(()=>{
			chrome.tabs.executeScript({"code":"jQuery(window).trigger('del"+i.toString()+"',[])"},function(x){callContainerUpdate();});
			
			
		});
	});
	
};
chrome.runtime.sendMessage({action:'requestUpdate'},function(res){
    populateRecordingContainer(res.recordings);
});
var callContainerUpdate=()=>{
chrome.runtime.sendMessage({action:'requestUpdate'},function(res){
    populateRecordingContainer(res.recordings);
});
}    
$(document).ready(()=>{ 
    //pawScript='function(done){this.touch("50% 20%").wait(40).drag("50% 40%").wait(40).drag("50% 20%").wait(40).release().then(done);}';
    $('#recBtn').click(()=>{
		chrome.tabs.executeScript({"code":"jQuery(window).trigger('toggleRecord',[])"},function(x){callContainerUpdate();});
	
	});
    //emitEventOnClick('#btnPlay','altPlay',null,'['+pawScript+']');
    //emitEventOnClick('#authorize','authorize',null,'[]');
    //emitEventOnClick('#download-button','downloadPawScript',null,'[]');
    //emitEventOnClick('#download-button','downloadPawScript',null,'[]');
      var openFile = function(event) {
        var input = event.target;
        var reader = new FileReader();
        reader.onload = function(){
          var text = reader.result;			
			chrome.tabs.executeScript({"code":'jQuery(window).trigger("append'+''+'",["'+text.toString()+'"])'});
			callContainerUpdate();
        };
        reader.readAsText(input.files[0]);
      };    
    $('#fileInput').on('change',function(e){openFile(e)});        



});

 
                



