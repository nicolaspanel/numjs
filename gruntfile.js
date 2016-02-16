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
                    'dist/num4js.js': 'src/index.js'
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
                        // tested files
                        'dist/num4js.min.js',
                        //tests files
                        'test/karma/*.spec.js',
                        {pattern: 'data/**/*.png', watched: false, included: false, served: true}
                    ]
                }
            },
            dist: {
                options: {
                    files: [
                        'test/karma/phantom.js',
                        'dist/num4js.js',
                        'test/karma/*.spec.js',
                        {pattern: 'data/**/*.png', watched: false, included: false, served: true}
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
                    'dist/num4js.min.js': 'dist/num4js.js'
                }
            }
        },
        jsdoc : {
            dist : {
                src: ['src/**/*.js', 'README.md'],
                options: {
                    destination: 'doc'
                    //template : "node_modules/ink-docstrap/template",
                    //configure : "node_modules/ink-docstrap/template/jsdoc.conf.json"
                }
            }
        },
        githubPages: {
            target: {
                options: {
                    // The default commit message for the gh-pages branch
                    commitMessage: 'update documentation'
                },
                // The folder where your gh-pages repo is
                src: 'doc'
            }
        }
    });
    grunt.registerTask('mocha', ['simplemocha:full']);
    grunt.registerTask('test', ['jshint', 'simplemocha:full', 'browserify', 'karma:dist', 'uglify', 'karma:min' ]);
    grunt.registerTask('doc', ['jsdoc', 'githubPages:target']);
};
