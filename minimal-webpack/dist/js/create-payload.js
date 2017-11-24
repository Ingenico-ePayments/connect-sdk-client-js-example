var createPayload = function (session, cardNumber, paymentDetails) {
    session.getIinDetails(cardNumber, paymentDetails).then(function (iinDetailsResponse) {
        if (iinDetailsResponse.status !== "SUPPORTED") {
            console.error("Card check error: " + iinDetailsResponse.status);
            document.querySelector('.output').innerText = 'Something went wrong, check the console for more information.';
            return;
        }
        session.getPaymentProduct(iinDetailsResponse.paymentProductId, paymentDetails).then(function (paymentProduct) {
            var paymentRequest = session.getPaymentRequest();
            paymentRequest.setPaymentProduct(paymentProduct);
            paymentRequest.setValue("cardNumber", cardNumber);
            paymentRequest.setValue("cvv", "123");
            paymentRequest.setValue("expiryDate", "04/20");

            if (!paymentRequest.isValid()) {
                for (var error in paymentRequest.getErrorMessageIds()) {
                    console.error('error', error);
                }
            }
            session.getEncryptor().encrypt(paymentRequest).then(function (paymentHash) {
                document.querySelector('.output').innerText = 'Encrypted to: ' + paymentHash;
            }, function (errors) {
                console.error('Failed encrypting the payload, check your credentials');
                document.querySelector('.output').innerText = 'Something went wrong, check the console for more information.';
            });

        }, function () {
            console.error('Failed getting payment product, check your credentials');
            document.querySelector('.output').innerText = 'Something went wrong, check the console for more information.';
        });

    }, function () {
        console.error('Failed getting IinDetails, check your credentials');
        document.querySelector('.output').innerText = 'Something went wrong, check the console for more information.';
    });
}
