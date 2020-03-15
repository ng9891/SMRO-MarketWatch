const utils = require('./utils');
const {table} = require('table');

function printTracking(userID) {
  return new Promise(async (resolve, reject) => {
    let wl = await utils.openJSONFile('../wl.json').catch((e) => {
      return reject(e);
    });

    let list = wl[userID].tracking;
    if (!list || list.length < 1) return resolve('Sorry, Your list is empty.');
    let data = [['#', 'ItemID', 'Name', 'Price', 'Cron']];
    let keys = Object.keys(list);
    for (let i = 0; i < keys.length; i++) {
      let item = list[keys[i]];
      data.push([i + 1, keys[i], item.itemName, utils.formatPrice(item.price) + ' z', item.time + 'min']);
    }
    const output = table(data, {singleLine: true});
    return resolve(output + `Total of ${keys.length} out of ${utils.defaults.MAX_LIST_SIZE}.`);
  });
}
module.exports = {
  printTracking,
};
