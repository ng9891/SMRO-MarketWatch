import * as cheerio from 'cheerio';
import getUnixTime from 'date-fns/getUnixTime';
import {cleanShopPrice, cleanShopText} from '../helpers/helpers';
import {VendInfo} from '../ts/interfaces/VendInfo';
import {Scrape} from '../ts/interfaces/Scrape';

const getItemInfoFromDOM = ($: cheerio.Root) => {
  const infoTable = $('table').eq(1);
  const name = infoTable.find('tr').eq(2).children('td').eq(0).text().trim();
  const type = infoTable.find('tr').eq(2).children('td').eq(-1).text().trim();
  const location = cleanShopText(infoTable.find('tr').eq(9).children('td').eq(0).text().trim());
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

const parseTableInfo = ($: cheerio.Root, itemID: string, table: Array<cheerio.Element>): VendInfo[] => {
  if (table.length === 0) return [];
  const vendInfo = table.map((vend) => {
    const col = $(vend).find('td');
    const shopName = cleanShopText(col.eq(col.length - 1).text());
    const shopURL = col
      .eq(col.length - 1)
      .find('span a')
      .attr('href');
    const shopID = shopURL?.slice(shopURL.lastIndexOf('=') + 1).slice(0, -2);
    const amount = Number(cleanShopText(col.eq(col.length - 2).text()));
    const price = cleanShopPrice(col.eq(col.length - 3).text());
    const card3 = cleanShopText(col.eq(col.length - 4).text());
    const card2 = cleanShopText(col.eq(col.length - 5).text());
    const card1 = cleanShopText(col.eq(col.length - 6).text());
    const card0 = cleanShopText(col.eq(col.length - 7).text());
    const cardGroup = {card0, card1, card2, card3};

    const itemNameCol = col.eq(col.length - 8);
    const itemName = cleanShopText(itemNameCol.find('.item_name').text());
    const refinement = cleanShopText(itemNameCol.contents().eq(0).text()) || '-';

    const optContainer = itemNameCol.children('ul').children('li');
    const option1 = cleanShopText(optContainer.eq(0).text()) || '-';
    const option2 = cleanShopText(optContainer.eq(1).text()) || '-';
    const option3 = cleanShopText(optContainer.eq(2).text()) || '-';
    const optionGroup = {option1, option2, option3};
    return {shopID, refinement, itemID, itemName, shopName, price, amount, ...cardGroup, ...optionGroup};
  });
  return vendInfo;
};

// Scraps only the first vending page.
const scrapItemInfoByID = async (itemID: string): Promise<Scrape> => {
  if (!itemID) throw new Error('Invalid itemID ' + itemID);
  // if (!process.env.ITEM_URL) throw new Error('No ITEM_URL found in the .env file.');
  const url = process.env.ITEM_URL + itemID;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const $ = cheerio.load(await response.text());
  const {name, type, location} = getItemInfoFromDOM($);
  if (!name) throw Error('Item not found for ID: ' + itemID);

  const table = getTableFromDOM($);
  const vendInfoArr = parseTableInfo($, itemID, table);
  const timestamp = getUnixTime(new Date());
  return {itemID, name, type, equipLocation: location, timestamp, vend: [...vendInfoArr]};
};

export default scrapItemInfoByID;
