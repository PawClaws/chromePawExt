// This is a shared requirejs configuration for all the project's examples.
// This config expects that the index.html for your examples will be put into
// subdirectories beneath `examples/`; eg: `examples/spike/index.html`.
// If this is not the case, you'll want to update the baseUrl and paths below.
requirejs.config({
    baseUrl: './',
    paths: {
        'paw': '../../src/',
        jquery: '../../bower_components/jquery/jquery.min',
        Q: '../../bower_components/q/q',
    },
    shim: {
        'jquery': {
            exports: '$'
        }
    }
});
