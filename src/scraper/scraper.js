const cheerio = require('cheerio');
const fetch = require('node-fetch');
const utils = require('../utils/utils');
const url = utils.defaults.URL;
const shopUrl = utils.defaults.SHOP_URL;

function cleanShopText(text) {
  return text.replace(/\( Enchant \)/, '').replace(/\\n/, '').replace(/\bNone\b/g, '-').trim();
}
function cleanShopPrice(text) {
  return Number(text.replace(/\( Enchant \)/, '').replace(/\\n/).replace(/,/g, '').slice(0, -2).trim());
}

function scrapItemInfoByID(itemID) {
  return new Promise(async (resolve, reject) => {
    let html = await fetch(url + itemID);
    const $ = cheerio.load(await html.text());

    let itemName = $('table').eq(1).find('tr').eq(2).children().eq(1).text();
    let itemType = $('table').eq(1).find('tr').eq(9).children('td').eq(0).text();
    return resolve({
      itemName: cleanShopText(itemName),
      itemType: cleanShopText(itemType),
    });
  });
}

function scrapShopOwner(shopID) {
  return new Promise(async (resolve, reject) => {
    let html = await fetch(shopUrl + shopID);
    const $ = cheerio.load(await html.text());
    let pageTitle = $('h2').text();

    let shopOwner = pageTitle.slice(pageTitle.lastIndexOf('[') + 1, -1);
    return resolve(shopOwner);
  });
}

/**
 * 
 * @param {Cheerio Dom Object} $ 
 */
function findVendTable($) {
  let tableElem;
  $('h3').each((i, elm) => {
    if ($(elm).text() === 'Vending information:') {
      tableElem = $(elm).next().children('table');
    }
  });
  return tableElem;
}

function findVendHeader($) {
  let headerElem;
  $('h3').each((i, elm) => {
    if ($(elm).text() === 'Vending information:') {
      headerElem = $(elm);
    }
  });
  return headerElem;
}

function getAllShopOwnerOnTable(vendTable) {
  return new Promise(async (resolve, reject) => {
    if (vendTable.length < 1) return reject('Empty table.');
    let shopOwners = [];
    let shopUrlArr = vendTable.find('td:last-child span a').toArray();
    for (let url of shopUrlArr) {
      let shopURL = url.attribs.href;
      let shopID = shopURL.slice(shopURL.lastIndexOf('=') + 1);
      let shopOwner = await scrapShopOwner(shopID);
      shopOwners.push(shopOwner);
    }
    return resolve(shopOwners);
  });
}

// TODO: Include refine and options if equipment.
function getVendInfoOnTable($, vendTable) {
  return new Promise(async (resolve, reject) => {
    let vendInfo = [];
    let vendArr = vendTable.find('tr').toArray();
    for (let vend of vendArr) {
      let col = $(vend).find('td');
      if (col.length < 1) continue;
      let shopName = cleanShopText(col.eq(col.length - 1).text());
      let shopURL = col.eq(col.length - 1).find('span a').attr('href');
      let shopID = shopURL.slice(shopURL.lastIndexOf('=') + 1);
      // let shopOwner = await scrapShopOwner(shopID);
      let amount = cleanShopText(col.eq(col.length - 2).text());
      let price = cleanShopPrice(col.eq(col.length - 3).text());
      let card3 = cleanShopText(col.eq(col.length - 4).text());
      let card2 = cleanShopText(col.eq(col.length - 5).text());
      let card1 = cleanShopText(col.eq(col.length - 6).text());
      let card0 = cleanShopText(col.eq(col.length - 7).text());
      vendInfo.push({shopID, shopName, price, amount, card0, card1, card2, card3});
    }
    return resolve(vendInfo);
  });
}

function scrapVendByURL(url) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('scrapVendByURL:', url);
      let html = await fetch(url);
      let $ = cheerio.load(await html.text());

      // Check if vending info exists
      let vendTable = findVendTable($);
      if (!vendTable || vendTable.length < 1) return resolve(null); // No shop

      let vendObj;
      await Promise.all([getVendInfoOnTable($, vendTable), getAllShopOwnerOnTable(vendTable)]).then(async (data) => {
        let vendInfoArr = data[0];
        let vendOwnerArr = data[1];
        for (let j = 0; j < vendInfoArr.length; j++) {
          vendInfoArr[j].owner = vendOwnerArr[j];
        }
        vendObj = [...vendInfoArr];
      });
      // console.log('vendOBJ:',vendObj);
      return resolve(vendObj);
    } catch (e) {
      return reject(e);
    }
  });
}

/**
 * Serves as a driver file to call scrapVendByUrl().
 * Scrapes all available vending information including different table page tabs.
 * @param price serves as a threshold to scrap only the first page of the vending table.
 * If the max price on vending table is less than the @param price, then scrape all pages.
 * 
 * @param {String} itemID 
 * @param {Integer} price An optimization argument.
 * @return {Object} Vending information.
 * @return {Null} No vending information.
 */
function scrapVendInfo(itemID, price = utils.defaults.PRICE_THRESHOLD) {
  return new Promise(async (resolve, reject) => {
    if (!itemID) return reject('No ItemID provided.');
    try {
      let html = await fetch(url + itemID);
      let $ = cheerio.load(await html.text());

      // Get Item Name on Item Table.
      let itemName = $('table').eq(1).find('tr').eq(2).children().eq(1).text();
      itemName = cleanShopText(itemName);

      // Check if vending info exists
      let vendHeader = findVendHeader($);
      if (!vendHeader || vendHeader.length < 1) return resolve(null); // No shop
      let currMaxVendPrice = cleanShopPrice(vendHeader.next().find('table').find('tr:last-child td').eq(-3).text());

      // If it is on first page(most of the time). Do not make request for all pages.
      let numberOfPages = Number(vendHeader.next().next().children().last().text());
      console.log(price, currMaxVendPrice);
      if (price < currMaxVendPrice) numberOfPages = 1;

      let vendObj = {itemID: itemID, itemName: itemName, vend: []};
      let requests = [];
      for (let i = 0; i < numberOfPages; i++) requests.push(scrapVendByURL(`${url}${itemID}&p=${i + 1}`));

      await Promise.all(requests).then((data) => {
        for (let i = 0; i < numberOfPages; i++) {
          if (data[i]) vendObj.vend = [...vendObj.vend, ...data[i]];
        }
        return resolve(vendObj);
      });
    } catch (e) {
      return reject(e);
    }
  });
}
module.exports = {
  scrapItemInfoByID,
  scrapVendInfo,
};
