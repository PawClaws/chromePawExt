var toggleHide=function(){
    chrome.tabs.executeScript(
        {
            "code":"$('#guiContainer').toggleClass('hidden');"
        });
}

var toggleRecord=function(){
    chrome.tabs.executeScript(
        {
            "code":"$('#btnRecord').click();"
        });
}

document.getElementById('btnToggleVisible').onclick=toggleHide;
document.getElementById('btnToggleRecord').onclick=toggleRecord;

