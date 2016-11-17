app.controller('paymentitem-selection.controller', ['$scope', '$location', '$log', function ($scope, $location, $log) {
    "use strict";

    $scope.hasError = false;

    $scope.getPaymentItems = function () {
        $scope.hasError = false;
        $scope.loading = true;
        $scope.connect.session.getBasicPaymentItems($scope.connect.paymentDetails, $scope.grouping).then(function (basicPaymentItems) {
            $scope.loading = false;

            // since the connect sdk has async calls outside of angular we need to tell Angular to dirty-check the state after the async call is complete.
            $scope.$apply(function () {
                // sort the paymentitems here
                $scope.basicPaymentItems = basicPaymentItems.basicPaymentItems.sort(function (a, b) {
                    if (a.displayHints.displayOrder < b.displayHints.displayOrder) {
                        return -1;
                    } else if (a.displayHints.displayOrder > b.displayHints.displayOrder) {
                        return 1;
                    }
                    return 0;
                });
                // add accounts on file
                $scope.accountsOnFile = basicPaymentItems.accountsOnFile;

                // enrich the accounts on file with images; not all UIs require the logo that's why it's not a default part of the response.
                if ($scope.accountsOnFile) {
                    addLogosToAoF();
                }
            });
        }, function () {
            $scope.$apply(function () {
                $scope.hasError = true;
                $scope.loading = false;
                $log.error('error while getting the basicPaymentItems');
            });
        })
    };

    $scope.choosePaymentItem = function (paymentItem) {
        $location.path('/paymentitem-detail/' + paymentItem.json.type + '/' + paymentItem.id);
    };
    $scope.chooseAccountOnFile = function (aof) {
        $location.path('/paymentitem-detail/product/' + aof.paymentProductId + '/' + aof.id);
    };

    $scope.showAccountOnFileData = function (accountOnFile) {
        var accountOnFileObject = new connectsdk.AccountOnFile(accountOnFile);
        var displayHints = accountOnFileObject.displayHints;
        var output = "";
        for (var j = 0, jl = displayHints.labelTemplate.length; j < jl; j++) {
            var keyToShow = displayHints.labelTemplate[j].attributeKey;
            output = output + accountOnFileObject.getMaskedValueByAttributeKey(keyToShow).formattedValue + " ";
        }
        return output;
    };

    var addLogosToAoF = function () {
        angular.forEach($scope.accountsOnFile, function (aof) {
            var paymentProductId = aof.paymentProductId;
            $scope.connect.session.getPaymentProduct(paymentProductId, $scope.connect.paymentDetails).then(function (paymentProduct) {
                $scope.$apply(function () {
                    aof.displayHints = aof.displayHints || {};
                    aof.displayHints.logo = paymentProduct.displayHints.logo;
                });
            });
        });
    };

    var context = JSON.parse(sessionStorage.getItem('context'));
    if (context) {
        $scope.connect = {}; // store all connectSDK variables in this namespace

        // split the context up in the session- and paymentDetails
        $scope.connect.sessionDetails = {
            clientSessionID: context.clientSessionId,
            customerId: context.customerId,
            region: context.region,
            environment: context.environment
        };
        $scope.connect.paymentDetails = {
            totalAmount: context.amountInCents,
            countryCode: context.countryCode,
            locale: context.locale,
            isRecurring: context.isRecurring,
            currency: context.currencyCode
        }
        $scope.grouping = context.grouping;

        // use the sessionDetails to create a new session
        $scope.connect.session = new connectsdk.Session($scope.connect.sessionDetails);

        // Get the paymentRequest for this session. This is an SDK object that stores all the data
        // that the customer provided during the checkout. In the end of the checkout it will provide
        // all this information to the encryption function so that it can create the encrypted string
        // that contains all this info.
        $scope.connect.paymentRequest = $scope.connect.session.getPaymentRequest();
        // now render the page
        $scope.getPaymentItems();
    } else {
        $location.path('/start');
    }
}]);
