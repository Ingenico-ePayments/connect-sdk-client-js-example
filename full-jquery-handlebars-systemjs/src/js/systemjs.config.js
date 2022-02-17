/**
 * System configuration
 * Adjust as necessary for your application needs.
 */
(function (global) {
    // map tells the System loader where to look for things
    var map = {
        'app': '/src/js/app',
        'connect-sdk-client-js': '/node_modules/connect-sdk-client-js',
        'jQuery': '/node_modules/jquery',
        'jquery': '/node_modules/jquery',
        'jquery-validation': '/node_modules/jquery-validation',
        'handlebars': '/node_modules/handlebars',
        'bootstrap': '/node_modules/bootstrap-sass',
        'node-forge': '/node_modules/node-forge'
    };
    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'app': { main: 'dev-start.js', defaultExtension: 'js' },
        'connect-sdk-client-js': { main: 'dist/index.js', defaultExtension: 'js' },
        'jQuery': { main: 'dist/jquery.js', defaultExtension: 'js' },
        'jquery': { main: 'dist/jquery.js', defaultExtension: 'js' },
        'jquery-validation': { main: 'dist/jquery.validate.js', defaultExtension: 'js' },
        'handlebars': { main: 'dist/handlebars.js', defaultExtension: 'js' },
        'bootstrap': { main: 'assets/javascripts/bootstrap.js', defaultExtension: 'js' },
        'node-forge': { main: 'dist/forge.min.js', defaultExtension: 'js' }
    };
    // bundles tells the System loader that the connectsdk modules are located in the connect-sdk-client-js bundle
    // The list of modules may be expanded with what is needed; for this example app, only connectsdk.Session and connectsdk.AccountOnFile
    // are needed directly
    var bundles = {
        'connect-sdk-client-js': ['connectsdk.Session', 'connectsdk.AccountOnFile']
    };

    var meta = {
        'node-forge': { format: 'commonjs' }
    };

    var config = {
        map: map,
        packages: packages,
        bundles: bundles,
        meta: meta
    }
    System.config(config);
})(this);
