module.exports = function(grunt) {

    // For configuration details, see:
    // https://github.com/WebFilings/wf-grunt
    require('wf-grunt').init(grunt, {
        options: {
            coverageThresholds: {
                statements: 0,
                branches: 0,
                functions: 0,
                lines: 0
            },
            requireConfig: {
                paths: {
                    'paw': './src/',
                    Q: 'bower_components/q/q'
                },
                shim: {}
            }
        }
    });

    /*grunt.initConfig({
	jasmine: {
	    pivotal: {
		src: ['src/Paw.js','!Gruntfile.js'],
	    	options: {
		    specs: 'test/PawSpecTest.js',
		    helpers: 'spec/*Helper.js'
	        }
       	    }
    	}
    });
	grunt.loadNpmTasks('grunt-contrib-jasmine')*/
}
