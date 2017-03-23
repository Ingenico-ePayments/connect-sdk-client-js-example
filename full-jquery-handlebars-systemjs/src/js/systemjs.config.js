/**
 * System configuration
 * Adjust as necessary for your application needs.
 */
(function (global) {
    // map tells the System loader where to look for things
    var map = {
        'app': '/src/js/app',
        'connect-sdk-client-js': '/node_modules/connect-sdk-client-js',
        'jQuery': '/node_modules/jquery',
        'jquery': '/node_modules/jquery',
        'jquery-validation': '/node_modules/jquery-validation',
        'handlebars': '/node_modules/handlebars',
        'bootstrap': '/node_modules/bootstrap-sass',
        'node-forge': '/node_modules/node-forge'
    };
    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'app': { main: 'dev-start.js', defaultExtension: 'js' },
        'connect-sdk-client-js': { main: 'dist/connectsdk.node.js', defaultExtension: 'js' },
        'jQuery': { main: 'dist/jquery.js', defaultExtension: 'js' },
        'jquery': { main: 'dist/jquery.js', defaultExtension: 'js' },
        'jquery-validation': { main: 'dist/jquery.validate.js', defaultExtension: 'js' },
        'handlebars': { main: 'dist/handlebars.js', defaultExtension: 'js' },
        'bootstrap': { main: 'assets/javascripts/bootstrap.js', defaultExtension: 'js' },
        'node-forge': { main: 'js/forge.js', defaultExtension: 'js' }
    };

    // map connect-sdk for usage with systemjs   
    packages['connectsdk.session'] = { main: '../../../node_modules/connect-sdk-client-js/src/session.js', defaultExtension: 'js' };
    packages['connectsdk.core'] = { main: '../../../node_modules/connect-sdk-client-js/src/core.js', defaultExtension: 'js' };
    packages['connectsdk.C2SCommunicator'] = { main: '../../../node_modules/connect-sdk-client-js/src/C2SCommunicator.js', defaultExtension: 'js' };
    packages['connectsdk.C2SCommunicatorConfiguration'] = { main: '../../../node_modules/connect-sdk-client-js/src/C2SCommunicatorConfiguration.js', defaultExtension: 'js' };
    packages['connectsdk.IinDetailsResponse'] = { main: '../../../node_modules/connect-sdk-client-js/src/IinDetailsResponse.js', defaultExtension: 'js' };
    packages['connectsdk.promise'] = { main: '../../../node_modules/connect-sdk-client-js/src/promise.js', defaultExtension: 'js' };
    packages['connectsdk.C2SPaymentProductContext'] = { main: '../../../node_modules/connect-sdk-client-js/src/C2SPaymentProductContext.js', defaultExtension: 'js' };
    packages['connectsdk.BasicPaymentProduct'] = { main: '../../../node_modules/connect-sdk-client-js/src/BasicPaymentProduct.js', defaultExtension: 'js' };
    packages['connectsdk.BasicPaymentProducts'] = { main: '../../../node_modules/connect-sdk-client-js/src/BasicPaymentProducts.js', defaultExtension: 'js' };
    packages['connectsdk.BasicPaymentProductGroups'] = { main: '../../../node_modules/connect-sdk-client-js/src/BasicPaymentProductGroups.js', defaultExtension: 'js' };
    packages['connectsdk.PaymentProduct'] = { main: '../../../node_modules/connect-sdk-client-js/src/PaymentProduct.js', defaultExtension: 'js' };
    packages['connectsdk.PaymentProductGroup'] = { main: '../../../node_modules/connect-sdk-client-js/src/PaymentProductGroup.js', defaultExtension: 'js' };
    packages['connectsdk.BasicPaymentItems'] = { main: '../../../node_modules/connect-sdk-client-js/src/BasicPaymentItems.js', defaultExtension: 'js' };
    packages['connectsdk.PaymentRequest'] = { main: '../../../node_modules/connect-sdk-client-js/src/PaymentRequest.js', defaultExtension: 'js' };
    packages['connectsdk.Encryptor'] = { main: '../../../node_modules/connect-sdk-client-js/src/Encryptor.js', defaultExtension: 'js' };
    packages['connectsdk.JOSEEncryptor'] = { main: '../../../node_modules/connect-sdk-client-js/src/JOSEEncryptor.js', defaultExtension: 'js' };
    packages['connectsdk.net'] = { main: '../../../node_modules/connect-sdk-client-js/src/net.js', defaultExtension: 'js' };
    packages['connectsdk.Util'] = { main: '../../../node_modules/connect-sdk-client-js/src/Util.js', defaultExtension: 'js' };
    packages['connectsdk.PublicKeyResponse'] = { main: '../../../node_modules/connect-sdk-client-js/src/PublicKeyResponse.js', defaultExtension: 'js' };
    packages['connectsdk.BasicPaymentProductGroup'] = { main: '../../../node_modules/connect-sdk-client-js/src/BasicPaymentProductGroup.js', defaultExtension: 'js' };
    packages['connectsdk.PaymentProductField'] = { main: '../../../node_modules/connect-sdk-client-js/src/PaymentProductField.js', defaultExtension: 'js' };
    packages['connectsdk.AccountOnFile'] = { main: '../../../node_modules/connect-sdk-client-js/src/AccountOnFile.js', defaultExtension: 'js' };
    packages['connectsdk.PaymentProductDisplayHints'] = { main: '../../../node_modules/connect-sdk-client-js/src/PaymentProductDisplayHints.js', defaultExtension: 'js' };
    packages['connectsdk.PaymentProductFieldDisplayHints'] = { main: '../../../node_modules/connect-sdk-client-js/src/PaymentProductFieldDisplayHints.js', defaultExtension: 'js' };
    packages['connectsdk.DataRestrictions'] = { main: '../../../node_modules/connect-sdk-client-js/src/DataRestrictions.js', defaultExtension: 'js' };
    packages['connectsdk.MaskingUtil'] = { main: '../../../node_modules/connect-sdk-client-js/src/MaskingUtil.js', defaultExtension: 'js' };
    packages['connectsdk.MaskedString'] = { main: '../../../node_modules/connect-sdk-client-js/src/MaskedString.js', defaultExtension: 'js' };
    packages['connectsdk.AccountOnFileDisplayHints'] = { main: '../../../node_modules/connect-sdk-client-js/src/AccountOnFileDisplayHints.js', defaultExtension: 'js' };
    packages['connectsdk.Attribute'] = { main: '../../../node_modules/connect-sdk-client-js/src/Attribute.js', defaultExtension: 'js' };
    packages['connectsdk.Tooltip'] = { main: '../../../node_modules/connect-sdk-client-js/src/Tooltip.js', defaultExtension: 'js' };
    packages['connectsdk.FormElement'] = { main: '../../../node_modules/connect-sdk-client-js/src/FormElement.js', defaultExtension: 'js' };
    packages['connectsdk.ValidationRuleExpirationDate'] = { main: '../../../node_modules/connect-sdk-client-js/src/ValidationRuleExpirationDate.js', defaultExtension: 'js' };
    packages['connectsdk.ValidationRuleFixedList'] = { main: '../../../node_modules/connect-sdk-client-js/src/ValidationRuleFixedList.js', defaultExtension: 'js' };
    packages['connectsdk.ValidationRuleLength'] = { main: '../../../node_modules/connect-sdk-client-js/src/ValidationRuleLength.js', defaultExtension: 'js' };
    packages['connectsdk.ValidationRuleLuhn'] = { main: '../../../node_modules/connect-sdk-client-js/src/ValidationRuleLuhn.js', defaultExtension: 'js' };
    packages['connectsdk.ValidationRuleRange'] = { main: '../../../node_modules/connect-sdk-client-js/src/ValidationRuleRange.js', defaultExtension: 'js' };
    packages['connectsdk.ValidationRuleRegularExpression'] = { main: '../../../node_modules/connect-sdk-client-js/src/ValidationRuleRegularExpression.js', defaultExtension: 'js' };
    packages['connectsdk.ValidationRuleEmailAddress'] = { main: '../../../node_modules/connect-sdk-client-js/src/ValidationRuleEmailAddress.js', defaultExtension: 'js' };
    packages['connectsdk.ValidationRuleBoletoBancarioRequiredness'] = { main: '../../../node_modules/connect-sdk-client-js/src/ValidationRuleBoletoBancarioRequiredness.js', defaultExtension: 'js' };
    packages['connectsdk.ValidationRuleFactory'] = { main: '../../../node_modules/connect-sdk-client-js/src/ValidationRuleFactory.js', defaultExtension: 'js' };
    packages['connectsdk.LabelTemplateElement'] = { main: '../../../node_modules/connect-sdk-client-js/src/LabelTemplateElement.js', defaultExtension: 'js' };
    packages['connectsdk.ValueMappingElement'] = { main: '../../../node_modules/connect-sdk-client-js/src/ValueMappingElement.js', defaultExtension: 'js' };
    

    var meta = {
        'node-forge': { format: 'commonjs' }
    };

    var config = {
        map: map,
        packages: packages,
        meta: meta
    }
    System.config(config);
})(this);
