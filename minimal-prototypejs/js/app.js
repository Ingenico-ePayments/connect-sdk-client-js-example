var sessionDetails = {
    clientSessionId: config.clientSessionId || null,
    customerId: config.customerId || null,
    region: config.region || null,
    environment: config.environment || null
};

var paymentDetails = {
    totalAmount: 10000,
    countryCode: "NL",
    locale: "nl_NL",
    currency: "EUR",
    isRecurring: false
};
// check if the sessionDetails are filled; this is vital for continueing
if (sessionDetails.clientSessionId === null || sessionDetails.customerId === null || sessionDetails.region === null || sessionDetails.environment === null) {
    console.error("please provide the clientSessionId, customerId, region and environment in the sessionDetails");
    document.querySelector('.output').innerText = "please provide the clientSessionId, customerId, region and environment in the sessionDetails";
}
var cardNumber = '4567 3500 0042 7977';

var session = new connectsdk.Session(sessionDetails);

createPayload(session, cardNumber, paymentDetails);