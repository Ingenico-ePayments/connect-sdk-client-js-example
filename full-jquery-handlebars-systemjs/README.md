# jQuery / Handlebars Connect Client SDK Example

## What is it?

This application is a jQuery / Handlebars implementation of an Ingenico Connect checkout process. You can use this application as a base for your own jQuery intergrated Ingenico Connect powered payment solution.
It offers all features of the [Ingenico Connect Responsives Payment Pages (RPP)](https://developer.globalcollect.com/documentation/hosted-payment-pages/), including
* payment product selection
* payment product detail pages
* co-branded cards support
* payment product grouping
* payment product switching based on IIN Lookup

and more.  
The [Ingenico Connect JavaScript Client SDK](https://github.com/Ingenico-ePayments/connect-sdk-client-js) is used for all communication to the Connect API and crypto. A simple webserver is included to make this application easy to install and run in development environments.See the [Ingenico ePayments Developer Hub](https://developer.globalcollect.com/documentation/sdk/mobile/javascript/) for more information on how to use the Ingenico Connect API.

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
These can be obtained by your e-commerce server using the [Server SDKs](https://developer.globalcollect.com/documentation/sdk/server/) or directly using the [Server API](https://developer.globalcollect.com/documentation/api/server/). Use this information along with the geographical region of the Client API you want to connect to and the payment details to start the process.  
If you incorporate this into your production process all this information should be used to initialize the payment process.

## In depth

This application uses the following key frameworks and libraries which are managed by npm:
* jQuery
* Handlebars
* Systemjs
* Twitter Bootstrap
* DigitalBazaar Forge
* Ingenico Connect Client SDK 

### Other npm commands

* npm run build:sass - builds all css files; once
* npm run lite - starts the webserver with browser-sync
* npm run postinstall - automaticly run after install (clean&build:sass)
* npm run watch:sass - watch sass changes

### Folder structure

```
+-- src
|   +-- js
|       -- systemjs.config.js - config file for the systemjs module loader
|       +-- app
|           -- cards.js - (credit) card specific payment page with all enrichements used for card payments
|           -- dev-start.js - logic for holding demo session credentials
|           -- dev-success.js - logic for printing the encrypted payment blob on screen
|           -- formatter.js - jQuery plugin to format / mask input files
|           -- helpers.js - collection of helper functions
|           -- paymentitem-detail.js - logic for the paymentitem detail page
|           -- paymentitem-selection.js - logic for the paymentitem selection page
|           -- validate-defaults.js - defaults for the jQuery validator
|   +-- html
|       -- cards.html - html page with handlebars templates specific for the (credit) card paymentproducts
|       -- dev-start.html - html page for setting up the demo session credentials
|       -- dev-success.html - html page for showing the encrypted payment blob
|       -- dev-template.html - base html page (used to create other pages)
|       -- paymentitem-detail - html page with handlebars templates for the paymentitem details
|       -- paymentitem-selection - html page with handlebars templates for the paymentitem selection
|   +-- styles
|       -- sass files for creating the stylesheet
+-- global
|   +-- images
|       -- loader.png - loading spinner
|       -- logo.png - example logo 
+-- node_modules
|   ... folder containing all node dependencies; run npm install to get the dependencies
+-- dist
|   +-- fonts
|       -- icons
|       ... folder containing the icon fonts used by the app
|   +-- styles
|       -- base.css - the compiled css file; use npm run build:sass to compile this file 
```

### Dev-

Files prefixed with `dev-` are only used for demo purposes; they include an interface to enter the sessionDetails and pages to display the encrypted blob.
Full implementations hve the S2S SDK provide the sessionDetails and use the S2S SDK to send the encrypted blob to the Ingenico servers.
