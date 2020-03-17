const utils = require('../utils/utils');
const scrapper = require('../scraper/scraper');

/**
 * Removes all items from @param userID watchlist
 * @param {String} userID 
 * @return {String} 'clear' on success.
 */
function clearWatchList(userID) {
  return new Promise(async (resolve, reject) => {
    let wl = await utils.openJSONFile('../wl.json').catch((e) => {
      return reject(e);
    });
    if (!wl[userID] || Object.keys(wl[userID].tracking).length < 1) return resolve('empty');
    wl[userID].tracking = {};
    wl[userID].count = 0;

    await utils.writeJSONFile('../wl.json', wl).catch((e) => {
      return reject(e);
    });

    return resolve('clear');
  });
}

/**
 * Adds an itemID to the userID watchlist.
 * @param {Object} param0 should contain {userID, username, itemID, time and price} information
 * @return {Object} an object with all the listing properties and a status.
 */
function addToWatchList({userID, username, itemID, time, price} = {}) {
  return new Promise(async (resolve, reject) => {
    if (!itemID || !time || !price) return reject('addToWatchList called with invalid arguments');

    // Gets watchlist and scrap the item info.
    const [wl, itemInfo] = await Promise.all([
      utils.openJSONFile('../wl.json'),
      scrapper.scrapItemInfoByID(itemID),
    ]).catch((e) => {
      return reject(e);
    });

    //  itemInfo should contain information about the item. e.g. {itemName, itemType, equipLocation}
    if (!itemInfo.itemName) return resolve({status: 'notFound'});

    // If JSON file is empty.
    if (!wl) wl = {[userID]: {username, count: 0, tracking: {}}};
    else if (!wl[userID]) wl[userID] = {username: username, count: 0, tracking: {}};
    else if (!wl[userID].tracking) wl[userID].tracking = {};

    let status = 'add';
    let timestamp = Date.now();
    if (price > utils.defaults.PRICE_THRESHOLD) {
      // Input price is too big.
      status = 'price';
    } else if (wl[userID].tracking[itemID] && Object.keys(wl[userID].tracking[itemID]).length > 0) {
      // Already tracking
      status = 'overwrite';
      Object.assign(wl[userID].tracking[itemID], {time, price, timestamp});
    } else if (wl[userID].count >= utils.defaults.MAX_LIST_SIZE) {
      // Full List. We dont do anything.
      status = 'full';
    } else {
      // Add new itemID for tracking
      wl[userID].tracking[itemID] = {...itemInfo, time, price, timestamp};
      wl[userID].count++;
    }

    let returnObj = {status, by: userID, timestamp, itemID, count: wl[userID].count, ...wl[userID].tracking[itemID]};

    await utils.writeJSONFile('../wl.json', wl).catch((e) => {
      return reject(e);
    });

    // console.log('addToWatchList', returnObj);
    return resolve(returnObj);
  });
}

/**
 * Removes @param itemID from @param userID watchlist.
 * @param {String} userID 
 * @param {String} itemID 
 * @return {Object} an object with all the listing properties and a status.
 */
function rmFromWatchList(userID, itemID) {
  return new Promise(async (resolve, reject) => {
    if (!itemID) return console.log('rmFromWatchList called with no itemid');

    let wl = await utils.openJSONFile('../wl.json').catch((e) => {
      return reject(e);
    });

    // User doesnt exist.
    if (!wl[userID] || wl[userID].count === 0) return resolve({status: 'empty', itemID: itemID});
    // Nothing is tracked. In case error on count.
    if (!wl[userID].tracking || !wl[userID].tracking[itemID]) return resolve({status: 'notOnList', itemID: itemID});

    let tempTracking = Object.assign({}, wl[userID].tracking[itemID]);
    delete wl[userID].tracking[itemID];
    wl[userID].count--;

    let returnObj = {status: 'rm', by: userID, itemID, count: wl[userID].count, ...tempTracking};

    await utils.writeJSONFile('../wl.json', wl).catch((e) => {
      return reject(e);
    });

    return resolve(returnObj);
  });
}
module.exports = {
  addToWatchList,
  rmFromWatchList,
  clearWatchList,
};
