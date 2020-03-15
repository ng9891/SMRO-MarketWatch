const utils = require('../utils/utils');
const scrapper = require('../scraper/scraper');

function clearWatchList(userID){
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
    
    return resolve('clear')
  });
}


// TODO: Refactor creating new objects. With Object.assign(?)
function addToWatchList({userID, username, itemID, time, price} = {}) {
  return new Promise(async (resolve, reject) => {
    if (!itemID || !time || !price) return reject('addToWatchList called with invalid arguments');
    if (price > utils.defaults.PRICE_THRESHOLD) return resolve({status: 'price', itemID: itemID, time: time, price: price});
    // console.log(`${userID} - ${username}: Adding itemID=${itemID} t=${time} p=${price}`);
    let wl = await utils.openJSONFile('../wl.json').catch((e) => {
      return reject(e);
    });

    const {itemName, itemType} = await scrapper.scrapItemInfoByID(itemID);
    if(!itemName) return resolve({status: 'notFound'});
  
    let overWritten = false;
    if (!wl[userID]) {
      // New user entry
      wl[userID] = {
        username: username,
        count: 1,
        tracking: {
          [itemID]: {
            itemName: itemName,
            price: price,
            time: time,
          },
        },
      };
    } else if (wl[userID].tracking[itemID]) {
      // Already tracking
      wl[userID].tracking[itemID].time = time;
      wl[userID].tracking[itemID].price = price;
      wl[userID].tracking[itemID].itemName = itemName;
      wl[userID].tracking[itemID].itemType = itemType;
      overWritten = true;
    } else {
      // Add new entry
      if (wl[userID].count >= utils.defaults.MAX_LIST_SIZE)
        return resolve({
          status: 'full',
          itemName: itemName,
          itemType: itemType,
          itemID: itemID,
          time: time,
          price: price,
          count: wl[userID].count,
        });
      wl[userID].tracking[itemID] = {
        itemName: itemName,
        itemType: itemType,
        time: time,
        price: price,
      };
      wl[userID].count++;
    }

    let returnObj = {
      by: userID,
      itemName: itemName,
      itemType: itemType,
      itemID: itemID,
      time: time,
      price: price,
      count: wl[userID].count,
    };

    await utils.writeJSONFile('../wl.json', wl).catch((e) => {
      return reject(e);
    });

    let status = 'add';
    if (overWritten) status = 'overwrite';

    // return resolve({status: status, itemID: itemID, time: time, price: price, count: wl[userID].count});
    return resolve(Object.assign({status: status}, returnObj));
    // return resolve({status: 'add', itemID: itemID, time: time, price: price, count: wl[userID].count});
  });
}

function rmFromWatchList(userID, itemID) {
  return new Promise(async (resolve, reject) => {
    if (!itemID) return console.log('rmFromWatchList called with no itemid');
    // console.log(`RM itemID=${itemID}`);
    let wl = await utils.openJSONFile('../wl.json').catch((e) => {
      return reject(e);
    });
    if (!wl[userID] || wl[userID].count === 0) {
      // User doesnt exist.
      return resolve({status: 'empty', itemID: itemID});
    }
    if (!wl[userID].tracking[itemID]) return resolve({status: 'notexist', itemID: itemID});

    let tempTracking = Object.assign({}, wl[userID].tracking[itemID]);
    delete wl[userID].tracking[itemID];
    wl[userID].count--;

    let returnObj = {
      by: userID,
      itemName: tempTracking.itemName,
      itemType: tempTracking.itemType,
      itemID: itemID,
      price: tempTracking.price,
      time: tempTracking.time,
      count: wl[userID].count,
    };
    // Add hashvalue to tracking
    // tempTracking.hash = hash(objToHash); // SHA1 default

    // Delete cron job

    await utils.writeJSONFile('../wl.json', wl).catch((e) => {
      return reject(e);
    });

    return resolve(Object.assign({status: 'rm'}, returnObj));
    // return resolve({status: 'rm', itemID: itemID, price: temp.price, time: temp.time, count: wl[userID].count});
  });
}
module.exports = {
  addToWatchList,
  rmFromWatchList,
  clearWatchList,
};
