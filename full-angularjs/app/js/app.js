var app = angular.module('app', ['ngRoute', 'ui.bootstrap', 'ui.mask', 'connect.validation', 'connect.cardnumber']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/paymentitem-selection', {
        templateUrl : 'app/paymentitem-selection/paymentitem-selection.html',
        requiresSession: false
    }).when('/paymentitem-detail/:type/:id/:aof?', {
        templateUrl : 'app/paymentitem-detail/paymentitem-detail.html',
        requiresSession: false
    }).when('/dev-sessiondetails', {
        templateUrl : 'app/sessiondetails/sessiondetails.html',
        requiresSession: false
    }).when('/dev-success', {
        templateUrl : 'app/results/success.html',
        requiresSession: true
    }).when('/dev-failure', {
        templateUrl : 'app/results/failure.html',
        requiresSession: true
    }).otherwise({
        templateUrl : 'app/sessiondetails/sessiondetails.html',
        requiresSession: false
    });
}]);

app.run(['$rootScope', '$location', function($rootScope, $location) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (next.requiresSession && !$rootScope.hasSession) {
            $location.path('/dev-sessiondetails');
        }
    });
}]);

app.controller('app', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
    $rootScope.loading = false;
}]);