var $ = require('jQuery');
window.forge = require('node-forge');
var connect = require('connectsdk.session');
var handlebars = require('handlebars');
var setupAndroidPayAndExecute = require('./paymentitem-androidpay');
var cardHelpers = require('./paymentitem-cards-helpers');
var androidPayId = 320;

$(function () {
    function _getPaymentItems() {
        $("#loading").show();
        session.getBasicPaymentItems(paymentDetails, grouping, paymentProductSpecificInputs).then(function (basicPaymentItems) {
            $("#loading").hide();

            // let's build up the page :)

            // get all accountsonfile for all visible paymentitems
            var aof = basicPaymentItems.accountsOnFile;

            // get all paymentitems for the paymentDetails
            var items = basicPaymentItems.basicPaymentItems;

            // Create view to show both account on file as well as all payment items.
            var view = {
                accountsOnFile: aof.map(function(accountOnFile) {
                  var data = accountOnFile.json;

                  // since we separate the payment methods in different views
                  // for example: `paymentitem-cards.html`, `paymentitem-non-cards.html`
                  // we need to tell handlebars to open which template, we do this by adding the
                  // `data-payment-method`
                  var extendedData = {};
                  for (var i = 0, j = items.length; i < j; i += 1) {
                    var paymentItem = items[i];
                    var paymentItemAccountOnFile = paymentItem.accountsOnFile.length > 0 ? paymentItem.accountsOnFile[0] : null;

                    // we are only interested in the same `id` and `paymentProductId`
                    if (!paymentItemAccountOnFile) continue;
                    if (paymentItemAccountOnFile.id !== accountOnFile.id) continue;
                    if (paymentItemAccountOnFile.paymentProductId !== accountOnFile.paymentProductId) continue;

                    // set extended data
                    extendedData = {
                      paymentMethod: paymentItem.id,
                      type: paymentItem.json.type
                    }
                    break;
                  }

                  // overwrite extendedData properties (`paymentMethod` & `type`)
                  for (prop in extendedData) {
                    data[prop] = extendedData[prop];
                  }

                  return data;
                }),

                paymentItems: items.map(function(paymentItem) {
                  return paymentItem.json;
                })
            };

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

                    // get search query params
                    var search = '?' + [
                      {key: 'paymentitemId', value: id},
                      {key: 'type', value: type},
                      {key: 'accountOnFileId', value: aofid}
                    ].filter(function(obj) {
                      return typeof obj.value !== 'undefined';
                    }).map(function(obj) {
                      return obj.key + '=' + obj.value;
                    }).join('&');

                    // now redirect based on type
                    if ((id === 'cards' && type === 'group') || method === "card" || method === 'cards') {
                        // redirect to a specific page for card payments
                        document.location.href = 'paymentitem-cards.html' + search;
                    } else if (id === 1503) {
                        document.location.href = 'paymentitem-boleto.html' + search;
                    } else if (id === androidPayId) {
                        setupAndroidPayAndExecute(session, context, paymentDetails, paymentRequest, paymentProductSpecificInputs);
					} else if(id === 9000 || id === 9001) {
                        // redirect to a specific page for card payments
                        document.location.href = 'paymentitem-afterpay.html' + search;
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

    window.connect.addHandleBarsHelpers(session);

    _getPaymentItems();
});
