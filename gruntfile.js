'use strict';

module.exports = function(grunt) {
    require('jit-grunt')(grunt, {
        simplemocha: 'grunt-simple-mocha',
        browserify: 'grunt-browserify'
    });
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        simplemocha: {
            options: {
                reporter: 'spec',
                timeout: '5000'
            },
            full: {
                src: ['test/mocha/**/*.spec.js']
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            files: [
                'test/**/*.js',
                'src/**/*.js'
            ]
        },
        browserify: {
            dist: {
                files: {
                    'num4js.js': 'src/index.js'
                }
            },
            options: {
                browserifyOptions: {
                    standalone: 'nj'
                }
            }
        },
        karma: {
            options: {
                frameworks: ['jasmine'],
                reporters: ['dots'],
                // web server port
                port: 9876,
                colors: true,
                logLevel: 'WARN',
                autoWatch: false,
                browsers: ['PhantomJS'],
                singleRun: true
            },
            min: {
                options: {
                    files: [
                        'test/karma/phantom.js',
                        'bower_components/lodash/lodash.js',
                        // tested files
                        'min/ph.min.js',
                        //tests files
                        'test/karma/*.spec.js',
                        {pattern: 'test/data/**/*.png', watched: false, included: false, served: true}
                    ]
                }
            },
            underscore: {
                options: {
                    files: [
                        'test/karma/phantom.js',
                        'bower_components/underscore/underscore.js',
                        'build/ph.js',
                        'test/karma/*.spec.js',
                        {pattern: 'test/data/**/*.png', watched: false, included: false, served: true}
                    ]
                }
            },
            lodash: {
                options: {
                    files: [
                        'test/karma/phantom.js',
                        'bower_components/lodash/lodash.js',
                        'build/ph.js',
                        'test/karma/*.spec.js',
                        {pattern: 'test/data/**/*.png', watched: false, included: false, served: true}
                    ]
                }
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: '/*! <%= pkg.name %>#<%= pkg.version %> */\n'
                },
                files: {
                    'num4js.min.js': 'num4js.js'
                }
            }
        }
    });
    grunt.registerTask('mocha', ['simplemocha:full']);
    grunt.registerTask('test', ['jshint', 'simplemocha:full', 'browserify', 'karma:lodash', 'karma:underscore' , 'uglify', 'karma:min']);
};
