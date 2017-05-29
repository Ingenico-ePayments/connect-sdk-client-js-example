angular.module('connect.androidPay', []).factory('connectAndroidPay', ['$q', function ($q) {

    var $scope = null;
    var androidPayPaymentProductId = 320;

    var setupRequestMethodData = function (networks, publicKey) {
        var methodData = [{
            supportedMethods: ['https://android.com/pay'],
            data: {
                merchantId: '02510116604241796260',// Not required when environment = TEST
                environment: 'TEST',
                allowedCardNetworks: networks,
                paymentMethodTokenizationParameters: {
                    tokenizationType: 'NETWORK_TOKEN',
                    parameters: {
                        'publicKey': publicKey
                    }
                }
            }
        }];
        return methodData;
    }

    var setupRequestDetails = function () {
        var details = {
            total: {
                label: 'Total',
                amount: {
                    currency: 'USD',
                    value: '161.95'
                }
            }
        };
        return details;
    }

    var setupOptions = function () {
        var options = {
            requestShipping: false,
            requestPayerEmail: false,
            requestPayerPhone: false,
            requestPayerName: false
        };
        return options;
    };

    return {
        setupAndroidPay: function ($scope) {
            return $q(function (resolve, reject) {
                if ($scope.connect.paymentDetails) {
                    $scope.connect.session.getPaymentProductNetworks(androidPayPaymentProductId, $scope.connect.paymentDetails).then(function (jsonNetworks) {
                        if (jsonNetworks.networks && jsonNetworks.networks.length > 0) {
                            $scope.connect.session.getPaymentProductPublicKey(androidPayPaymentProductId).then(function (jsonPublicKey) {
                                $scope.connect.session.getPaymentProduct(androidPayPaymentProductId, $scope.connect.paymentDetails, $scope.connect.paymentProductSpecificInputs).then(function (paymentProduct) {
                                    $scope.connect.paymentRequest.setPaymentProduct(paymentProduct);
                                    var methodData = setupRequestMethodData(jsonNetworks.networks, jsonPublicKey.publicKey);
                                    var details = setupRequestDetails();
                                    var options = setupOptions();
                                    var request = new PaymentRequest(methodData, details, options);
                                    request.show().then(function (paymentResponse) {
                                        $scope.connect.paymentRequest.setValue('encryptedPaymentData', paymentResponse.details.paymentMethodToken);
                                        // paymentResponse.requestId is not returned in the paymentResponse object when testing
                                        $scope.connect.paymentRequest.setValue('transactionId', 'dummy-id');
                                        // encrypt paymentrequest
                                        resolve(paymentResponse);
                                    }).catch(function (err) {
                                        reject("Payment request API returned an error: " + err);
                                    });
                                }, function () {
                                    $("#error").fadeIn();
                                });
                            });
                        } else {
                            reject('There are no available networks');
                        }
                    }, function () {
                        reject('networks call failed');
                    });
                } else {
                    reject("There is no payment context");
                }
            });
        }
    }
}]);