requirejs(["connectsdk.Session", "config"], function (sdksession, config) {
    var sessionDetails = {
        clientSessionId: config.clientSessionId || null,
        customerId: config.customerId || null,
        clientApiUrl: config.clientApiUrl || null,
        assetUrl: config.assetUrl || null
    };

    var paymentDetails = {
        totalAmount: 10000,
        countryCode: "NL",
        locale: "nl_NL",
        currency: "EUR",
        isRecurring: false
    };
    // check if the sessionDetails are filled; this is vital for continueing
    if (sessionDetails.clientSessionId === null || sessionDetails.customerId === null || sessionDetails.clientApiUrl === null || sessionDetails.assetUrl === null) {
        console.error("please provide the clientSessionId, customerId, clientApiUrl and assetUrl in the sessionDetails");
        document.querySelector('.output').innerText = "please provide the clientSessionId, customerId, clientApiUrl and assetUrl in the sessionDetails";
    }
    var session = new sdksession(sessionDetails);
    var cardNumber = '4567 3500 0042 7977';

    // now we can use this information to do the lookup and create the payment, this is common for all module loaders.
    createPayload(session, cardNumber, paymentDetails);
});
