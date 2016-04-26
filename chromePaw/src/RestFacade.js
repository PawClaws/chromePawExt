
function insertFileRoot(fileData,token,callback) {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    var reader = new FileReader();
    reader.readAsBinaryString(fileData);
    reader.onload = function (e) {
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
            'body': multipartRequestBody
        });
        if (!callback) {
            callback = function (file) {
                console.log(file)
            };
        }
        request.execute(function (resp) {
            if (resp.error.code == 401 && resp.error.data[0].reason == "authError") {
                callback(resp.error);
            }
            else if (resp.error.code == 403 && resp.error.data[0].reason == "notFound") {
                callback("File Not Found.");
            }

            else if (resp.error) {
                callback("An error occurred. Please try again.");
            }
        });
    }
}

function insertFile_(folderId,fileData,token,callback) {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    var reader = new FileReader();
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    }

    if(mm<10) {
        mm='0'+mm
    }

    today = "PawScript - " + mm+dd+yyyy;
    reader.readAsBinaryString(fileData);
    reader.onload = function(e) {
        var contentType = fileData.type || 'application/octet-stream';
        var metadata = {
            'title': today,
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
        request.execute(function(resp) {
            if (resp && resp.error) {
                if (resp.error.code == 401 && resp.error.data[0].reason == "authError") {
                    callback(resp.error);
                }
                else if (resp.error.code == 403 && resp.error.data[0].reason == "notFound") {
                    callback("File Not Found.");
                }

            }
            //copy to another folder.
            else if (resp)
            {
                callback(resp.id);
                copyFileIntoFolder(folderId,resp.id, token,callback);
            }

        });
    }
}

function copyFileIntoFolder(folderId, fileId,token,callback) {
    gapi.client.load('drive', 'v2', function() {
    var body = {'id': folderId};
    var accessTokenObj = {};
    accessTokenObj.access_token = token;
    accessTokenObj.token_type = "Bearer";
    accessTokenObj.expires_in = "3600";
    gapi.auth.setToken(accessTokenObj);
    var request = gapi.client.drive.parents.insert({
        'fileId': fileId,
        'resource': body
    });
    request.execute(function(resp) {

        if (resp.error.code == 401 && resp.error.data[0].reason == "authError") {
            callback(resp.error);
        }
        else if (resp.error.code == 403 && resp.error.data[0].reason == "notFound") {
            callback("File Not Found.");
        }

        else if (resp.error) {
            callback("An error occurred. Please try again.");
        }
    });
});
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
function listFilesRoot(folderId, token, callback)
{
    gapi.client.load('drive', 'v2', function() {
        var accessTokenObj = {};
        accessTokenObj.access_token = token;
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

function downloadFile(fileId,token,callback) {

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
                if (resp.error.code == 401 && resp.error.data[0].reason == "authError") {
                    callback(resp.error);
                }
                else if (resp.error.code == 403 && resp.error.data[0].reason == "notFound") {
                    callback("File Not Found.");
                }

                else if (resp.error) {
                    callback("An error occurred. Please try again.");
                }

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

function renameFile(fileId, token, newName, callback) {
    var accessTokenObj = {};
    accessTokenObj.access_token = token;
    accessTokenObj.token_type = "Bearer";
    accessTokenObj.expires_in = "3600";
    gapi.auth.setToken(accessTokenObj);
    var body = {'title': newName};
    var request = gapi.client.drive.files.patch({
        'fileId': fileId,
        'resource': body
    });

    request.execute(callback);
}

// Put the file in a new folder, disregarding previous folder
function moveFile(fileId, token, oldFolderId, newFolderId, callback) {
    var accessTokenObj = {};
    accessTokenObj.access_token = token;
    accessTokenObj.token_type = "Bearer";
    accessTokenObj.expires_in = "3600";
    gapi.auth.setToken(accessTokenObj);
    var body = {'removeParents': [oldFolderId],
                'addParents': [newFolderId]};
    var request = gapi.client.drive.files.patch({
        'fileId': fileId,
        'resource': body
    });

    request.execute(callback);
}

// Copy the file to a new folder, keeping previous folder
function copyFile(fileId, token, newFolderId, callback) {
    var accessTokenObj = {};
    accessTokenObj.access_token = token;
    accessTokenObj.token_type = "Bearer";
    accessTokenObj.expires_in = "3600";
    gapi.auth.setToken(accessTokenObj);
    var body = {'addParents': [newFolderId]};
    var request = gapi.client.drive.files.patch({
        'fileId': fileId,
        'resource': body
    });

    request.execute(callback);
}

function trashFile(fileId, token, callback) {
    var accessTokenObj = {};
    accessTokenObj.access_token = token;
    accessTokenObj.token_type = "Bearer";
    accessTokenObj.expires_in = "3600";
    gapi.auth.setToken(accessTokenObj);
    var request = gapi.client.drive.files.trash({
        'fileId': fileId
    });

    request.execute(callback);
}

function untrashFile(fileId, token, callback) {
    var accessTokenObj = {};
    accessTokenObj.access_token = token;
    accessTokenObj.token_type = "Bearer";
    accessTokenObj.expires_in = "3600";
    gapi.auth.setToken(accessTokenObj);
    var request = gapi.client.drive.files.untrash({
        'fileId': fileId
    });

    request.execute(callback);
}

function deleteFile(fileId, token, callback) {
    var accessTokenObj = {};
    accessTokenObj.access_token = token;
    accessTokenObj.token_type = "Bearer";
    accessTokenObj.expires_in = "3600";
    gapi.auth.setToken(accessTokenObj);
    var request = gapi.client.drive.files.delete({
        'fileId': fileId
    });

    request.execute(callback);
}
