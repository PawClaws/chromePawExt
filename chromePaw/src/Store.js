(function(root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    }
    else if (typeof define === 'function' && define.amd) {
        define('paw/Store', [], factory);
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
     * Currently, will over-write scripts without warning. Name and URL will be escaped correctly.
     */
    Store.prototype.storeScript = function(url, name, data) {
    };

    /*
     * Grab a script with a given name for a given URL.
     * @param {string} url - The url the script is for
     * @param {string} name - The name of the script
     * Name and URL will be escaped correctly.
     */
    Store.prototype.getScript = function(url, name) {
    };

    /*
     * Grab a list of all scripts for a given URL.
     * @param {string} url - The url the script is for
     * URL will be escaped correctly.
     */
    Store.prototype.listScripts = function(url) {
    };

    return Store;
}));

