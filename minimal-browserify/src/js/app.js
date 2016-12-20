var connect = require('connect-sdk-client-js/dist/connectsdk.noEncrypt').connectsdk;

var sessionDetails = {
    clientSessionID: "",
    customerId: "",
    region: "EU",
    environment: "SANDBOX"
};

var paymentDetails = {
    totalAmount: 10000,
    countryCode: "NL",
    locale: "nl_NL",
    currency: "EUR",
    isRecurring: false
};

var cardNumber = '4567 3500 0042 7977';

var session = new connect.Session(sessionDetails);

createPayload(session, cardNumber, paymentDetails);
