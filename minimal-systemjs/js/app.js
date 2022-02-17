var connect = require('connectsdk.Session');

var sessionDetails = {
    clientSessionId: "",
    customerId: "",
    clientApiUrl: "",
    assetUrl: ""
};

var paymentDetails = {
    totalAmount: 10000,
    countryCode: "NL",
    locale: "nl_NL",
    currency: "EUR",
    isRecurring: false
};

var cardNumber = '4567 3500 0042 7977';

var session = new connect(sessionDetails);

createPayload(session, cardNumber, paymentDetails);
