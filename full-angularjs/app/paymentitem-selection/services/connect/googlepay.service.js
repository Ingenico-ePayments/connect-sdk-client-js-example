angular.module('connect.GooglePay', []).factory('connectGooglePay', ['$q', function ($q) {
    

    var $scope = null;
    var googlePayId = 320;
    var paymentsClient = null; 

    // Only base is needed to trigger isReadyToPay
    var _getBaseCardPaymentMethod = function (networks) {
        return {
            type: 'CARD',
            parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: networks
            }
        }
    };

    var _getTransactionInfo = function (paymentDetails, acquirerCountry) {
        return {
            'totalPriceStatus': 'FINAL',
            'totalPrice': amountFormatted(paymentDetails.totalAmount),
            'countryCode': acquirerCountry,
            'currencyCode': paymentDetails.currency
        };
    };
    
    function amountFormatted(amount) {
        var output = '00'.concat(amount);
        return [output.slice(0, output.length - 2), '.', output.slice(output.length - 2)].join('');
    }

    var _getMerchantInfo = function (paymentProductSpecificInputs) {
        return {
            'merchantName': paymentProductSpecificInputs.googlePay.merchantName
        };
    };

    var _getTokenizationSpecification = function (paymentProductSpecificInputs) {
        return {
            type: 'PAYMENT_GATEWAY',
            parameters: {
                'gateway': paymentProductSpecificInputs.googlePay.gateway,
                'gatewayMerchantId': paymentProductSpecificInputs.googlePay.gatewayMerchantId
            }
        }
    };

    var _getGooglePaymentDataRequest = function (paymentProductSpecificInputs, networks, paymentDetails) {
        var acquirerCountry;
        if (paymentProductSpecificInputs.acquirerCountry) {
            acquirerCountry = paymentProductSpecificInputs.acquirerCountry;
        } else {
            acquirerCountry = paymentDetails.countryCode;
        }

        return {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [_getCardPaymentMethod(paymentProductSpecificInputs, networks)],
            transactionInfo: _getTransactionInfo(paymentDetails, acquirerCountry),
            merchantInfo: _getMerchantInfo(paymentProductSpecificInputs)
        };
    };

    var _getGooglePaymentsClient = function(environment) {
        if (paymentsClient === null) {
            var googlePayEnvironment = 'TEST';
            if (environment === 'PROD') {
                googlePayEnvironment = 'PROD';
            }
            paymentsClient = new google.payments.api.PaymentsClient({environment: googlePayEnvironment});
        }
        return paymentsClient;
    };

    // To prefetch payment data we need base + tokenizationSpecification
    var _getCardPaymentMethod = function (paymentProductSpecificInputs, networks) {
        return Object.assign(
            {},
            _getBaseCardPaymentMethod(networks),
            {
                tokenizationSpecification: _getTokenizationSpecification(paymentProductSpecificInputs)
            }
        );
    }

    return {
        setupGooglePayAndExecute: function ($scope) {
            return $q(function (resolve, reject) {
                var paymentProductSpecificInputs = $scope.connect.paymentProductSpecificInputs;

                if (paymentProductSpecificInputs.googlePay) {
                    var _networks = paymentProductSpecificInputs.googlePay.networks;
                    if (_networks && _networks.length > 0) {
                        var paymentsClient = _getGooglePaymentsClient($scope.environment);
                        paymentsClient.loadPaymentData(_getGooglePaymentDataRequest(paymentProductSpecificInputs, _networks, $scope.connect.paymentDetails))
                            .then(function (paymentData) {
                                // Get the payment product so the paymentRequest can be completed
                                // We do this here because Google does not allow async calls to be done between clicking and opening the payment sheet with 'loadPaymentData'.
                                $scope.connect.session.getPaymentProduct(googlePayId, $scope.connect.paymentDetails, paymentProductSpecificInputs).then(function (paymentProduct) {
                                    // We need to set the paymentProduct for the encryptor to be able to do it's work.
                                    $scope.connect.paymentRequest.setPaymentProduct(paymentProduct);
                                    // Set the value for encryptedPaymentData which is returned by the Google Pay payment sheet.
                                    $scope.connect.paymentRequest.setValue('encryptedPaymentData', paymentData.paymentMethodData.tokenizationData.token);
                                    // return resolve to encrypt paymentrequest
                                    resolve($scope.connect.paymentRequest);
                                }, function () {
                                    $scope.hasError = true;
                                });
                            })
                            .catch(function (err) {
                                // statusCode: "CANCELED"  is when payment sheet closes -> do nothing
                                // statusCode: "BUYER_ACCOUNT_ERROR" The current Google user is unable to provide payment information. -> do nothing (cancel button on details is the way out)
                                switch (err.statusCode) {
                                    case 'DEVELOPER_ERROR':
                                    case 'INTERNAL_ERROR':
                                        reject('Oops! Something went wrong: ' +  err.statusCode);
                                        break;
                                    default:
                                        reject('statusCode: ' + err.statusCode);
                                        break;
                                }
                            });
                    } else {
                        reject('There are no product networks available.');
                    }
                } else {
                    reject('There is no payment context');
                }
            });
        }
    }
}]);