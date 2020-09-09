angular.module('connect.cardnumber', []).directive('connectCardNumber', function () {
    return {
        priority: 101,
        require: 'ngModel',
        restrict: 'A',
        compile: function connectCardnumberCompilingFunction() {

            var $scope;

            return function connectCardnumberLinkingFunction(scope, iElement, iAttrs, controller) {
                $scope = scope.$parent.$parent.$parent.$parent.$parent; // this is the paymentitem.controller
                if (iAttrs.connectCardNumber === 'cardNumber') {
                    $scope.$watch(function () {
                        return controller.$$rawModelValue;
                    }, function (value) {
                        if (checkBINLength(value)) {
                            var newBIN = extractBin(value);
                            getIinDetails(newBIN);
                        }
                    });
                }
            };

            function checkBINLength(value) {
                var ret = false;
                if (value) {
                    var newBIN = extractBin(value);
                    if (newBIN !== $scope.currentBIN) {
                        $scope.currentBIN = newBIN;
                        ret = true;
                    }
                }
                return ret;
            }

            function extractBin(value) {
                var newBIN;
                if (value.length >= 8) {
                    newBIN = value.substring(0, 8);
                } else {
                    newBIN = value.substring(0, 6);
                }
                return newBIN;
            }

            function getIinDetails(value) {
                $scope.connect.session.getIinDetails(value, $scope.connect.paymentDetails).then(function (response) {
                    $scope.$apply(function () {
                        $scope.iinDetails = response;
                        $scope.ccstate = response.status;
                        if (response.status === "SUPPORTED") {
                            handleSupportedResponse(response);
                        }
                    });
                }, function () {
                    $scope.$apply(function () {
                        $scope.ccstate = "ERROR";
                    });
                });
            }

            function handleSupportedResponse(response) {
                // this card is supported; switch to the card
                $scope.getPaymentProduct(response.paymentProductId).then(function (paymentProduct) {
                    $scope.$apply(function () {
                        $scope.hasCobrand = false;
                        $scope.setProduct(paymentProduct.id);
                        // enrich the cobrands response
                        if (response.coBrands) {
                            handleCobrand(response);
                        }
                    });
                });
            };

            function handleCobrand(response) {
                var cobrandCount = 0;
                angular.forEach(response.coBrands, function (cobrand) {
                    var paymentProductId = cobrand.paymentProductId;
                    if (cobrand.isAllowedInContext) {
                        cobrandCount++;
                        $scope.getPaymentProduct(paymentProductId).then(function (paymentProduct) {
                            $scope.$apply(function () {
                                // add logo and label to he cobrand displayHints
                                cobrand.displayHints = cobrand.displayHints || {};
                                cobrand.displayHints.logo = paymentProduct.displayHints.logo;
                                cobrand.displayHints.label = paymentProduct.displayHints.label;
                            });
                        });
                    }
                });
                if (cobrandCount > 1) {
                    $scope.hasCobrand = true;
                }
            }
        }
    }
});
