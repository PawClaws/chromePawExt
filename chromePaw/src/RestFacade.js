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

function insertFile(file) {
    var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://www.googleapis.com/drive/v3/files/' + file);
    xhr.setRequestHeader('')


}

function alternativeDownload(file) {
    var accessToken = gapi.auth.getToken().access_token; //get file access token Oauth

    var fileId = file;
    var dest = fs.createWriteStream('/tmp/photo.txt');

    drive.files.get({
            fileId: fileId,
            alt: 'application/vnd.google-apps.script+json'
        })
        .on('end', function() {
            console.log('Done');
        })
        .on('error', function(err) {
            console.log('Error during download', err);
        })
        .pipe(dest);
}

function uploadFile(file) {

    var accessToken = gapi.auth.getToken().access_token; //get file access token Oauth
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.googleapis.com/drive/v3/files/' + file + '/copy');
}



function callback(data) {
    console.log(data)
}

function getFileMetaData(fileID, callback)
{
    fileMetaData = 'https://www.googleapis.com/drive/v2/files/' + file;
    var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET',fileMetaData );


    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);

    xhr.onload = function() {

        callback(xhr.responseText);
    };
    xhr.onerror = function() {
        callback(null);
    };
    xhr.send();



}
/**
 * Download a file's content.
 *
 * @param {File} file Drive File instance ID
 * @param {Function} callback Function to call when the request is complete.
 */

function generateDownloadFile(fileID, callback) {

        fileDownloadURL = 'https://docs.google.com/uc?id=' + file + '&export=download';

}

/**
 * Download a file's content. This does not work in this context as it we have CORS conflicts.
 *
 * @param {File} file Drive File instance ID
 * @param {Function} callback Function to call when the request is complete.
 */

function downloadFile(fileID, callback) {

    fileDownloadURL = 'https://docs.google.com/uc?id=' + file + '&export=download';
    var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET',fileDownloadURL);


    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);

    xhr.onload = function() {

        callback(xhr.responseText);
    };
    xhr.onerror = function() {
        callback(null);
    };
    xhr.send();

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



