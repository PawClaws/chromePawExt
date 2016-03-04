module.exports = function(grunt) {
    var allFiles = ['Gruntfile.js', 'src/**/*.js', 'test/*.js'];

    grunt.initConfig({
        jshint: {
            all: allFiles,
            options: {
                node: true,
                indent: 4,
                globals: {
                    // Jasmine stuff:
                    afterEach: true,
                    beforeEach: true,
                    describe: true,
                    expect: true,
                    it: true
                }
            }
        },
        jasmine_node: {
            options: {
                specNameMatcher: '_spec',
                forceExit: true
            },
            all: ['./test']
        },
        watch: {
            all: {
                files: allFiles,
                tasks: ['jshint', 'jasmine_node'],
                options: {
                    atBegin: true
                }
            }
        }
    });

    grunt.registerTask('default', ['jshint', 'test']);
    grunt.registerTask('test', ['jasmine_node']);

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jasmine-node');
};