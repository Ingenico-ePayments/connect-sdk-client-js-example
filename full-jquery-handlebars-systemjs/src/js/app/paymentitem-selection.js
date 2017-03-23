var $ = require('jQuery');
window.forge = require('node-forge')();
var connect = require('connectsdk.session');
var Handlebars = require('handlebars');

$(function () {
    function _getPaymentItems() {
        $("#loading").show();
        session.getBasicPaymentItems(paymentDetails, grouping).then(function (basicPaymentItems) {
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
            var template = Handlebars.compile(source);

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
                        document.location.href = 'paymentitem-cards.html?paymentitemId='+ id;
                    } else if (id === 1503) {
                        document.location.href = 'paymentitem-boleto.html' + search;
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
        clientSessionID: context.clientSessionId,
        customerId: context.customerId,
        region: context.region,
        environment: context.environment
    };
    var paymentDetails = {
        totalAmount: context.amountInCents,
        countryCode: context.countryCode,
        locale: context.locale,
        isRecurring: context.isRecurring,
        currency: context.currencyCode
    }
    var grouping = context.grouping;
    var session = new connect(sessionDetails);
    var paymentRequest = session.getPaymentRequest();

    _getPaymentItems();
});