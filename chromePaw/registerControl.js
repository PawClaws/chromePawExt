var emitEventOnClick=(selector,event,callback,functionParams)=>{
        $(selector).click(()=>{
                chrome.tabs.executeScript({
                    "code":"jQuery(window).trigger('"+event+"',"+functionParams+")"
                },callback);
            });
}




var initializeData=()=>{
//{title: key:}
var scriptArr=[];

}



var scriptPickerInit=()=>{
    //var data=initializeData();
    
    //data.forEach((e,i,a)=>{
      //  $('#scriptPicker').append("<div class='btn btn-default form-control' uniqueKey='"+e.key+"' id='scriptPicker"+e.title+"'>"+e.title+"</div>");
       // $("#scriptPicker"+e.title).click(()=>{
            //Load script by key    
        //});        
    //});   
};

$(document).ready(()=>{
    pawScript='function(done){this.touch("50% 20%").wait(40).drag("50% 40%").wait(40).drag("50% 20%").wait(40).release().then(done);}';
    emitEventOnClick('#btnRecord','toggleRecord',null,'[]');
    emitEventOnClick('#gotoSettings','gotoSettings',null,'[]');
    emitEventOnClick('#btnPlay','altPlay',null,'['+pawScript+']');
    scriptPickerInit();        
});


