
function insertFileRoot(fileData,token) {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    var reader = new FileReader();
    reader.readAsBinaryString(fileData);
    reader.onload = function(e) {
        var contentType = fileData.type || 'application/octet-stream';
        var metadata = {
            'title': fileData.fileName,
            'mimeType': contentType
        };

        var base64Data = btoa(reader.result);
        var multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64Data +
            close_delim;
        var accessTokenObj = {};
        accessTokenObj.access_token = token;
        accessTokenObj.token_type = "Bearer";
        accessTokenObj.expires_in = "3600";
        gapi.auth.setToken(accessTokenObj);
        var request = gapi.client.request({
            'path': '/upload/drive/v2/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody});
        if (!callback) {
            callback = function(file) {
                console.log(file)
            };
        }
        request.execute(callback);
    }
}

function insertFile_(folderId,fileData,token,callback) {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    var reader = new FileReader();
    reader.readAsBinaryString(fileData);
    reader.onload = function(e) {
        var contentType = fileData.type || 'application/octet-stream';
        var metadata = {
            'title': fileData.fileName,
            'mimeType': contentType
        };

        if (folderId) {
            metadata['parents'] = [folderId];
        }

        var base64Data = btoa(reader.result);
        var multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64Data +
            close_delim;

        var accessTokenObj = {};
        accessTokenObj.access_token = token;
        accessTokenObj.token_type = "Bearer";
        accessTokenObj.expires_in = "3600";
        gapi.auth.setToken(accessTokenObj);

        var request = gapi.client.request({
            'path': '/upload/drive/v2/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody});
        if (!callback) {
            callback = function(file) {
                console.log(file)
            };
        }
        request.execute(callback);
    }
}

function insertFile(fileData, token, callback) {
    insertFile_(false, fileData, token, callback);
}

function insertFileIntoFolder(folderId, fileData, token, callback) {
    insertFile_(folderId, fileData, token, callback);
}
//list files
function listFiles_(query, folderId, callback)
{
    gapi.client.load('drive', 'v2', function() {
        var accessTokenObj = {};
        accessTokenObj.access_token = gapi.auth.getToken().access_token;
        accessTokenObj.token_type = "Bearer";
        accessTokenObj.expires_in = "3600";
        gapi.auth.setToken(accessTokenObj);

        var retrievePageOfChildren = function(request, result) {
            request.execute(function(resp) {
                result = result.concat(resp.items);
                var nextPageToken = resp.nextPageToken;
                if (nextPageToken) {
                    var ireq = {'pageToken': nextPageToken};
                    if (folderId) { ireq['folderId'] = folderId; }
                    request = gapi.client.drive.children.list(ireq);
                    retrievePageOfChildren(request, result);
                } else {
                    callback(result);
                }
            });
        }
        var req = {};
        if (folderId) {
            req['folderId'] = folderId;
        }

        if (query) {
            req['q'] = query;
        }

        var initialRequest = gapi.client.drive.children.list(req);
        retrievePageOfChildren(initialRequest, []);





    });
}

//list files
function listFilesRoot(folderId, callback)
{
    gapi.client.load('drive', 'v2', function() {
        var accessTokenObj = {};
        accessTokenObj.access_token = gapi.auth.getToken().access_token;
        accessTokenObj.token_type = "Bearer";
        accessTokenObj.expires_in = "3600";
        gapi.auth.setToken(accessTokenObj);

            var retrievePageOfChildren = function(request, result) {
                request.execute(function(resp) {
                    result = result.concat(resp.items);
                    var nextPageToken = resp.nextPageToken;
                    if (nextPageToken) {
                        request = gapi.client.drive.children.list({
                            'folderId' : folderId,
                            'pageToken': nextPageToken
                        });
                        retrievePageOfChildren(request, result);
                    } else {
                        callback(result);
                    }
                });
            }
            var initialRequest = gapi.client.drive.children.list({
                'folderId' : folderId
            });
            retrievePageOfChildren(initialRequest, []);





    });
}

//testing
function callback(data) {
    console.log(data)
}

function getFileMetaData(file)
{
    fileMetaData = 'https://www.googleapis.com/drive/v3/files/' + file;
    var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();

    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);

    xhr.onload = function() {

        console.log((xhr.responseText));
    };
    xhr.onerror = function() {
        console.log("Error")
    };
    xhr.send();
}

function downloadFile(fileId,token) {
        console.log("attempting download???");
        gapi.client.load('drive', 'v2', function () {
            var accessTokenObj = {};
            accessTokenObj.access_token = token;
            accessTokenObj.token_type = "Bearer";
            accessTokenObj.expires_in = "3600";
            gapi.auth.setToken(accessTokenObj);
            var request = gapi.client.drive.files.get({
                'fileId': fileId
            });
            request.execute(function (resp) {


                var a = document.createElement('a');
                a.download = "script.txt";
                a.href = resp.webContentLink;
                a.target = '_blank';
                a.click();
            });
        })


}


function createFolder(folderName, token, callback) {
    var FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
    var request = gapi.client.request({

        'path': '/drive/v2/files/',
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
        'body':{
            "title" : folderName,
            "mimeType" : FOLDER_MIME_TYPE,
        }
    });

    request.execute(callback);
}


function listFiles(folderId, callback) {
    return listFiles_(false, folderId, callback);
}

function listFoldersByName(name, callback) {
    var query = 'mimeType = '+ FOLDER_MIME_TYPE + ' and name contains ' + name;
    return listFiles_(query, false, callback);
}

function renameFile(fileId, newName, callback) {
    var body = {'title': newName};
    var request = gapi.client.drive.files.patch({
        'fileId': fileId,
        'resource': body
    });

    request.execute(callback);
}
