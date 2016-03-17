//this needs to be changed to the group CLIENT_ID. Currently using Matt's personal CLIENT_ID
var CLIENT_ID = '216899417108-8thjf5om26hi720pocobscbveqqfdt25.apps.googleusercontent.com';

var SCOPES = ['https://www.googleapis.com/auth/drive'];

var rest = rest || {}
var FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

//currently used for listing files for demonstration purposes in TestDrive.html. Use callback or another element in future iterations.
function appendPre(message) {
    var pre = document.getElementById('output');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}


//list files
function listFiles(folderId)
{
    gapi.client.load('drive', 'v3', function() {
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
                    request = gapi.client.drive.files.list({
                        'folderId' : folderId,
                        'pageToken': nextPageToken
                    });
                    retrievePageOfChildren(request, result);
                } else {
                    appendPre(result);
                }
            });
        }
        var initialRequest = gapi.client.drive.files.list({

            'folderId' : folderId
        });
        retrievePageOfChildren(initialRequest, []);

        initialRequest.execute(function(resp) {
            appendPre('Files:');
            var files = resp.files;
            if (files && files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    appendPre(file.name + ' (' + file.id + ')');
                }
            } else {
                appendPre('No files found.');
            }

        });
    });


}

function auth_(callback) {
        gapi.auth.authorize(
            {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
            callback);
}

function insertFile(fileName, fileData, callback, onerror) {
    var boundary = '01234567890123456789';
    var metaData = { 'name' : fileName };
    var token = gapi.auth.getToken();
    if (token) {
        var accessToken = token.access_token;
        var xhr = new XMLHttpRequest('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.setRequestHeader('Content-Type', 'multipart/related; boundary=' + boundary);
        var request =
            '--' + boundary + '\n'
            + 'Content-Type: application/json; charset=UTF-8\n\n'
            + JSON.stringify(metaData)
            + '\n\n'
            + '--' + boundary + '\n'
            + 'Content-Type: application/json; charset=UTF-8\n\n'
            + JSON.stringify(fileData) + '\n'
            + boundary + '--';
        xhr.setRequestHeader('Content-Length', request.length);
        xhr.onload = function(res) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(xhr.responseText);
                } else {
                    onerror(xhr.statusText);
                }
            }
        };

        xhr.onerror = function(res) {
            onerror(xhr.statusText);
        };

        xhr.send(request);
    } else {
        auth_(function(res) { console.log('auth attempt: ' + res); insertFIle(fileName, fileData, callback, onerror); });
    }
}


/**
 * Download a file's content.
 *
 * @param {File} file Drive File instance.
 * @param {Function} callback Function to call when the request is complete.
 */
function downloadFile(file) {

        var accessToken = gapi.auth.getToken().access_token; //get file access token Oauth
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://www.googleapis.com/drive/v3/files/' + file);
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.onload = function () {
            callback(xhr.responseText);
        };
        xhr.onerror = function () {

        };
        xhr.send();
        console.log("Helo");

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
        gapi.client.load('drive', 'v3', listFiles);
    }



