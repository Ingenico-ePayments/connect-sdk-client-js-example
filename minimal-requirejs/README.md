# requirejs Connect Client SDK Example

## What is it?

This example shows you how to load the [Ingenico Connect JavaScript Client SDK](https://github.com/Ingenico-ePayments/connect-sdk-client-js) with the requirejs module loader.

The Connect SDK is used for all communication to the Connect API and crypto. See the [Ingenico ePayments Developer Hub](https://epayments.developer-ingenico.com/documentation/sdk/mobile/javascript/) for more information on how to use the Ingenico Connect API.

## How to install

Make sure you have installed [Node.js](https://nodejs.org/en/); the LTS version is recommended. Run

    npm install

The Connect SDK requires [forge](https://github.com/digitalbazaar/forge/) to do the actual crypto. It is incompatible with module loaders at the moment. This example loads it first, which causes forge to provide a global `forge` object. A bridge is included in file in file `js/forge-module.js` that provides requirejs module `node-forge` that exposes this global `forge` object.

An alternative is to get a copy of forge and build it following the guide on GitHub. Place the minified version in `dist/js` and use it as the source of the first script tag.

## How to start the payment process

Create a client session identifier and a customer identifier, which the Client API needs for authentication purposes.  
These can be obtained by your e-commerce server using the [Server SDKs](https://epayments.developer-ingenico.com/documentation/sdk/server/) or directly using the [Server API](https://epayments-api.developer-ingenico.com/s2sapi/v1/). Use this information along with the geographical region of the Client API you want to connect to and the payment details to start the process.  
If you incorporate this into your production process all this information should be used to initialize the payment process.

In `app.js` you include the sessiondetails, this is the only file that is requirejs specific. See `create-payload.js` on how to set-up the actual payment request which is the same for all module loaders.

### Folder structure

```
+-- src
|   +-- js
|       -- forge-module.js - bridge that defines the node-forge module and exposes the global forge object
|       -- config.js - file containing the session config variables; you need to update these settings first
|       -- create-payload.js - generic code which provides an example on how the SDK works, this is common for all minimal examples.
|       -- app.js - the example app itself
+-- node_modules
|   ... folder containing all node dependencies; run npm install to get the dependencies
|-- index.html - html page as start page
```
