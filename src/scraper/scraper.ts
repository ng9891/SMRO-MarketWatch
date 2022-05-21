import * as cheerio from 'cheerio';
import {cleanShopPrice, cleanShopText} from '../helpers/helper';

const handleResponseError = (response: Response) => {
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response;
};

const getItemInfoFromDOM = ($: cheerio.Root) => {
  const infoTable = $('table').eq(1);
  const name = infoTable.find('tr').eq(2).children('td').eq(0).text().trim();
  const type = infoTable.find('tr').eq(2).children('td').eq(-1).text().trim();
  const location = infoTable.find('tr').eq(9).children('td').eq(0).text().trim();
  return {name, type, location};
};

const getTableFromDOM = ($: cheerio.Root) => {
  const headerEl: cheerio.Element = $('h3')
    .toArray()
    .filter((el) => $(el).text() === 'Vending information:')[0];

  if (!headerEl) return [];

  const tableEl = $(headerEl);
  const table: Array<cheerio.Element> = tableEl.next().find('tr').toArray();
  table.shift(); // Eliminate Table header
  return table;
};

const parseTableInfo = ($: cheerio.Root, table: Array<cheerio.Element>) => {
  if (table.length === 0) return [];
  const vendInfo = table.map((vend) => {
    const col = $(vend).find('td');
    const shopName = cleanShopText(col.eq(col.length - 1).text());
    const shopURL = col
      .eq(col.length - 1)
      .find('span a')
      .attr('href');
    const shopID = shopURL?.slice(shopURL.lastIndexOf('=') + 1);
    const amount = cleanShopText(col.eq(col.length - 2).text());
    const price = cleanShopPrice(col.eq(col.length - 3).text());
    const card3 = cleanShopText(col.eq(col.length - 4).text());
    const card2 = cleanShopText(col.eq(col.length - 5).text());
    const card1 = cleanShopText(col.eq(col.length - 6).text());
    const card0 = cleanShopText(col.eq(col.length - 7).text());
    return {shopID, shopName, price, amount, card0, card1, card2, card3};
  });
  return vendInfo;
};

// Scraps only the first vending page.
const scrapItemInfoByID = async (itemID: string) => {
  try {
    if (!itemID) throw new Error('Invalid itemID ' + itemID);
    if (!process.env.ITEM_URL) throw new Error('No ITEM_URL found in the .env file.');
    const url = process.env.ITEM_URL + itemID;
    const response = await fetch(url);
    const res = handleResponseError(response);
    const $ = cheerio.load(await res.text());
    const {name, type, location} = getItemInfoFromDOM($);
    if (!name) throw Error('Item not found for ID: ' + itemID);

    const table = getTableFromDOM($);
    const vendInfoArr = parseTableInfo($, table);

    return {name, type, location, vend: [...vendInfoArr]};
  } catch (error) {
    const err = error as Error;
    throw new Error(err.message);
  }
};

export default scrapItemInfoByID;

const test = async () => {
  console.log(await scrapItemInfoByID('663534'));

  // 28942 CKS
  // 6635 BSB

  /**
   const fs = require('fs');
      const path = require('path');
    fs.readFile(path.resolve(__dirname, `./${filename}`), (err, data) => {
      if (err) return reject(`Error reading "${filename}" file.`);
      try {
        // console.log(`File:${filename} opened.`);
        return resolve(JSON.parse(data));
      } catch (e) {
        // console.error(e);
        console.error(`Error parsing "${filename}" file.`);
        return reject(`Error parsing "${filename}" file.`);
      }
    });
   */
};
