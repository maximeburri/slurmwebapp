// Karma configuration
// Generated on Mon May 02 2016 10:10:19 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    logLevel: config.LOG_DEBUG,

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'browserify'],

    plugins : [
               'karma-chrome-launcher',
               'karma-firefox-launcher',
               'karma-script-launcher',
               'karma-jasmine',
               'karma-browserify'
    ],

    // list of files / patterns to load in the browser
    files: [
        /*'node_modules/requirejs/require.js',
        'node_modules/exports/lib/exports.js',
        'node_modules/module/dist/index.js',
        'node_modules/commonjs/lib/system.js',
        'node_modules/util/util.js',
        'node_modules/super/lib/super.js',
        'node_modules/ms/index.js',
        'src/components/angular/angular.js',
        'src/components/angular-mocks/angular-mocks.js',
        'node_modules/debug/debug.js',
        'node_modules/connect/index.js',*/
        //{pattern:'dist/lib/js/main.min.js'/*, included:true*/},
        //{pattern:'dist/js/dashboard.min.js'/*, included:true*/}
        //'../node_modules/angular-mocks/angular-mocks.js',
        'node_modules/angular/angular.js',


        //"node_modules/angular/angular.min.js",
        "src/components/angular-bootstrap/ui-bootstrap-tpls.min.js",
        "src/components/angular-cookies/angular-cookies.min.js",
        "src/components/angular-ui-router/release/angular-ui-router.min.js",
        "src/components/socket.io-client/socket.io.js",
        "src/components/momentjs/min/moment.min.js",
        "src/components/momentjs/min/locales.min.js",
        "src/components/humanize-duration/humanize-duration.js",
        "src/components/angular-timer/dist/angular-timer.min.js",
        //"src/js/dashboard.min.js",

        'node_modules/angular-mocks/angular-mocks.js',
        //"src/js/**/*.*",
        "src/js/*.js",
        'src/js/**/*.js',
        //"src/js/tests/*.js",
        //'src/components/*/*.js',
        //'src/components/*/*.css',
        //'src/js/**/*.*',
        //'src/less/**/*.*',
        //'src/img/**/*.*',
        //'src/templates/**/*.html',
        //'src/index.html',
        //'src/js/tests.js'
    ],


    // list of files to exclude
    exclude: [
        'src/components/angular-cookies/index.js',
        '**/gulpfile.js',
        '**/karma.conf.js',
        '**/Gruntfile.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        //'dist/js/dashboard.min.js': [ 'browserify' ]
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
