angular.module('connect.validation', []).directive('connectValidation', function () {
    return {
        priority: 100,
        require: 'ngModel',
        restrict: 'A',
        compile: function connectValidationCompilingFunction() {

            return function connectValidationLinkingFunction(scope, iElement, iAttrs, controller) {
                var addValidations = function (field) {
                    /* Add validators based on the dataRestrictions */
                    angular.forEach(field.dataRestrictions.validationRules, function (validationRule) {
                        controller.$validators[validationRule.type] = function (modelValue, viewValue) {
                            if (modelValue) {
                                return validationRule.validate(modelValue);
                            } else {
                                return true;
                            }
                        };
                    });
                }
                var field = scope.paymentitem.paymentProductFieldById[scope.paymentItemFieldId || scope.paymentItemfield.id]

                scope.$watch(iAttrs.connectValidation, function (n, o) {
                    if (n !== o) {
                        field = scope.paymentitem.paymentProductFieldById[scope.paymentItemFieldId || scope.paymentItemfield.id];
                        addValidations(field);
                    }
                });
                addValidations(field);
            }
        }
    }
});