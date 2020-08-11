app.controller('paymentitem.controller', ['$rootScope', '$scope', '$location', '$log', '$routeParams', '$sce', function ($rootScope, $scope, $location, $log, $routeParams, $sce) {
    "use strict";

    $scope.id = $routeParams.id;
    $scope.type = $routeParams.type;
    $scope.aofId = $routeParams.aof;

    $scope.hasError = false;
    $scope.showCobrands = false;

    $scope.doValidate = false;

    $scope.item = {};

    $rootScope.loading = true;

    $scope.maskoptions = {
        clearOnBlur: false,
        addDefaultPlaceholder: false,
        clearOnBlurPlaceholder: true,
        allowInvalidValue: true
    }

    // This keys will be deprecated once the feature that allows the user uses language packages is released
    $scope.installmentLanguageKeys = {
        "numberOfInstallments": "Number of Installments",
        "installmentAmount": "Installment Amount",
        "interestRate": "Interest Rate",
        "effectiveAnnualPercentageRate": "Effective interest rate",
        "startupFee": "Startup Fee",
        "monthlyFee": "Monthly Fee",
        "totalAmount": "Total Amount to pay",
        "secciUrl": "SECCI"
    }

    // This keys will be deprecated once the feature that allows the user uses language packages is released
    $scope.afterpayLookupPopoverContent = "By filling in the requested information below, we can find the other required information to allow you to finalize the payment process. If you want to, you can also choose to fill in this required information manually."

    $scope.showLookupSummary = false;

    $scope.getPaymentItem = function () {
        $scope.hasError = false;
        $rootScope.loading = true;

        if ($scope.type === 'group') {
            $scope.showPaymentProductGroup($scope.id);
        } else {
            $scope.showPaymentProduct($scope.id);
        }
    };

    $scope.showPaymentProductGroup = function (id) {
        $scope.connect.session.getPaymentProductGroup(id, $scope.connect.paymentDetails).then(function (paymentProductGroup) {
            $scope.$apply(function () {
                $rootScope.loading = false;
                $scope.paymentitem = paymentProductGroup;
                $scope.fixMask();
                $scope.createHtmlTooltips();
            });
        }, function () {
            $scope.$apply(function () {
                $scope.hasError = true;
                $rootScope.loading = false;
                $log.error('error while getting the payment product with id ' + id);
            });
        })
    };

    $scope.showPaymentProduct = function (id) {
        if ($scope.paymentitem && $scope.paymentitem.id === id) {
            $rootScope.loading = false;
        } else {
            $scope.connect.session.getPaymentProduct(id, $scope.connect.paymentDetails).then(function (paymentProduct) {
                $rootScope.loading = false;
                $scope.$apply(function () {
                    $scope.paymentitem = paymentProduct;
                    $scope.fixMask();
                    $scope.createHtmlTooltips();

                    $scope.connect.paymentRequest.setPaymentProduct(paymentProduct);
                    $scope.encryptIfNofields();

                    if ($scope.aofId) {
                        $scope.handleAccountOnFile();
                    }

                    if (id === '1503') {
                        $scope.boletoHelper(paymentProduct);
                    }

                    if (id === '9000' || id === '9001') {
                        $scope.setSpecificInputs();
                        $scope.setLookupSection();
                        $scope.setLookupPopoverContent();
                    }
                });
            }, function () {
                $scope.$apply(function () {
                    $scope.hasError = true;
                    $rootScope.loading = false;
                    $log.error('error while getting the payment product with id ' + id);
                });
            });
        }
    };

    $scope.encryptIfNofields = function () {
        if ($scope.paymentitem.paymentProductFields.length === 0) {
            encrypt();
        };
    }

    $scope.handleAccountOnFile = function () {
        // store account on file in request
        var accountOnFile = isNaN($scope.aofId) ? null : $scope.paymentitem.accountOnFileById[$scope.aofId];
        $scope.connect.paymentRequest.setAccountOnFile(accountOnFile);
        // prefill data
        angular.forEach(accountOnFile.attributes, function (attribute) {
            if ($scope.paymentitem.paymentProductFieldById[attribute.key]) {
                var masked = $scope.paymentitem.paymentProductFieldById[attribute.key].applyWildcardMask(attribute.value).formattedValue;
                $scope.item[attribute.key] = masked;
                $scope.paymentitem.paymentProductFieldById[attribute.key].aofField = true;
            }
        });
    };

    $scope.fixMask = function () {
        // we fix the mask for use with angular.ui.mask; if you use some other masking util refer to the docs of the directive.
        angular.forEach($scope.paymentitem.paymentProductFields, function (field) {
            if (field.displayHints.mask) {
                field.displayHints.uimask = field.displayHints.mask.replace(/{{/g, '').replace(/}}/g, '').replace(/9/g, '?9');
            }
        });
    }

    $scope.boletoHelper = function (paymentProduct) {
        $scope.$watch(function () {
            return $scope.item && $scope.item['fiscalNumber']
        }, function (n, o) {
            if (n && n.length >= 14) {
                $scope.isBusiness = true;
            } else {
                $scope.isBusiness = false;
            }
        });
    }

    $scope.createHtmlTooltips = function () {
        angular.forEach($scope.paymentitem.paymentProductFields, function (field) {
            if (field.displayHints.tooltip) {
                var tooltip = field.displayHints.tooltip;
                field.displayHints.htmltooltip = $sce.trustAsHtml(tooltip.label + " <br /><img src='" + tooltip.image + "?size=240x160' width='240' height='160'>");
            }
        });
    }

    $scope.startApplePay = function () {
        var networks = $scope.paymentitem.paymentProduct302SpecificData.networks;
        $scope.connect.session.createApplePayPayment($scope.connect.paymentDetails, $scope.connect.paymentProductSpecificInputs.applePay, networks).then(function (res) {
            var request = $scope.connect.session.getPaymentRequest();
            request.setValue('encryptedPaymentData', res.data.paymentData.data)
            encrypt()
        }, function (res) {
            $rootScope.loading = false;
            $scope.$apply(function () {
                console.error(res.message);
                $location.path('/dev-failure');
                $rootScope.loading = false;
            });
        });
    }



    $scope.getPaymentProduct = function (id) {
        return $scope.connect.session.getPaymentProduct(id, $scope.connect.paymentDetails);
    };

    $scope.toggleCobrands = function () {
        $scope.showCobrands = !$scope.showCobrands;
    };

    $scope.setCobrand = function (id) {
        $scope.showCobrands = false;
        $scope.showPaymentProduct(id);
    };

    $scope.setProduct = function (id) {
        $rootScope.loading = true;
        $scope.showPaymentProduct(id);
    };

    $scope.birthDayArr = [];

    $scope.generateDateOfBirth = function (type, value) {
        if (type == "day") $scope.birthDayArr[2] = String("0" + value).slice(-2);
        if (type == "month") $scope.birthDayArr[1] = String("0" + value).slice(-2);
        if (type == "year") $scope.birthDayArr[0] = value;

        $scope.item["dateOfBirth"] = $scope.birthDayArr.join("");
    }

    $scope.doPayment = function () {
        $scope.doValidate = true;
        // check if all mandatory fields are present
        var request = $scope.connect.session.getPaymentRequest();

        if ($scope.showLookupFields && !$scope.lookupModel) {
            return;
        }

        if ($scope.showLookupFields && !$scope.isLookupSearchDone && !$scope.showLookupSummary) {
            $scope.searchCustomerDetails("redirectToPayment");
        }

        $scope.errorCustomerSearch = false;
        $scope.combineFields();

        for (var key in $scope.item) {
            // we need to supply masked values; so let's mask them here
            var field = $scope.paymentitem.paymentProductFieldById[key];
            if (field) {
                if (field.displayHints.formElement.type != 'boolean') {
                    var masked = field.applyMask($scope.item[key]).formattedValue;
                } else {
                    var masked = $scope.item[key] + '';
                }

                if (!field.aofField) {
                    request.setValue(key, masked);
                }
            } else {
                if (key === 'rememberme') {
                    request.setTokenize($scope.item[key]);
                }
            }
        }
        if (request.getPaymentProduct() && request.isValid()) {
            encrypt();
        } else {
            console.log(request.getErrorMessageIds());
            // validation errors
        }
    };

    $scope.shouldShowRememberMe = function () {
        var ret = false;
        if ($scope.paymentitem && $scope.paymentitem.id === 'cards') {
            if ($scope.connect.paymentDetails.isRecurring) {
                // recurring groups show the checkbox
                ret = true;
            }
        } else if ($scope.paymentitem) {
            if ($scope.paymentitem.allowsTokenization && !$scope.paymentitem.autoTokenized) {
                // paymentproducts that are tokenizable but not auto tokenized show the checkbox
                ret = true;
            }
        }
        return ret;
    }

    var encrypt = function () {
        var encryptor = $scope.connect.session.getEncryptor();
        var paymentRequest = $scope.connect.session.getPaymentRequest();
        $rootScope.encryptedString = null;
        if (paymentRequest.isValid()) {
            $rootScope.loading = true;
            encryptor.encrypt(paymentRequest).then(function (encryptedString) {
                $rootScope.loading = false;
                $scope.$apply(function () {
                    $rootScope.encryptedString = encryptedString;
                    $location.path('/dev-success');
                });
            }, function error (e) {
                $rootScope.loading = false;
                console.error('encryption failed', e);
                $scope.$apply(function () {
                    $rootScope.encryptedString = encryptedString;
                    $location.path('/dev-failure');
                });
            });
        } else {
            // something is wrong according to the paymentRequest;
            console.error(paymentRequest.getErrorMessageIds(), paymentRequest.getValues(), paymentRequest.getPaymentProduct());
            $scope.$apply(function () {
                $rootScope.encryptedString = encryptedString;
                $location.path('/dev-failure');
            });
        }
    };

    var context = JSON.parse(sessionStorage.getItem('context'));
    if (context) {
        $scope.connect = {}; // store all connectSDK variables in this namespace



        // split the context up in the session- and paymentDetails
        $scope.connect.sessionDetails = {
            clientSessionId: context.clientSessionId,
            customerId: context.customerId,
            clientApiUrl: context.clientApiUrl,
            assetUrl: context.assetUrl
        };
        $scope.connect.paymentDetails = {
            totalAmount: context.amountInCents,
            countryCode: context.countryCode,
            locale: context.locale,
            isRecurring: context.isRecurring,
            currency: context.currencyCode
        }

        $scope.connect.paymentProductSpecificInputs = {
            applePay: {
                merchantName: context.merchantName
            },
        }

        $rootScope.hasSession = true; // this indicates we have enough info to render a payment result page

        // use the sessionDetails to create a new session
        $scope.connect.session = new connectsdk.Session($scope.connect.sessionDetails);

        // Get the paymentRequest for this session. This is an SDK object that stores all the data
        // that the customer provided during the checkout. In the end of the checkout it will provide
        // all this information to the encryption function so that it can create the encrypted string
        // that contains all this info.
        $scope.connect.paymentRequest = $scope.connect.session.getPaymentRequest();
        // now render the page
        $scope.getPaymentItem();
    } else {
        $location.path('/start');
    }

    //AfterPay
    $scope.setSpecificInputs = function () {
        angular.forEach($scope.paymentitem.paymentProductFields, function (field) {
            if (field.id == "installmentId") {
                $scope.installmentOptions = field;
            }
            if (field.id == "dateOfBirth") {
                $scope.setBirthYearList();
            }
            if (field.id == "termsAndConditions") {
                $scope.termsAndConditions = field;
            }
        });
    }

    $scope.setLookupSection = function () {
        $scope.lookupFields = [];
        $scope.showCustomerDetailFields = false;

        angular.forEach($scope.paymentitem.paymentProductFields, function (field) {
            if (field.json["usedForLookup"]) {
                $scope.lookupFields.push(field);
            }
        });

        if ($scope.lookupFields.length > 0) {
            $scope.showLookupFields = true;
            $scope.showCustomerDetailFields = false;
        } else {
            $scope.showCustomerDetailFields = true;
        }

    }

    $scope.setLookupSummary = function (customerDetails) {
        $scope.customerDetails = customerDetails;
        $scope.showLookupSummary = true;
        $scope.showCustomerDetailFields = false;

        angular.forEach($scope.paymentitem.paymentProductFields, function (field) {
            if (field.id !== "installmentId" && field.id !== "termsAndConditions" && field.dataRestrictions.isRequired && !$scope.lookupModel[field.id]) {
                if (!$scope.customerDetails[field.id]) {
                    $scope.showLookupSummary = false;
                    $scope.showCustomerDetailFields = true;
                    $scope.doValidateLookupResult = true;
                }
            }
        });
    }

    $scope.editCustomerDetails = function () {
        $scope.showLookupSummary = false;
        $scope.showCustomerDetailFields = true;
        $scope.showLookupFields = true;
    }

    $scope.searchAgain = function () {
        $scope.showLookupSummary = false;
        $scope.showCustomerDetailFields = false;
        $scope.showLookupFields = true;
    }

    $scope.setLookupPopoverContent = function () {
        $scope.popoverContent = $scope.afterpayLookupPopoverContent;
    }

    $scope.setBirthYearList = function () {
        var startYear = 1900;
        var endYear = 2018;

        $scope.yearRange = [];

        for (var year = startYear; year < endYear; year++) {
            $scope.yearRange.push(year);
        }
    }

    $scope.doSelectPlan = function (selectedPlanId) {
        angular.forEach($scope.installmentOptions.displayHints.formElement.valueMapping, function (plan) {
            if (plan.value == selectedPlanId) {
                $scope.planDetails = plan.json.displayElements;
            }
        });
    }

    $scope.doShowCustomerDetails = function () {
        $scope.showCustomerDetailFields = true;
    }

    $scope.lookupModel = {};

    $scope.searchCustomerDetails = function (isRedirect) {

        $scope.doValidateLookup = true;
        $scope.errorCustomerSearch = false;

        $rootScope.loading = true;

        var isEmptyLookupInput = false;

        var searchParameters = {
            "countryCode": $scope.connect.paymentDetails.countryCode,
            "values": []
        };

        if (Object.keys($scope.lookupModel).length == $scope.lookupFields.length) {

            angular.forEach($scope.lookupModel, function (value, key) {
                if (value) {
                    searchParameters.values.push({
                        "key": key,
                        "value": value
                    });
                    $scope.isCustomerDetailsSearched = true;
                } else {
                    isEmptyLookupInput = true;
                    return false;
                }
            });

            if (!isEmptyLookupInput) {
                $scope.connect.session.getCustomerDetails($scope.paymentitem.id, searchParameters).then(function (paymentProductCustomerDetails) {
                    $scope.$apply(function () {
                        $rootScope.loading = false;
                        $scope.item = Object.assign($scope.item, paymentProductCustomerDetails);
                        if (isRedirect == "redirectToPayment") {
                            $scope.isLookupSearchDone = true;
                            $scope.doPayment();
                        }
                        $scope.setLookupSummary(paymentProductCustomerDetails);
                    });
                }, function () {
                    $scope.$apply(function () {
                        $rootScope.loading = false;
                        $scope.errorCustomerSearch = true;
                        $scope.isCustomerDetailsSearched = false;
                        $log.error('error while getting customer details');
                    });
                });
            } else {
                $rootScope.loading = false;
                return;
            }

        } else {
            $rootScope.loading = false;
            return;
        }

    }

    $scope.combineFields = function () {
        if ($scope.lookupModel) {
            angular.forEach($scope.lookupModel, function (value, key) {
                $scope.item[key] = value;
            });
        }
    };
}]);