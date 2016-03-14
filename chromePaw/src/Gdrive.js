(function(root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    }
    else if (typeof define === 'function' && define.amd) {
        define('paw/Gdrive', [], factory);
    }
    else {
        root.Gdrive = factory();
    }
}(this, function() {
    'use strict';

    function Gdrive() {
    }

    Gdrive.prototype.load = function() {
        return gapi.client.load('drive', 'v2');
    };

    Gdrive.prototype.find = function(pageurl) {
        return gapi.client.drive.children.list({'q' : "name contains " + pageurl + " and mimeType = 'application/json'"});
    };

    Gdrive.prototype.getUrl = function(name) {
        return gapi.client.drive.children.list({'q' : "name = " + name + " and mimeType = 'application/json'"});
    };

    Gdrive.prototype.upload = function(name, data) {
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        const mimetype = 'application/json';

        var metadata = {
            'title': name,
            'mimeType': mimetype
        };

        var multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + mimetype + '\r\n' +
            '\r\n' +
            data +
            close_delim;

        return gapi.client.request({
            'path': '/upload/drive/v2/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody});
    };
    
    return Gdrive;
}));
