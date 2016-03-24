//this needs to be changed to the group CLIENT_ID. Currently using Matt's personal CLIENT_ID
var CLIENT_ID = '216899417108-8thjf5om26hi720pocobscbveqqfdt25.apps.googleusercontent.com';

var SCOPES = 'https://www.googleapis.com/auth/drive';

var rest = rest || {}
var FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

function insertFile(fileData,token,callback) {
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
//list files
function listFiles(folderId, callback)
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
function downloadFile2(file, token) {

        var accessToken = token;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://www.googleapis.com/drive/v2/files/'+file + "?alt=media");
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {

            var blob = new Blob([this.response], {
                type: 'text/javascript'
            });
            var scriptURL = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.download = "script.txt";
            a.href = scriptURL;
            a.target = '_blank';
            a.click();
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



/////////////////////////////////////////////////////////////////////////
    /////AUTHENTICATION METHODS
//////////////////////////////////////////////////////////

    function handleClientLoad() {
        gapi.client.setApiKey(apiKey);
        window.setTimeout(checkAuth,1);
    }
    /**
     * Check if current user has authorized this application.
     */
    function checkAuth() {
        gapi.auth.authorize(
            {
                'client_id': CLIENT_ID,
                'scope': SCOPES.join(' '),
                'immediate': true
            }, handleAuthResult);
    }

    /**
     * Handle response from authorization server.
     *
     * @param {Object} authResult Authorization result.
     */
    function handleAuthResult(authResult) {
        var authorizeDiv = document.getElementById('authorize-div');
        if (authResult && !authResult.error) {
            // Hide auth UI, then load client library.
            authorizeDiv.style.display = 'none';
            loadDriveApi();
        } else {
            // Show auth UI, allowing the user to initiate authorization by
            // clicking authorize button.
            authorizeDiv.style.display = 'inline';
        }
    }

    /**
     * Initiate auth flow in response to user clicking authorize button.
     *
     * @param {Event} event Button click event.
     */
    function handleAuthClick(event) {
        gapi.auth.authorize(
            {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
            handleAuthResult);
        return false;
    }

    /**
     * Load Drive API client library.
     */
    function loadDriveApi() {
        gapi.client.load('drive', 'v2', listFiles);
    }



