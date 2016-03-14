(function(root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    }
    else if (typeof define === 'function' && define.amd) {
        define('paw/Store', ['paw/Gdrive'], factory);
    }
    else {
        root.Store = factory();
    }
}(this, function() {
    'use strict';

    function Store() {

    }


    /*
     * Store a script with a given name for a given URL.
     * @param {string} url - The url the script is for
     * @param {string} name - The name of the script
     * @param {Object} data - The script to store along with any other data
     * @param {Function} errorcallback - The function to call on an error
     * Name and URL will be escaped correctly.
     */
    Store.prototype.storeScript = function(url, name, data) {
        return Gdrive.upload(encodeURIComponent(url) + ":" + encodeURIComponent(name), data);
    };

    /*
     * Grab a script with a given name for a given URL.
     * @param {string} url - The url the script is for
     * @param {string} name - The name of the script
     * @param {Function} errorcallback - The function to call on an error
     * Name and URL will be escaped correctly.
     */
    Store.prototype.getScript = function(url, name) {
        return Gdrive.getUrl(encodeURIComponent(url) + ":" + encodeURIComponent(name)).execute(resp => return resp.items[0]);
    };

    /*
     * Grab a list of all scripts for a given URL.
     * @param {string} url - The url the script is for
     * @param {Function} errorcallback - The function to call on an error
     * URL will be escaped correctly.
     */
    Store.prototype.listScripts = function(url) {
        return Gdrive.find(encodeURIComponent(url)).execute(resp => return resp.items);
    };

    return Store;
}));

