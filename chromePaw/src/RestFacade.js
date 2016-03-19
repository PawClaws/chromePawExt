//this needs to be changed to the group CLIENT_ID. Currently using Matt's personal CLIENT_ID
var CLIENT_ID = '216899417108-8thjf5om26hi720pocobscbveqqfdt25.apps.googleusercontent.com';

var SCOPES = 'https://www.googleapis.com/auth/drive';

var rest = rest || {}
var FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";



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

function downloadFile(fileId) {

    gapi.client.load('drive', 'v2', function () {
        var accessTokenObj = {};
        accessTokenObj.access_token = gapi.auth.getToken().access_token;
        accessTokenObj.token_type = "Bearer";
        accessTokenObj.expires_in = "3600";
        gapi.auth.setToken(accessTokenObj);
        var request = gapi.client.drive.files.get({
            'fileId': fileId
        });
        request.execute(function (resp) {
            window.location.assign(resp.webContentLink);
        });
    })
}

function downloadFile3(file) {
    gapi.client.load('drive', 'v2', function() {

        var request = gapi.client.request({
            'path': '/drive/v2/files/' + file,
            'method': 'GET',
            'alt': 'media'
        });
        console.log("helo")
        console.log(file.webContentLink)
        if (!callback) {
            callback = function(file) {
                console.log("helo")

                console.log(file.webContentLink)

            };
        }
        request.execute(callback);
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




function insertFile(fileName, fileData, callback, onerror) {
    var boundary = '01234567890123456789';
    var metaData = { 'name' : fileName };
    var token = gapi.auth.getToken();
    var accessToken = token.access_token;
    var headers = {};
    headers['Authorization'] = 'Bearer ' + accessToken;
    headers['Content-Type'] = 'multipart/related; boundary="' + boundary + '"';
    var request =
        '--' + boundary + '\n'
        + 'Content-Type: application/json; charset=UTF-8\n\n'
        + JSON.stringify(metaData)
        + '\n\n'
        + '--' + boundary + '\n'
        + 'Content-Type: application/json; charset=UTF-8\n\n'
        + JSON.stringify(fileData) + '\n'
        + boundary + '--';
    headers['Content-Length'] = request.length;
    var greq = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'params': { 'uploadType': 'multipart' },
        'method': 'POST',
        'headers': headers,
        'body': request});
    greq.execute(function (res) {
        if (res === false) {
            onerror(res);
        } else {
            callback(res);
        }
    });
}
