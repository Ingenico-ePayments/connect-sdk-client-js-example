var $ = require('jQuery');
var jqueryValidate = require('jquery-validation');
var validateDefaults = require('./validate-defaults');

$(function () {
    // set the current values in the currentcontext or use some smart defaults
    function _setcurrentValues() {
        if (sessionStorage.getItem('context')) {
            var currentContext = JSON.parse(sessionStorage.getItem('context'));
            $("#clientSessionId").val(currentContext.clientSessionId);
            $("#customerId").val(currentContext.customerId);
            $("#region").val(currentContext.region);
            $("#environment").val(currentContext.environment);
            $("#totalAmount").val(currentContext.totalAmount);
            $("#countryCode").val(currentContext.countryCode);
            $("#currency").val(currentContext.currency);
            $("#locale").val(currentContext.locale);
            $("#isRecurring").val(currentContext.isRecurring);
            $("#grouping").prop('checked', currentContext.grouping);
        } else {
            $("#totalAmount").val('16195');
            $("#grouping").prop('checked', true);
        }
    };

    _setcurrentValues();

    $("form[name='session-details-form']").validate({
        submitHandler: function () {
            var context = {
                clientSessionId: $("#clientSessionId").val(),
                customerId: $("#customerId").val(),
                region: $("#region").val(),
                environment: $("#environment").val(),
                totalAmount: $("#totalAmount").val(),
                countryCode: $("#countryCode").val(),
                currency: $("#currency").val(),
                locale: $("#locale").val(),
                isRecurring: $("#isRecurring").is(":checked"),
                grouping: $("#grouping").is(":checked")
            }
            sessionStorage.setItem('context', JSON.stringify(context));
            document.location.href = 'paymentitem-selection.html';
        }
    });
});