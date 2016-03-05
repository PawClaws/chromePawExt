var emitEventOnClick=(selector,event,callback)=>{
        $(selector).click(()=>{
                chrome.tabs.executeScript({
                    "code":"jQuery(window).trigger('"+event+"')"
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
    emitEventOnClick('#btnRecord','toggleRecord',null);
    emitEventOnClick('#btnPlay','play0',null);
    scriptPickerInit();        
});


