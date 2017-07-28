var $ = require('jQuery');
window.forge = require('node-forge');
var connect = require('connectsdk.session');
var androidPayId = 320;

var getRequestMethodData = function getRequestMethodData(networks, publicKey, context) {
    var androidPayEnvironment = 'TEST';
    if (context.environment === 'PROD') {
        androidPayEnvironment = 'PROD';
    }
    // MethodData is required to send in a valid request to the Payment Request API (PRAPI)
    var methodData = [{
        supportedMethods: ['https://android.com/pay'],
        data: {
            merchantId: '02510116604241796260',// Not required when environment = TEST
            environment: androidPayEnvironment,
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

// Details is required to send in a valid request to the PRAPI. The bare minimum has been added
var getRequestDetails = function getRequestDetails() {
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

// Options is optional to send to the PRAPI, to be sure we set all options to false
var getOptions = function getOptions() {
    var options = {
        requestShipping: false,
        requestPayerEmail: false,
        requestPayerPhone: false,
        requestPayerName: false
    };
    return options;
}

var encryptAndroidPayPayment = function encryptAndroidPayPayment(session, paymentResponse, paymentRequest) {
    $("#loading").show();
    // Create an SDK encryptor object
    var encryptor = session.getEncryptor(forge);
    // Encrypting is an async task that we provide you as a promise.
    encryptor.encrypt(paymentRequest).then(function (encryptedString) {
        // The promise has fulfilled.
        sessionStorage.setItem('encryptedString', encryptedString);
        // make sure the android pay native ui is closed
        paymentResponse.complete();
        document.location.href = 'dev-success.html';
    }, function (errors) {
        // The promise failed, inform the user what happened.
        $("#loading").hide();
        console.error("Failed to encrypt due to", errors);
        $("#error").fadeIn();
    });
}

var setupAndroidPayAndExecute = function setupAndroidPayAndExecute(session, context, paymentDetails, paymentRequest, paymentProductSpecificInputs) {
    if (context) {
        // Retrieve the networks needed for the request to the PRAPI
        session.getPaymentProductNetworks(androidPayId, context).then(function (jsonNetworks) {
            // When there are 0 networks, it is not possible to directly pay with Android Pay
            if (jsonNetworks.networks && jsonNetworks.networks.length > 0) {
                // Retrieve the publicKey used for encrypting, needed for the request to the PRAPI
                session.getPaymentProductPublicKey(androidPayId).then(function (jsonPublicKey) {
                    // Get the payment product so the paymentRequest can be completed
                    session.getPaymentProduct(androidPayId, paymentDetails, paymentProductSpecificInputs).then(function (paymentProduct) {
                        paymentRequest.setPaymentProduct(paymentProduct);
                        // setup the data needed for the PRAPI
                        var methodData = getRequestMethodData(jsonNetworks.networks, jsonPublicKey.publicKey, context);
                        var details = getRequestDetails();
                        var options = getOptions();
                        var request = new PaymentRequest(methodData, details, options);
                        // Show android pay UI
                        request.show().then(function (paymentResponse) {
                            paymentRequest.setValue('encryptedPaymentData', paymentResponse.details.paymentMethodToken);
                            // paymentResponse.requestId is not returned in the paymentResponseObject when testing, this id maps to transactionId in the gateway
                            paymentRequest.setValue('transactionId', 'dummy-id');
                            // encrypt paymentrequest
                            encryptAndroidPayPayment(session, paymentResponse, paymentRequest);
                        }).catch(function (err) {
                            console.error("Payment request API returned an error: ", err);
                        });
                    }, function () {
                        $("#error").fadeIn();
                    });
                });
            } else {
                console.error('There are no available networks');
            }
        }, function () {
            console.error('networks call failed');
        });
    } else {
        console.error("There is no payment context");
    }
}

module.exports = setupAndroidPayAndExecute;