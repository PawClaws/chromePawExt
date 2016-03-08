requirejs.config({

// Karma serves files from '/base'
baseUrl: '/base',


paths: {
    "paw": "./src/",
    "Q": "bower_components/q/q"
},

shim: {},


// ask Require.js to load these files (all our tests)
deps: (function() {
    var tests = [];
    for (var file in window.__karma__.files) {
        if (window.__karma__.files.hasOwnProperty(file)) {
            if (/Spec\.js$/.test(file)) {
                tests.push(file);
            }
        }
    }
    return tests;
}()),

// start test run, once Require.js is done
callback: window.__karma__.start

});