var emitEventOnClick=(selector,event,callback,functionParams)=>{
        $(selector).click(()=>{
                chrome.tabs.executeScript({
                    "code":"jQuery(window).trigger('"+event+"',"+functionParams+")"
                },callback);
            });
}
// Chrome.tabs.background. windows to get context of background.js
$(document).ready(()=>{
    pawScript='function(done){this.touch("50% 20%").wait(40).drag("50% 40%").wait(40).drag("50% 20%").wait(40).release().then(done);}';
    emitEventOnClick('#btnRecord','toggleRecord',null,'[]');
    //emitEventOnClick('#btnPlay','altPlay',null,'['+pawScript+']');
    emitEventOnClick('#btnPlay','play0',null,'[]');

$('#download-drive').click(function(){
    console.log("Attempting Download");
    chrome.runtime.sendMessage({action:"download-drive"},function(res){
    });
});
$('#upload-drive').click(function(){
    console.log("Attempting upload");
    chrome.runtime.sendMessage({action:"upload-drive"},function(res){
    });
});

});






