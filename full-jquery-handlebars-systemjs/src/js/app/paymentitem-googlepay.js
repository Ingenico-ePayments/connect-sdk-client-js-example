var $ = require('jQuery');
window.forge = require('node-forge');
var connect = require('connectsdk.session');
var googlePayId = 320;
var paymentsClient = null;

// Only base is needed to trigger isReadyToPay
var _getBaseCardPaymentMethod = function (networks) {
    return {
        type: 'CARD',
        parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: networks
        }
    }
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

// To prefetch payment data we need base + tokenizationSpecification
var _getCardPaymentMethod = function (paymentProductSpecificInputs, networks) {
    return Object.assign(
        {},
        _getBaseCardPaymentMethod(networks),
        {
            tokenizationSpecification: _getTokenizationSpecification(paymentProductSpecificInputs)
        }
    );
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
        "merchantName": paymentProductSpecificInputs.googlePay.merchantName
    };
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

function _getGooglePaymentsClient (environment) {
    if (paymentsClient === null) {
        var googlePayEnvironment = 'TEST';
        if (environment === 'PROD') {
            googlePayEnvironment = 'PRODUCTION';
        }
        paymentsClient = new google.payments.api.PaymentsClient({ environment: googlePayEnvironment });
    }
    return paymentsClient;
}

var encryptGooglePayPayment = function encryptGooglePayPayment (session, paymentRequest) {
    $("#loading").show();
    // Create an SDK encryptor object
    var encryptor = session.getEncryptor();
    // Encrypting is an async task that we provide you as a promise.
    encryptor.encrypt(paymentRequest).then(function (encryptedString) {
        // The promise has fulfilled.
        sessionStorage.setItem('encryptedString', encryptedString);
        document.location.href = 'dev-success.html';
    }, function (errors) {
        // The promise failed, inform the user what happened.
        $("#loading").hide();
        console.error("Failed to encrypt due to", errors);
        $("#error").fadeIn();
    });
};

var setupGooglePayAndExecute = function setupGooglePayAndExecute (session, context, paymentDetails, paymentRequest, paymentProductSpecificInputs) {
    if (context) {
        var _networks = paymentProductSpecificInputs.googlePay.networks;
        if (_networks && _networks.length > 0) {
            var paymentsClient = _getGooglePaymentsClient(context.environment);
            paymentsClient.loadPaymentData(_getGooglePaymentDataRequest(paymentProductSpecificInputs, _networks, paymentDetails))
                .then(function (paymentData) {
                    // Get the payment product so the paymentRequest can be completed
                    // We do this here because Google does not allow async calls to be done between clicking and opening the payment sheet with 'loadPaymentData'.
                    session.getPaymentProduct(googlePayId, paymentDetails, paymentProductSpecificInputs).then(function (paymentProduct) {
                        // We need to set the paymentProduct for the encryptor to be able to do it's work.
                        paymentRequest.setPaymentProduct(paymentProduct);
                        // Set the value for encryptedPaymentData which is returned by the Google Pay payment sheet.
                        paymentRequest.setValue('encryptedPaymentData', paymentData.paymentMethodData.tokenizationData.token);
                        // encrypt paymentrequest
                        encryptGooglePayPayment(session, paymentRequest);
                    }, function () {
                        $("#error").fadeIn();
                    });
                })
                .catch(function (err) {
                    // statusCode: "CANCELED"  is when payment sheet closes -> do nothing
                    // statusCode: "BUYER_ACCOUNT_ERROR" The current Google user is unable to provide payment information. -> do nothing (cancel button on details is the way out)
                    switch (err.statusCode) {
                        case 'DEVELOPER_ERROR':
                        case 'INTERNAL_ERROR':
                            console.error("Oops! Something went wrong: ", err);
                            break;
                        default:
                            console.error('statusCode:', err);
                            break;
                    }
                });
        } else {
            console.error("There are no product networks available.");
        }
    } else {
        console.error("There is no payment context");
    }
};

module.exports = setupGooglePayAndExecute;
