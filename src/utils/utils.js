const path = require('path');
const fs = require('fs');
const {table} = require('table');

const defaults = {
  CRON_TIME: 30,
  PRICE_THRESHOLD: 999999999999,
  MAX_LIST_SIZE: 10,
  URL:`https://www.shining-moon.com/hel/?module=item&action=view&price_order=asc&id=`,
  SHOP_URL:`https://shining-moon.com//hel/?module=vending&action=viewshop&id=`,
  THUMBNAIL_URL:`https://www.shining-moon.com/hel/data/items/images/`,
};

function convertToThousands(num) {
  return num * 1000;
}

function convertToMillions(num) {
  return num * 1000000;
}

function convertToBillions(num) {
  return num * 1000000000;
}

function parsePrice(price) {
  let num = Number.parseFloat(price);
  if (price.endsWith('b')) return convertToBillions(num);
  if (price.endsWith('m')) return convertToMillions(num);
  if (price.endsWith('k')) return convertToThousands(num);
  return num;
}

function displayInThousands(num) {
  return (num / 1000).toFixed(1) + 'k';
}

function displayInMillions(num) {
  return (num / 1000000).toFixed(1) + 'm';
}

function displayInBillions(num) {
  return (num / 1000000000).toFixed(1) + 'b';
}

function formatPrice(num) {
  // return num.toLocaleString('en-US');
  if(num < 1000000) return displayInThousands(num);
  if (num < 1000000000) return displayInMillions(num);
  return displayInBillions(num);
}

function printReply(msg, replyObj) {
  if (!replyObj) return msg.reply(`Something wrong with reply Object. Contact dev.`);
  switch (replyObj.status) {
    case 'price':
      return msg.reply(`Price cannot be bigger than ${formatPrice(defaults.PRICE_THRESHOLD)} z`);
    case 'full':
      return msg.reply(`Sorry. Your list is full.`);
    case 'empty':
      return msg.reply(`Your list is empty.`);
    case 'notexist':
      return msg.reply(`Sorry. ItemID is not on your current list.`);
    case 'clear':
      return msg.reply(`List cleared.`);
    case 'notFound':
      return msg.reply(`ItemID not found.`);
  }

  let embed = {
    title: `${replyObj.itemID}: ${replyObj.itemName}`,
    url: `${defaults.URL}${replyObj.itemID}`,
    thumbnail: {
      url: `${defaults.THUMBNAIL_URL}${replyObj.itemID}.png`,
    },
    fields: [
      {name: 'itemID', value: replyObj.itemID},
      {name: 'Cron Time', value: replyObj.time + ' min'},
      {name: 'Price Threshold', value: replyObj.price.toLocaleString('en-US') + ' z'},
      {name: 'Status', value: `**${replyObj.status.toUpperCase()}**`},
      {
        name: '# of Cron Jobs',
        value: `${replyObj.count}/${defaults.MAX_LIST_SIZE} (${defaults.MAX_LIST_SIZE - replyObj.count} left)`,
      },
    ],
  };

  msg.reply('', {embed});
}

function openJSONFile(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, `./${filename}`), (err, data) => {
      if (err) {
        console.error(err);
        return reject(`Error reading "${filename}" file.`);
      }
      try {
        console.log(`File:${filename} opened.`);
        return resolve(JSON.parse(data));
      } catch (e) {
        // console.error(e);
        console.error(`Error parsing "${filename}" file.`);
        return reject(`Error parsing "${filename}" file.`);
      }
    });
  });
}

function writeJSONFile(filename, json) {
  return new Promise((resolve, reject) => {
    let data = JSON.stringify(json);
    fs.writeFile(path.resolve(__dirname, `./${filename}`), data, (err) => {
      if (err) return reject(`Error writing "${filename}" file.`);
      console.log('Data written to file');
      return resolve('Data written to file');
    });
  });
}

// TODO: Optimize. Refactor
function printArrAsTable(arr, itemType = '-') {
  if (arr.length > 22) return '\nSorry. Too many to list on Discord. \nHowever, future listing below threshold will be notified.\
  \nTips: Decrease your threshold or use !ws command.\n';

  let isEquip = true;
  if (itemType === '-') isEquip = false;
  let titleObj;
  // Decide what Title to use.
  if (!isEquip) {
    let {shopName, amount, owner, card0, card1, card2, card3, ...rest} = arr[0];
    titleObj = rest;
  } else {
    let {shopName, amount, owner, ...rest} = arr[0];
    titleObj = rest;
  }
  let data = [Object.keys(titleObj)];

  for (item of arr) {
    let colObj;
    if (!isEquip) {
      let {shopName, amount, owner, card0, card1, card2, card3, ...rest} = item;
      colObj = rest;
    } else {
      let {shopName, amount, owner, ...rest} = item;
      colObj = rest;
    }
    let vend = [];
    for (let [key, value] of Object.entries(colObj)) {
      if (key === 'price') value = formatPrice(value);
      vend.push(value);
    }
    data.push(vend);
  }
  const output = table(data, {singleLine: true});
  return output;
}

module.exports = {defaults, printReply, openJSONFile, writeJSONFile, parsePrice, formatPrice, printArrAsTable};
