app.controller('sessiondetails.controller', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
    "use strict";
    var currentContext = JSON.parse(sessionStorage.getItem('context'));
    // defaults for input
    $scope.input = {
        clientSessionId: (currentContext) ? currentContext.clientSessionId : null,
        customerId: (currentContext) ? currentContext.customerId : null,
        clientApiUrl: (currentContext) ? currentContext.clientApiUrl : 'https://ams1.sandbox.api-ingenico.com/client/v1',
        assetUrl: (currentContext) ? currentContext.assetUrl : 'https://assets.pay1.sandbox.secured-by-ingenico.com',
        amountInCents: (currentContext) ? currentContext.amountInCents : 12345,
        countryCode: (currentContext) ? currentContext.countryCode : 'NL',
        currencyCode: (currentContext) ? currentContext.currencyCode : 'EUR',
        locale: (currentContext) ? currentContext.locale : 'en_GB',
        isRecurring: (currentContext) ? currentContext.isRecurring : false,
        grouping: (currentContext) ? currentContext.grouping : true,
        gatewayMerchantId: (currentContext) ? currentContext.gatewayMerchantId : null,
        merchantId: (currentContext) ? currentContext.merchantId : null,
        merchantName: (currentContext && currentContext.merchantName) ? currentContext.merchantName : '',
    };

    var firstInput = document.querySelector('form input:first-child');
    firstInput.focus();
    window.scrollTo(0,0);

    $scope.startPayment = function () {
        $rootScope.hasSession = true;
        sessionStorage.setItem('context', angular.toJson($scope.input));
        $location.path('/paymentitem-selection');
    }
}]);