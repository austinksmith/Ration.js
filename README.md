# Ration.js

**Author**: Austin K. Smith

**Website**: [Github](https://github.com/austinksmith/ration.js)

**Description**: 100% Vanilla Javascript Rate Limiting / DDOS Protection Library

**License**: Artistic License 2.0

# About

Ration.js is 100% Vanilla Javascript Rate Limiting / DDOS Protection Library for use with Node.js / Express, inspired by [Network Tarpits](https://en.wikipedia.org/wiki/Tarpit_(networking)) it works the same way to intentionally slow down requests from users who are making too many requests within a limited timeframe.

# Install

  * Add Ration.js to your project using the instructions below

  ## Node

  * Use npm install to add the project to your dependencies `npm install --save ration.js`
  * Require the npm module in your app.js file

  ```js
 	  const ration = require('ration.js');
  ```

  ## Then make sure your app is set to use ration with the following

  ```js
  // Declare Application
  let app = express();

  /* Set Ration.js Options */
  const rations = {
    maxRequestsPerTimeFrame: 600,
    timeFrameInSeconds: 30,
    removeRecordsAfter: (1000 * 60 * 5)
  };

  /* Initialize Ration.js */
  rationjs.setRations(rations);

  /* Use Ration.js */
  app.use(rationjs.startRations);
  ``` 

 # Ration.js Options

  * maxRequestsPerTimeFrame - This is the maximum number of requests you want to allow an application user to use within the set timeframe. Value should be an Integer - Defaults to 600.
  * timeFrameInSeconds - This is the time frame you want to limit the number of requests within eg. Use 1 to limit requests by individual seconds - Defaults to 30 
  * removeRecordsAfter - This is the amount of time since the requestors last request that the requestors records are kept in memory - milliseconds - Defaults to 30000 (ie. 5 minutes).

 # How it works

  * The library acts as a middleware layer for incoming requests to your Node.js/Express application
  * WIth each unique visitor a request record is created and saved internally to keep track of time interval between each new request and the previous request
  * If the number of requests exceeds the set limit of requests within the set time threadshold, requests by the offending users are then delayed using a delayMultiplier
  * The delay multiplier is doubled for each request exceeding the number of requests allowed within the set time 
  * If the time difference between the last request and the current request exceeds the time , the request count for the user is reset to 1
  * If there are no new requests from a unique visitor within 5 minutes, their request records are removed automatically to prevent the visits log from growing too large