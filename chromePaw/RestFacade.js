var auth=()=>{
$.get('https://www.googleapis.com/auth/drive.appDataFolder/files',(res)=>{
    console.log(res)
})
}
var listRoot=()=>{
    var ret=[]
    $.get('https://www.googleapis.com/drive/v3/root/files',(res)=>{
        var f=res.files
        ret=f
        console.log(f)
    })
    return ret
    
}
var insert=()=>{
    var folders=listRoot().filter((x)=>{return 'PawClaws' in x.title});
    if(folders.length>0){
        var id=folders[0].id
    }
    else{
        //insert to new folder 
    }
}
        
