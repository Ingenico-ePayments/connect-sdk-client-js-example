# Angularjs (1.x) Connect Client SDK Example

## What is it?

This application is an angularjs implementation of an Ingenico Connect checkout process. You can use this application as a base for your own angularjs intergrated Ingenico Connect powered payment solution.
It offers all features of the [Ingenico Connect Responsive Payment Pages (RPP)](https://epayments.developer-ingenico.com/documentation/hosted-payment-pages/), including
* payment product selection
* payment product detail pages
* co-branded cards support
* payment product grouping
* payment product switching based on IIN Lookup

and more.
The [Ingenico Connect JavaScript Client SDK](https://github.com/Ingenico-ePayments/connect-sdk-client-js) is used for all communication to the Connect API and crypto. A simple webserver is included to make this application easy to install and run in development environments. See the [Ingenico ePayments Developer Hub](https://epayments.developer-ingenico.com/documentation/sdk/mobile/javascript/) for more information on how to use the Ingenico Connect API.

## How to install

Make sure you have installed [Node.js](https://nodejs.org/en/); the LTS version is recommended. Run

    npm install

## How to start the application

Run the following command to start a webserver on `localhost` at port `3000` with [browsersync](https://www.browsersync.io/).
This will also start a watcher for the [sass](http://sass-lang.com/) files that auto compile to CSS; after each change the page is automaticly reloaded for you on all connected devices.

    npm run start

When the webserver has started it will automaticly load a page in which you have to provide details about the Ingenico Connect client session and the payment details. This page is for example and development purposes only. Notice that the URL contains the `dev-` prefix indicating is a development page. In your production application this information is used to initialize the application.
The final page of the payment journey has a `dev-` prefix as well and contains the encrypted string containing all information that you need to send to Ingenico to forfill the payment.

## How to start the payment process

Create a client session identifier and a customer identifier, which the Client API needs for authentication purposes.
These can be obtained by your e-commerce server using the [Server SDKs](https://epayments.developer-ingenico.com/documentation/sdk/server/) or directly using the [Server API](https://epayments-api.developer-ingenico.com/s2sapi/v1/). Use this information along with the geographical region of the Client API you want to connect to and the payment details to start the process.
If you incorporate this into your production process all this information should be used to initialize the payment process.

## In depth

This application uses the following key frameworks and libraries which are managed by npm:
* Angularjs
* Twitter Bootstrap
* DigitalBazaar Forge
* Ingenico Connect Client SDK

### Other npm commands

* npm run build:sass - builds all css files; once
* npm run browsersync - starts the webserver with browser-sync
* npm run postinstall - automaticly run after install (clean&build:sass)
* npm run watch:sass - watch sass changes

### Folder structure

```
+-- app
|   +-- js
|       -- app.js - main controller with routing
|   +-- payment-detail
|       +-- directives
|           +-- connect
|                -- cardnumber.directive.js - directive which has all logic for cardnumber switchinh
|                -- validation.directive.js - directive that binds Connect-sdk validation methods to angular.js
|       +-- templates
|           -- cards.html - specific template for card payments; since card payments have a lot of extra features compared to the other paymentmethods.
|           -- input-currency.html - template for currency based input fields
|           -- input-default.html - template for input based fields
|           -- input-select.html - template for dropdown based fields
|           -- remember-me.html - template holding the account on file checkbox
|           -- tooltip.html - template with the specific tooltip for a field (if present)
|       -- paymentitem-detail.html - template for the payment form; this will load subtemplates on demand from the templates folder
|       -- paymentitem-detail.controller.js - control logic for the payment form.
|   +-- payment-selection
|       -- payment-selection.html - template for the payment selection form
|       -- payment-selection.controller.js - control logic for the payment selection form
|   +-- results
|       -- failure.html - result page; failure
|       -- success.html - result page; success; this page prints the encrypted blob you can send to ingenico ePayments.
|   +-- sessiondetails
|       -- sessiondetails.html - this page provides the payment- and sessiondetails.
|       -- sessiondetails.controller.js - control logic for the sessiondetails page.
|   +-- styles
|       -- contains all sass files needed to compile the css file used with this demo
+-- fonts
|    +-- icons
|        -- icons.eot/icons.svg/icons.ttf/icons.woff - icons that are used in the cards form
+-- global
|   +-- images
|       -- loader.png - loading spinner
|       -- logo.png - example logo
+-- node_modules
|   ... folder containing all node dependencies; run npm install to get the dependencies
+-- styles
|   +-- img
|       ... folder containing all images used by the CSS
|   -- base.css - the compiled css file; use npm run build:sass to compile this file
|   -- forms.css - overrides for forms; this is purely used in this example; production code should use a better method to handle the displaying of validation errors.
```

### Module loading

This example focusses on displaying how to intergrate the Ingenico Connect JavaScript Client SDK with angularjs. Module loading is out of scope of this example.
Refer to the various minimal examples on how to use module loading.
