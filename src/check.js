const hash = require('object-hash');
const utils = require('./utils/utils');
const scrap = require('./scraper/scraper');
let {globalVend} = require('./globalVendObj');

/**
 * Serves as the entry point for the CRON Job to check for new listings.
 * Updates global globalVend variable to keep track of the current vending list.
 * List will only be kept during run time.
 * @param {String} userID 
 * @param {String} itemID 
 * @return {Array} array of new entries.
 */
function checkForNewEntry(userID, itemID) {
  return new Promise(async (resolve, reject) => {
    let wl = await utils.openJSONFile('../wl.json').catch((e) => {
      return reject(e);
    });

    if (!wl[userID]) return reject('No user in json file.');
    if (!wl[userID].tracking[itemID]) return reject('Not tracking itemID', itemID);
    let tracking = wl[userID].tracking[itemID];

    if (!globalVend[userID] || Object.keys(globalVend[userID]).length < 1) {
      globalVend[userID] = {[id]: {}};
    }

    let id = itemID;
    let vendToNotify = [];

    // TODO: Catch scrapping errors.
    let vendList = await scrap.scrapVendInfo(id, tracking.price); 

    if (!vendList || Object.keys(vendList) < 1) {
      console.log('Nothing vending atm for id:', id);
      // Set the global hash table to empty. 
      globalVend[userID][id] = {};
      return resolve([]);
    }

    let newVendList = {};
    for (let i = 0; i < vendList.vend.length; i++) {
      let vend_o = Object.assign({}, vendList.vend[i]); // Save to keep the 'amount' property
      let vend = vendList.vend[i];
      if (vend.price <= tracking.price) {
        delete vend['amount']; // Delete amount from the hash.
        let hashVal = hash(vend);
        // New vending list.
        if (!newVendList[id]) newVendList[id] = {};
        newVendList[id][hashVal] = vend;

        if (!globalVend[userID][id][hashVal]) {
          // Send notification.
<<<<<<< HEAD:src/scheduler/check.js
          // globalVend[userID][itemID] = {[hashVal]:vend};
          vendToNotify.push(vend_o);
=======
          vendToNotify.push(vend);
>>>>>>> parent of 531ae1c... Alpha version with cron job:src/check.js
        }
      } else {
        break; // Vend are sorted by price. So, if its more than threshold we can break.
      }
    }
<<<<<<< HEAD:src/scheduler/check.js
    Object.assign(globalVend[userID], newVendList);
    // console.log(`globalVend[${userID.slice(-4)}]`, globalVend[userID]);
=======
    if (!globalVend[userID]) globalVend[userID] = {};
    globalVend[userID] = newVendList;
>>>>>>> parent of 531ae1c... Alpha version with cron job:src/check.js

    return resolve(vendToNotify);
  });
}

module.exports = {
  checkForNewEntry,
};
// let wl = {
//   '105899837517475840': {
//     username: 'Vulty',
//     count: 10,
//     tracking: {
//       '6635': {
//         itemName: 'Blacksmith Blessing',
//         time: 30,
//         price: 5900000,
//       },
//     },
//   },
// };


