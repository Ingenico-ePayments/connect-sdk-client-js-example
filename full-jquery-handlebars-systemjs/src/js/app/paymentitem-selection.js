var $ = require('jQuery');
window.forge = require('node-forge');
var connect = require('connectsdk.session');
var handlebars = require('handlebars');
var setupAndroidPayAndExecute = require('./paymentitem-androidpay');
var androidPayId = 320;

$(function () {
    function _getPaymentItems() {
        $("#loading").show();
        session.getBasicPaymentItems(paymentDetails, grouping, paymentProductSpecificInputs).then(function (basicPaymentItems) {
            $("#loading").hide();
            // let's build up the page :)
            // Create view to show both account on file as well as all payment items.
            var view = {
                accountsOnFile: [],
                paymentItems: []
            };
            // get all accountsonfile for all visible paymentitems
            var aof = basicPaymentItems.accountsOnFile;

            // add these to the view object
            $.each(aof, function () {
                view.accountsOnFile.push(this.json);
            });

            // get all paymentitems for the paymentDetails
            var items = basicPaymentItems.basicPaymentItems;

            // and add these to the view as well.
            $.each(items, function () {
                view.paymentItems.push(this.json);
            });

            // build the handlebars template
            var source = $("#list-template").html();
            var template = handlebars.compile(source);

            // and show it on the screen
            $("#handlebarsDrop").html(template(view));

            // Delegate a click on the list of paymentitems to get the details of a single paymentitem.
            // Note that we have included some code to handle history management as well. If you use a MVC based
            // framework this should be handled by the framework.
            $("body")
                .off("click", "#paymentoptionslist button")
                .on("click", "#paymentoptionslist button", function (e) {
                    e.preventDefault();

                    // Get the id of the clicked payment item or the ids of the clicked account on file and its
                    // associated payment item.
                    var id, aofid, type, method;
                    if ($(this).data("payment-id")) {
                        // the user clicked on a payment item
                        id = $(this).data("payment-id");
                        aofid = null;
                        type = $(this).data("payment-type");
                        method = $(this).data("payment-method");
                    } else {
                        // the user clicked on an account on file
                        id = $(this).data("aof-ppid");
                        aofid = $(this).data("aof-id");
                        method = $(this).data("payment-method");
                    }
                    var search = '?paymentitemId=' + id;
                    if (aofid) {
                        search += '&accountOnFileId=' + aofid;
                    }
                    search += '&type=' + type;

                    // now redirect based on type
                    if ((id === 'cards' && type === 'group') || method === "card") {
                        // redirect to a specific page for card payments
                        document.location.href = 'paymentitem-cards.html?paymentitemId=' + id;
                    } else if (id === 1503) {
                        document.location.href = 'paymentitem-boleto.html' + search;
                    } else if (id === androidPayId) {
                        setupAndroidPayAndExecute(session, context, paymentDetails, paymentRequest, paymentProductSpecificInputs);
                    } else {
                        // otherwise redirect o the details page
                        document.location.href = 'paymentitem-non-cards.html' + search;
                    }
                });
        }, function () {
            $("#loading").hide();
            $("#error").fadeIn();
        });
    };

    var context = sessionStorage.getItem('context');
    if (!context) {
        document.location.href = 'dev-start.html';
    }
    context = JSON.parse(context);
    var sessionDetails = {
        clientSessionId: context.clientSessionId,
        customerId: context.customerId,
        clientApiUrl: context.clientApiUrl,
        assetUrl: context.assetUrl
    };
    var paymentDetails = {
        totalAmount: context.totalAmount,
        countryCode: context.countryCode,
        locale: context.locale,
        isRecurring: context.isRecurring,
        currency: context.currency
    }
    var grouping = context.grouping;
    // If you want to use Android Pay in your application, a merchantId is required to set it up.
    var paymentProductSpecificInputs = {
        androidPay: {
            merchantId: "02510116604241796260"
        }
    }
    var session = new connect(sessionDetails);
    var paymentRequest = session.getPaymentRequest();

    _getPaymentItems();
});