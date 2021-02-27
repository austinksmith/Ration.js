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
    this.setRations = this.init;
    this.startRations = this.enforceRations.bind(this);
    this.checkRations = this.compareVisits
    this.saveUsersRations = this.saveRequest;
  }


  init(options) {
    this.removeRecordsAfter = (1000 * 60 * 5);
    for(var key in options) {
      this[key] = options[key];
    }
    this.timeFrameInMS = (this.timeFrameInSeconds * 1000);
    this.maxRequestsWithinTimeFrame = (this.maxRequestsPerTimeFrame * this.timeFrameInSeconds);
    this.delayInMS = (1000 / this.maxRequestsPerTimeFrame);
    this.visits = [];
    setInterval(() => {
      this.restoreRations();
    }, this.removeRecordsAfter);
  }


  restoreRations() {
    for (var i = this.visits.length - 1; i >= 0; i--) {
      let timeSinceLastVisit = (Date.now() - this.visits[i].lastRequestAt);
      if(timeSinceLastVisit >= this.removeRecordsAfter) {
        this.visits.splice(i, 1);
      }
    }
  }

  compareVisits(requestRecord, next) {
    let sameRequestor;
    let timeSinceLastVisit;
    let delayMultiplier;
    for (var i = this.visits.length - 1; i >= 0; i--) {
      sameRequestor = (this.visits[i].requestBy === requestRecord.requestBy);
      if(sameRequestor && (timeSinceLastVisit < this.removeRecordsAfter)) {
        this.visits[i].requestCount += 1;
        delayMultiplier = this.visits[i].delayMultiplier;
        if(this.visits[i].requestCount >= maxRequestsWithinTimeFrame) {
          delayMultiplier += 1;
        }
        this.visits[i].lastRequestAt = requestRecord.newRequestAt;
        this.visits[i].delayMultiplier = delayMultiplier;
      } else if(timeSinceLastVisit > this.timeFrameInMS) {
        this.visits[i].requestCount = 1;
        this.visits[i].delayMultiplier = 1;
      }
    }
    //Delay processing request
    setTimeout(() => {
      next();
    }, (this.delayInMS * delayMultiplier));
  }

  enforceRations(req, res, next) {
    let requestRecord = {
      requestBy: (req.header('x-forwarded-for') || req.connection.remoteAddress),
      newRequestAt: Date.now(),
      lastRequestAt: Date.now(),
      delayMultiplier: 1,
      requestCount: 1
    };
    // Compare existing request records
    if(this.visits.length === 0) {
      this.visits.push(requestRecord);
      next();
    } else {
      this.compareVisits(requestRecord, next);
    }
  }

}

const rationjs = new ration();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = rationjs;
}