var $ = require('jQuery');
window.forge = require('node-forge');
var connectSDK = require('connectsdk.session');
var Handlebars = require('handlebars');
require('jquery-validation');
require('bootstrap');

require('./validate-defaults');
require('./paymentitem-afterpay-helpers');
require('./paymentitem-formatter');

$(function () {

    function _updateCustomerDetailView(customerDetails, isRedirect) {
        // Remove old information from inputs
        $(".customer-detail-fields input").val("");
        
        // update detail page 
        $.each(customerDetails, function(key, value){
            $("#" + key).val(value);
       
            // set lookup summary in advance
            $("#lookupSummary_" + key).text(value);
        });
       
        this.lookupSearchIsDone = true;
        var isMissingRequiredInput = false;

        // Check all required inputs values are filled out 
        $(".customer-detail-fields input").each(function(index) {
            var inputValue = $(this).val();
            var isRequired = $(this).prop("required");

            if(!inputValue && isRequired){
                isMissingRequiredInput = true;
                $(this).parents(".form-group").addClass("has-error");
            }
        });
 
        if(!isMissingRequiredInput){
            // Show lookup summary if all required inputs are filled out
            $("#lookupSummary").show();
            $("#lookupFields").hide();
            $("#billingDetailTitle").hide();
            $(".customer-detail-fields").hide();
            
            $("#lookupFields input").each(function(){
                var lookupFieldId = this.id;
                var lookupFieldValue = this.value;
                // Fill lookup summary labels that do not return from API 
                // with the information that already in hand
                $("#lookupSummary_" + lookupFieldId).text(lookupFieldValue);    
            });

            // Redirect to payment if all required inputs are filled out and user clicked pay button
            if(isRedirect == "redirectToPayment"){
                $(".validatedForm").submit();
            }
        }else{
            $(".customer-detail-fields").show();
        }
    }

    function _fetchCustomerDetailsAndUpdateView(lookupFields, paymentProductId, countryCode, isRedirect) {
        var customerDetailsPayload = {
            "countryCode" : countryCode,
            "values": []
        };

        // add all query parameters
        $.each(lookupFields, function (index, field) {
            var inputVal = $("#" + field.id).val();
            customerDetailsPayload.values.push({
                "key" : field.id,
                "value" : inputVal
            });
        });

        $("#loading").show();
        session.getCustomerDetails(paymentProductId, customerDetailsPayload).then(
            function (customerDetails) {
                _updateCustomerDetailView(customerDetails, isRedirect); 
                $("#loading").hide();
                $("#searchCustomerDetailsAlert").hide();
            },        
            function(error){
                $("#loading").hide();

                var errorMessage = 'No information could be found with the information provided. Please try again with different values or provide your information manually.';
                
                $("#searchCustomerDetailsAlert").html(errorMessage);
                $("#searchCustomerDetailsAlert").show();
            });
    }
    
    function _searchCustomerDetails(lookupFields, isRedirect){
        event.preventDefault();    
        var isEmptyLookupFields = false;

        $.each(lookupFields, function(i, field){
            if(!$("#" + field.id).val()){
                $("#" + field.id).parents(".form-group").addClass("has-error");
                isEmptyLookupFields = true;
            }
        })  

        if(!isEmptyLookupFields){
            _fetchCustomerDetailsAndUpdateView(lookupFields, paymentItem.id, paymentDetails.countryCode, isRedirect);
            $("#enterDetailManually").hide();
            $(".customer-detail-fields").show();
        }
    }
	
    function _showPaymentItem(id) {
        $("#loading").show();

        session.getPaymentProduct(id, paymentDetails).then(function (paymentProduct) {
            $("#loading").hide();
            paymentRequest.setPaymentProduct(paymentProduct);

            var accountOnFile = null;
            if (accountOnFile) {
                paymentRequest.setAccountOnFile(accountOnFile);
            }

            if (paymentProduct.paymentProductFields.length === 0) {
                encrypt();
            } else {
                _renderPage(paymentProduct, $("#detail-template").html(), accountOnFile, false);
            }
        }, function () {
            $("#loading").hide();
            $("#error").fadeIn();
        });
    }

    function _renderPage(paymentItem, source, accountOnFile, isGroup) {
        var productName = paymentItem.displayHints.label;
        var template = Handlebars.compile(source);
        var json = paymentItem.json;
        this.paymentItem = paymentItem;

        // We now add some additional stuff to the JSON object that represents the selected payment product so handlebars
        // can actually fill out all the variables in its template. Some of these values for these variables are not
        // available in the core payment product info so we add them.
        var lookupFields = [];
        $.each(json.fields, function (index, field) {

            if(field.usedForLookup) {
                lookupFields.push(field);
            }

            // B) The paymentDetails so we can use its data in the field renderer; useful for printing currency etc.
            field.paymentContext = paymentDetails;
            
			// indicate that we have an installmentId
			if(field.id === "installmentId") {
                field.isInstallmentsField = true;
                json.isInstallmentsField = true;
				field.displayHints.formElement.valueMapping.forEach(function(valueMapping) {
					var getDEVal = function(elementId) {
						var val = "";
						valueMapping.displayElements.forEach(function(displayElement) {
							if(displayElement.id === elementId) {
								val = displayElement.value;
							}
						});
						return val;
					};
					
					valueMapping.displayName = paymentDetails.currency + " " + getDEVal("installmentAmount") + " in " + getDEVal("numberOfInstallments") + " installments";
					valueMapping.displayInterestRate = {
						name: "Interest rate",
						value: getDEVal("interestRate")
					};
					valueMapping.displayEffectiveInterestRate = {
						name: "Effective interest rate",
						value: getDEVal("effectiveAnnualPercentageRate")
					};
					valueMapping.displayStartupFee = {
						name: "Startup fee",
						value:  paymentDetails.currency + " " + getDEVal("startupFee")
					};
					valueMapping.displayMonthlyFee = {
						name: "Monthly fee",
						value:  paymentDetails.currency + " " + getDEVal("monthlyFee")
					};
					valueMapping.displayTotalAmount = {
						name: "Total amount to pay",
						value:  paymentDetails.currency + " " + getDEVal("totalAmount")
					};
					valueMapping.displaySecciUrl = {
						name: "SECCI",
						value: getDEVal("secciUrl")
					};
				});
			}
            
            // indicates that we have terms and conditions field
			if(field.id === "termsAndConditions") {
                field.isTermAndConditionsField = true
                
                var termsAndConditionsTemplate = '<label for="' + field.id + '">' + field.displayHints.label + '</label>';
                var termsAndConditionsLink = '<a id="' + field.id + '" class="btn-link" href="'+ field.displayHints.link  + '" target="_blank">'+ json.displayHints.label + '</a>';
                termsAndConditionsTemplate = termsAndConditionsTemplate.replace("{link}", termsAndConditionsLink);
                field.displayHints.termsAndConditionsTemplate = termsAndConditionsTemplate;
            } 
            
            switch(field.displayHints.formElement.type) {
                case "list":
                    field.displayHints.formElement.isListType = true;
                    break;

                case "date":
                    field.displayHints.formElement.isDateType = true;
                    field.displayHints.formElement.daySelectOptions = [1, 2, 3, 4, 5, 6, 7, 8 ,9 , 10, 11 , 12, 13, 14, 15, 16, 17, 18, 19, 20, 21 ,22 ,23 ,24 ,25 ,26, 27, 28, 29, 30, 31];
                    field.displayHints.formElement.monthSelectOptions = [1, 2, 3, 4, 5, 6, 7, 8 ,9 , 10, 11 , 12];
                    field.displayHints.formElement.yearSelectOptions = [];
                    var yy = 1900;
                    var currentYY = new Date().getFullYear();
                    for(yy = 1900; yy <= currentYY; yy++) {
                        field.displayHints.formElement.yearSelectOptions.push(yy);
                    }
                    break;
                
            }
            
			// indicates no special field we have to consider for rendering
            field.isDetailField = !(field.isInstallmentsField===true || 
                                    field.usedForLookup===true ||
									field.isTermAndConditionsField ===true);
        });

        // the search button is located  to the last lookup input field and hide detailFields
        // or hide search button and show detailFields
        if(lookupFields.length > 0) {
            json.hasLookupFields = true;
            json.lookupFields = lookupFields;
            lookupFields[lookupFields.length-1].showLookupButton = true;
            json.hideCustomerDetailFields = true; 
        } else {
            json.hasLookupFields = false;
        }

        // E) There's one field that we should add to the form that is not included in the payment product fields list for
        // a payment product: the "remember me" option, aka : tokenization. It's only visible if the payment product
        // itself allows it: allowsTokenization === true && autoTokenized === false.  (If autoTokenized === true it will
        // get tokenized automatically by the server and we do not need to show the checkbox).

        // for groups a different logic is in place: if the payment is recurring the checkbox should be shown.
        if (isGroup) {
            json.showRememberMe = paymentDetails.isRecurring;
        } else {
            json.showRememberMe = json.allowsTokenization === true && json.autoTokenized === false;
        }

        // Set the billing detail title depending on lookup section and installments existence
        if(json.hasLookupFields || json.isInstallmentsField){
            json.showBillingDetailTitle = true;
        } 

        if(json.hasLookupFields){
            json.showBillingDetailTitlePopover = true;
        }

        // Set the product name
        $("#paymentProductName").html(productName);

        // We have extended the JSON object that represents the payment product so that it contains
        // all the necessary information to fill in the Handlebars template. Now we generate the
        // HTML and add it to the DOM.
        $("#handlebarsDrop").html(template(json));
        if (!json.showRememberMe) {
            $("#rememberme").closest('.checkbox').hide();
        }

        // 2) Add validators to each of the fields in the form
        connect.addValidators(paymentItem);

        // 3) Add submit handling for when the user finishes filling out the form

        // After the customer is done filling out the form he submits it. But instead of sending the form to the server
        // we validate it and if successful we encrypt the result. Your application should send the cypher text to
        // your e-commerce server itself.
        $(".validatedForm").validate({
            submitHandler: function (e) {

                // We create an object with key:value pairs consisting on the id of the paymentproductfield
                // and its value as presented (with or without mask).
                var blob = {};

                // We only add the form elements that have the "data-includeInEncryptedBlob=true" attribute; which we've added
                // to each input/select when we created the form.
                $(".validatedForm [data-includeInEncryptedBlob=true]").each(function () {

                    if ($(this).attr("id").indexOf("-baseCurrencyUnit") !== -1 || $(this).attr("id").indexOf("-centecimalCurrencyUnit") !== -1) {
                        // The example application splits up currency fields into two fields: base currency and cents
                        // We need to merge the values of these two fields again because the SDK only accepts one
                        // value per field (and it expects the complete value in cents in this case)
                        var id = $(this).attr("id").substring(0, $(this).attr("id").indexOf("-"));
                        if ($(this).attr("id").indexOf("-baseCurrencyUnit") !== -1) {
                            blob[id] = (blob[id]) ? (Number(blob[id]) + Number($(this).val() * 100)) + '' : Number($(this).val() * 100) + '';
                        }
                        if ($(this).attr("id").indexOf("-centecimalCurrencyUnit") !== -1) {
                            blob[id] = (blob[id]) ? (Number(blob[id]) + Number($(this).val())) + '' : Number($(this).val()) + '';
                        
                        }
                    } else if($(this).attr("id") === "termsAndConditions") {
                        var anId = $(this).attr("id");
                        blob[anId] = $("#" + anId).is(":checked") ? "true" : "false";
                    } else if($(this).attr("id").startsWith("dateOfBirth")) {
                        // we collect all three entries (year,month,day) in one go.
                        if(!("dateOfBirth" in blob)) {
                            var alignDate = function(dateVal) {
                                return (dateVal < 10 ? ("0" + dateVal) : dateVal);
                            }
                            var dateOfBirthYear = $("#dateOfBirth_year").val();
                            var dateOfBirthMonth = alignDate($("#dateOfBirth_month").val());
                            var dateOfBirthDay = alignDate($("#dateOfBirth_day").val());
    
                            blob["dateOfBirth"] = dateOfBirthYear + dateOfBirthMonth + dateOfBirthDay;                                
                        }
                    } else {
                        // In all other cases just us ethe entered value
                        blob[$(this).attr("id")] = $(this).val();
                    }
                });

                // Remember that we need to add all entered values to paymentRequest so they will be included in the
                // encryption later on.
                for (var key in blob) {
                    paymentRequest.setValue(key, blob[key]);
                }

                // encrypt the paymentRequest
                encrypt();

                // Cancel submitting the form
                return false;
            }
            
        });

        $("#primaryButton").click(function(event){

            var isLookupSummaryVisible = $("#lookupSummary").is(":visible");
            
            if(paymentItem.json.hasLookupFields && !isLookupSummaryVisible && typeof lookupSearchIsDone == "undefined"){
                var emptyLookupInputs = 0;

                $("#lookupFields input").each(function(e){
                    if(!this.value){
                        emptyLookupInputs++;
                    }
                })

                if(emptyLookupInputs == 0){
                    _searchCustomerDetails(lookupFields, "redirectToPayment");
                    event.preventDefault();
                }
            }
        });

        $("#installmentId").click(function() {
			$('table[id^=installment_details_]').each(function(index) {
				$(this).hide();
			});
			
			var installmentId = $("#installmentId").val();
			$("#installment_details_" + installmentId).show();
        });
        
        $("#searchButton").click(function(event) {
            _searchCustomerDetails(lookupFields, "noRedirecttoPayment");
        });

        $("#enterDetailManually").click(function() {
            event.preventDefault();
            $("#enterDetailManually").hide();
            $(".customer-detail-fields").show();
        });

        $("#editInformationButton").click(function(){
            $("#lookupSummary").hide();
            $(".customer-detail-fields").show();
        });

        $("#searchConsumerAgainButton").click(function(){
            $("#lookupSummary").hide();
            $("#lookupFields").show();
        });
        
        // 4) Add handlers for some additional bells and whistles (such as tooltips, IIN lookups, etc)

        // A) Sometimes we show the "tokenize payment" checkbox (See above). Because of this special way of including the
        //    field we also need a separate handling of it. That is done here.
        $("#rememberme").on("change", function () {
            paymentRequest.setTokenize($(this).is(":checked"));
        });

        // B) Some fields have tooltips (e.g. the CVV code field). We initialize the popups that contain those tooltips here.
        $('.info-popover').popover();

        // C) We mask the fields that need masking as defined in the payment product field definition. Either use use a jquery masked
        //    input plugin, or write your own. In this example we use jquery formatter plugin, which is included in this file at the
        //    bottom.

        connect.updateFieldMask(paymentItem);

    };

    function encrypt() {

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
        });
    }

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
    };
    var grouping = context.grouping;
    var session = new connectSDK(sessionDetails);
    var paymentRequest = session.getPaymentRequest();

    var search = document.location.search;
    if (search) {
        search = search.substring(1);
        search = search.split("&");
        $.each(search, function (i, part) {
            part = part.split("=");
            if (part[0] === "paymentitemId") {
                _showPaymentItem(part[1]);
            }
        })
    } else {
        $("#error").fadeIn();
    }
});