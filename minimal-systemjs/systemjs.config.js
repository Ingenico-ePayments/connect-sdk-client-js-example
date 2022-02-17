/**
 * System configuration
 * Adjust as necessary for your application needs.
 */
(function (global) {
    // map tells the System loader where to look for things
    var map = {
        'connect-sdk-client-js': '/node_modules/connect-sdk-client-js',
        'node-forge': '/node_modules/node-forge'
    };
    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'connect-sdk-client-js': { main: 'dist/index.js', defaultExtension: 'js' },
        'node-forge': { main: 'dist/forge.min.js', defaultExtension: 'js' }
    };
    // bundles tells the System loader that the connectsdk modules are located in the connect-sdk-client-js bundle
    // The list of modules may be expanded with what is needed; for this example app, only connectsdk.Session is needed directly
    var bundles = {
        'connect-sdk-client-js': ['connectsdk.Session']
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
