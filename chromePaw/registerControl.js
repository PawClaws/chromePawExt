var emitEventOnClick=(selector,event,callback,functionParams)=>{
        $(selector).click(()=>{
                chrome.tabs.executeScript({
                    "code":"jQuery(window).trigger('"+event+"',"+functionParams+")"
                },callback);
            });
}

$(document).ready(()=>{ 
    pawScript='function(done){this.touch("50% 20%").wait(40).drag("50% 40%").wait(40).drag("50% 20%").wait(40).release().then(done);}';
    emitEventOnClick('#btnRecord','toggleRecord',null,'[]');
    //emitEventOnClick('#btnPlay','altPlay',null,'['+pawScript+']');
    emitEventOnClick('#btnPlay','play0',null,'[]');
    emitEventOnClick('#download-button','downloadPawScript',null,'[]');
    //emitEventOnClick('#download-button','downloadPawScript',null,'[]');
});

 
                



