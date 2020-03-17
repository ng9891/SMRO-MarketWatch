const utils = require('./utils');
const {table} = require('table');
const moment = require('moment');

// Change output format for relative time.
moment.updateLocale('en', {
  relativeTime : {
      future: "in %s",
      past:   "%s ago",
      s  : 'secs',
      ss : '%dsecs',
      m:  "a min",
      mm: "%dmin",
      h:  "1hr",
      hh: "%dhr",
      d:  "a day",
      dd: "%ddays",
      M:  "a month",
      MM: "%dmonth",
      y:  "a year",
      yy: "%dyears"
  }
});

function printTracking(userID) {
  return new Promise(async (resolve, reject) => {
    let wl = await utils.openJSONFile('../wl.json').catch((e) => {
      return reject(e);
    });

    if (!wl || !wl[userID] || !wl[userID].tracking) return resolve('Sorry, Your list is empty.');
    let list = wl[userID].tracking;
    let data = [['#', 'ID', 'Name', '$', 'Cron', 'Added']];
    let keys = Object.keys(list);
    for (let i = 0; i < keys.length; i++) {
      let item = list[keys[i]];
      data.push([i + 1, keys[i], item.itemName, utils.formatPrice(item.price), item.time,moment(item.timestamp).fromNow()]);
    }
    const output = table(data, {singleLine: true});
    return resolve(output + `Total of ${keys.length} out of ${utils.defaults.MAX_LIST_SIZE}.`);
  });
}
module.exports = {
  printTracking,
};
