/* jshint esversion: 6, curly: true, eqeqeq: true, forin: true */

/***********************************************************************************
* Title: Ration.js                                                                 *
* Description: 100% Vanilla Javascript Rate Limiting / DDOS Protection Library     *
* Author: Austin K. Smith                                                          *
* Contact: austin@asmithdev.com                                                    *  
* Copyright: 2021 Austin K. Smith - austin@asmithdev.com                           * 
* License: Artistic License 2.0                                                    *
***********************************************************************************/


let visits = [];
let maxPerSecond = 20;
let delayInMS = (1000 / maxPerSecond);
let removeRecordAfter = (1000 * 60 * 5); //If no visits after 5 minutes, remove the record

const rationjs = (req, res, next) => {
	'use strict';

	let requestRecordFound = false;
 	let requestRecord = {
 		requestBy: (req.header('x-forwarded-for') || req.connection.remoteAddress),
 		newRequestAt: Date.now(),
 		lastRequestAt: Date.now(),
 		delayMultiplier: 1,
 		requestCount: 1
 	};

 	if(visits.length === 0) {
 		visits.push(requestRecord);
 	} else {
 		for (var i = visits.length - 1; i >= 0; i--) {
	 		/* Check for existing request record, compare time interval between requests */
	 		if(visits[i].requestBy === requestRecord.requestBy) {
	 			requestRecordFound = true;
	 			/* Increment visit count for this visitor */
 				visits[i].requestCount += 1;
 				/* Compare time frame between visits */
	 			let requestInterval = (requestRecord.newRequestAt - visits[i].lastRequestAt);
	 			/* Compare time frame between visits */
	 			console.log(requestInterval, visits[i].lastRequestAt);
	 			if(requestInterval <= 1000) {
	 				/* This visitor is exceeding the maximum visits per second, increase delay between requests */
	 				if(visits[i].requestCount >= maxPerSecond) {
	 					visits[i].delayMultiplier += 1;
	 					requestRecord.delayMultiplier = visits[i].delayMultiplier;
	 				}
	 			} else {
	 				/* This visitor is not exceeding the maximum visits per second, reset delays and request count */
	 				visits[i].delayMultiplier = 1;
	 				visits[i].requestCount = 1;
	 			}
	 			/* Set lastRequest to this request */
	 			visits[i].lastRequest = requestRecord.newRequestAt;
	 		} else {
 				/* Check for and remove request records if interval is greater than removeRecodAfter */
 				let timeSinceLastVisit = (requestRecord.newRequestAt - visits[i].lastRequestAt);
 				if(timeSinceLastVisit >= removeRecordAfter) {
 					visits.splice(i, 1);
 				}
 				/* There isn't an existing requestRecord for this visitor, add it to visits array */
 				if(i === 1 && !requestRecordFound) {
		 			visits.push(requestRecord);
	 			}
 			}
	 	}
 	}
 	console.log(visits, requestRecord.delayMultiplier);
 	//Delay processing request
 	setTimeout(() => {
 		next();
 	}, (delayInMS * requestRecord.delayMultiplier));
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = rationjs;
}