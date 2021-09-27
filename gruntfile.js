'use strict';

module.exports = function (grunt) {
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
        src: [
          'test/mocha/**/*.spec.js'
        ]
      }
    },
    browserify: {
      dist: {
        files: {
          'dist/numjs.js': 'src/index.js'
        }
      },
      options: {
        browserifyOptions: {
          standalone: 'nj'
        }
      }
    },
    // karma: {
    //   options: {
    //     frameworks: ['mocha', 'chai'],
    //     reporters: ['dots'],
    //     // web server port
    //     port: 9876,
    //     colors: true,
    //     logLevel: 'WARN',
    //     autoWatch: false,
    //     browsers: ['PhantomJS'],
    //     singleRun: true
    //   },
    //   min: {
    //     options: {
    //       files: [
    //         'test/karma/phantom.js',
    //         // tested files
    //         'dist/numjs.min.js',
    //         // tests files
    //         'test/karma/*.spec.js',
    //         {pattern: 'data/**/*.png', watched: false, included: false, served: true}
    //       ]
    //     }
    //   },
    //   dist: {
    //     options: {
    //       files: [
    //         'test/karma/phantom.js',
    //         'dist/numjs.js',
    //         'test/karma/*.spec.js',
    //         {pattern: 'data/**/*.png', watched: false, included: false, served: true}
    //       ]
    //     }
    //   }
    // },
    uglify: {
      dist: {
        options: {
          banner: '/*! <%= pkg.name %> */\n'
        },
        files: {
          'dist/numjs.min.js': 'dist/numjs.js'
        }
      }
    },
    jsdoc: {
      dist: {
        src: ['src/**/*.js', 'README.md'],
        options: {
          destination: 'doc'
          // template : "node_modules/ink-docstrap/template",
          // configure : "node_modules/ink-docstrap/template/jsdoc.conf.json"
        }
      }
    },
    'gh-pages': {
      options: {
        base: 'doc'
      },
      src: ['**']
    }
  });
  grunt.registerTask('mocha', ['simplemocha:full']);
  grunt.registerTask('build', ['browserify', 'uglify']);
  grunt.registerTask('test', ['simplemocha:full', 'build']); //, 'karma:dist', 'karma:min']);
  grunt.registerTask('travis', ['simplemocha:full', 'karma:dist', 'karma:min']);
  grunt.registerTask('doc', ['jsdoc', 'gh-pages']);
};
