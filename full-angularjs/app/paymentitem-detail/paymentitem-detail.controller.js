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

                    $scope.connect.paymentRequest.setPaymentProduct(paymentProduct);
                    $scope.encryptIfNofields();

                    if ($scope.aofId) {
                        $scope.handleAccountOnFile();
                    }

                    if (id === '1503') {
                        $scope.boletoHelper(paymentProduct);
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

    $scope.aofField = function (field) {
        var accountOnFile = isNaN(Number($scope.aofId)) ? undefined : $scope.paymentitem.accountOnFileById[Number($scope.aofId)];
        if (accountOnFile) {
            var attribute = accountOnFile.attributeByKey[field.id];
            return attribute && attribute.status !== "MUST_WRITE" && attribute.status !== "CAN_WRITE";
        }
        return false;
    };

    $scope.handleAccountOnFile = function () {
        // store account on file in request
        var accountOnFile = isNaN($scope.aofId) ? null : $scope.paymentitem.accountOnFileById[$scope.aofId];
        $scope.connect.paymentRequest.setAccountOnFile(accountOnFile);
        // prefill data
        angular.forEach(accountOnFile.attributes, function (attribute) {
            if ($scope.paymentitem.paymentProductFieldById[attribute.key]) {
                if (attribute.status === "MUST_WRITE" || attribute.status === "CAN_WRITE") {
                    $scope.item[attribute.key] = attribute.value;
                } else {
                    var masked = $scope.paymentitem.paymentProductFieldById[attribute.key].applyWildcardMask(attribute.value).formattedValue;
                    $scope.item[attribute.key] = masked;
                }
            }
        });
    };

    $scope.uimask = function (field) {
        // we fix the mask for use with angular.ui.mask; if you use some other masking util refer to the docs of the directive.
        if (field.displayHints.mask) {
            return field.displayHints.mask.replace(/{{/g, '').replace(/}}/g, '').replace(/9/g, '?9');
        }
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

    // Cache results of $sce.trustAsHtml to prevent infinite $digest loops
    var trustedContent = {};
    $scope.htmltooltip = function (field) {
        if (field.displayHints.tooltip) {
            var tooltip = field.displayHints.tooltip;
            var key = tooltip.label + "_" + tooltip.image;
            if (!trustedContent[key]) {
                trustedContent[key] = $sce.trustAsHtml(tooltip.label + " <br /><img src='" + tooltip.image + "?size=240x160' width='240' height='160'>");
            }
            return trustedContent[key];
        }
    }

    $scope.startApplePay = function () {
        var networks = $scope.paymentitem.paymentProduct302SpecificData.networks;

        if ($scope.paymentitem.acquirerCountry) {
            $scope.connect.paymentProductSpecificInputs.applePay.acquirerCountry = $scope.paymentitem.acquirerCountry;
        }
        $scope.connect.session.createApplePayPayment($scope.connect.paymentDetails, $scope.connect.paymentProductSpecificInputs.applePay, networks).then(function (res) {
            var request = $scope.connect.session.getPaymentRequest();
            request.setValue('encryptedPaymentData', JSON.stringify(res.data.paymentData));
            encrypt();
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

        $scope.errorCustomerSearch = false;

        for (var key in $scope.item) {
            // we need to supply masked values; so let's mask them here
            var field = $scope.paymentitem.paymentProductFieldById[key];
            if (field) {
                if (field.displayHints.formElement.type != 'boolean') {
                    var masked = field.applyMask($scope.item[key]).formattedValue;
                } else {
                    var masked = $scope.item[key] + '';
                }

                if (!$scope.aofField(field)) {
                    request.setValue(key, masked);
                }
            } else {
                if (key === 'rememberme') {
                    request.setTokenize($scope.item[key]);
                }
            }
        }
        if (request.getPaymentProduct()) {
            var errors = request.validate();
            if (errors.length === 0) {
                encrypt();
            } else {
                console.log(errors);
            }
        } else {
            console.log("no paymentProduct set");
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
        if (paymentRequest.getPaymentProduct()) {
            var errors = paymentRequest.validate();
            if (errors.length === 0) {
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
                        $location.path('/dev-failure');
                    });
                });
            } else {
                // something is wrong according to the paymentRequest;
                console.error(errors, paymentRequest.getValues(), paymentRequest.getPaymentProduct());
                $scope.$apply(function () {
                    $location.path('/dev-failure');
                });
            }
        } else {
            // the paymentRequest does not have a paymentProduct;
            console.error("no paymentProduct set", paymentRequest.getValues());
            $scope.$apply(function () {
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
}]);