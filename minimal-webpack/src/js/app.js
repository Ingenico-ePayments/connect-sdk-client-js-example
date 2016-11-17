var connect = require('connect-sdk-client-js/dist/connectsdk.noEncrypt');

var sessionDetails = {
    clientSessionID: "",
    customerId: "",
    region: "EU",
    environment: "SANDBOX"
};

var paymentDetails = {
    totalAmount: 10000,
    countryCode: "NL",
    locale: "NL_nl",
    currency: "EUR",
    isRecurring: false
};

var cardNumber = '4567 3500 0042 7977';

var session = new connect(sessionDetails);

createPayload(session, cardNumber, paymentDetails);