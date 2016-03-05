var emitEventOnClick=(selector,event)=>{
        $(selector).click(()=>{
                chrome.tabs.executeScript({
                    "code":"jQuery(window).trigger('"+event+"')"
                });
            });
}
$(document).ready(()=>{
    emitEventOnClick('#btnRecord','toggleRecord');
    emitEventOnClick('#btnPlay','play0');        
});


