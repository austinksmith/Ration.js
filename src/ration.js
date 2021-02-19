/* jshint esversion: 6, curly: true, eqeqeq: true, forin: true */

/***********************************************************************************
* Title: Ration.js                                                                 *
* Description: 100% Vanilla Javascript Rate Limiting / DDOS Protection Library     *
* Author: Austin K. Smith                                                          *
* Contact: austin@asmithdev.com                                                    *  
* Copyright: 2021 Austin K. Smith - austin@asmithdev.com                           * 
* License: Artistic License 2.0                                                    *
***********************************************************************************/

'use strict';

class ration {

  /**
  * @constructor
  * @function constructor - Sets properties for this class
  */
  constructor() {
    this.init = this.setRations;
    this.checkRations = this.compareVisits
    this.saveUsersRations = this.saveRequest;
    this.visits = [];
    this.maxRequestsPerTimeFrame = 600;
    this.timeFrameThresholdInSeconds = 30;
    this.timeFrameThresholdInMS = (this.timeFrameThresholdInSeconds * 1000);
    this.maxRequestsWithinTimeFrameThreshold = (this.maxRequestsPerTimeFrame * this.timeFrameThresholdInSeconds);
    this.delayInMS = (1000 / this.maxRequestsPerTimeFrame);
    this.removeRecordAfter = (1000 * 60 * 5);
    this.delayMultiplier = 1;
  }


  setRations(options) {

  }

  compareVisits(requestRecord, visits) {
    let i = (visits.length - 1);
    for (i; i >= 0; i--) {
      if(visits[i].requestBy === requestRecord.requestBy) {
        let timeSinceLastVisit = (requestRecord.newRequestAt - visits[i].lastRequestAt);
        if(timeSinceLastVisit >= removeRecordAfter) {
          visits.splice(i, 1);
        } else {
          visits[i].requestCount += 1;
          delayMultiplier = visits[i].delayMultiplier;
          if(timeSinceLastVisit > timeFrameThresholdInMS) {
            visits[i].requestCount = 1;
          } else if(visits[i].requestCount >= maxRequestsWithinTimeFrameThreshold) {
            delayMultiplier += 1;
          }
          visits[i].lastRequestAt = requestRecord.newRequestAt;
          visits[i].delayMultiplier = delayMultiplier;
        }
      } else if(i === 0) {
        visits.push(requestRecord);
      }
    }
  };

  rationjs(req, res, next) {
    let requestRecord = {
      requestBy: (req.header('x-forwarded-for') || req.connection.remoteAddress),
      newRequestAt: Date.now(),
      lastRequestAt: Date.now(),
      delayMultiplier: this.delayMultiplier,
      requestCount: 1
    };

    if(visits.length === 0) {
      visits.push(requestRecord);
    } else {
      compareVisits(requestRecord, visits);
    }
    //Delay processing request
    setTimeout(() => {
      next();
    }, (delayInMS * delayMultiplier));
  };

}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = rationjs;
}