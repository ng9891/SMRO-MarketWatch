import * as cheerio from 'cheerio';
import getUnixTime from 'date-fns/getUnixTime';
import {cleanShopPrice, cleanShopText, calculateVendHash} from '../helpers/helpers';
import {VendInfo} from '../ts/interfaces/VendInfo';
import {Scrape} from '../ts/interfaces/Scrape';
import {ServerName} from '../ts/types/ServerName';

const fetchHeader = {
  Referer: 'https://www.google.com/',
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
  'X-Amzn-Trace-Id': 'Root=1-6293e894-7f78d4e0492efe3451e6fe5d',
};

const getNumOfPages = ($: cheerio.Root) => {
  const num = Number($('.pages').find('a').last().text());
  if (!num || isNaN(num) || num === 0) return 1;
  return num;
};

const getTableFromDOM = ($: cheerio.Root, server: ServerName) => {
  let table: Array<cheerio.Element>;
  if (server === 'HEL') {
    const headerEl: cheerio.Element = $('h3')
      .toArray()
      .filter((el) => $(el).text() === 'Vending information:')[0];

    if (!headerEl) return [];
    const tableEl = $(headerEl);
    table = tableEl.next().find('tr').toArray();
  } else {
    table = $('table.vertical-table').find('tr').toArray();
  }
  table.shift(); // Eliminate Table header
  return table;
};

const parseTableHel = ($: cheerio.Root, table: cheerio.Element[]): VendInfo[] => {
  const vendInfo = table.map((vend) => {
    const col = $(vend).find('td');

    const itemNameCol = col.eq(col.length - 8);
    const itemName = cleanShopText(itemNameCol.find('.item_name').text());
    const refinement = cleanShopText(itemNameCol.contents().eq(0).text()) || '-';
    const id = col.eq(0).find('a').text();
    const itemGroup = {itemID: id, itemName, refinement};

    const shopName = cleanShopText(col.eq(col.length - 1).text());
    const shopURL = col
      .eq(col.length - 1)
      .find('span a')
      .attr('href');
    const matchShopID = shopURL?.match(/\d+/g);
    if (!matchShopID) throw new Error('ShopID is not found while parsing vend info: ' + id);
    const shopID = matchShopID[0];
    const amount = Number(cleanShopText(col.eq(col.length - 2).text()));
    const price = cleanShopPrice(col.eq(col.length - 3).text());
    const shopGroup = {shopID, shopName, amount, price};

    const card3 = cleanShopText(col.eq(col.length - 4).text());
    const card2 = cleanShopText(col.eq(col.length - 5).text());
    const card1 = cleanShopText(col.eq(col.length - 6).text());
    const card0 = cleanShopText(col.eq(col.length - 7).text());
    const cardGroup = {card0, card1, card2, card3};

    const optContainer = itemNameCol.children('ul').children('li');
    const option1 = cleanShopText(optContainer.eq(0).text()) || '-';
    const option2 = cleanShopText(optContainer.eq(1).text()) || '-';
    const option3 = cleanShopText(optContainer.eq(2).text()) || '-';
    const optionGroup = {option1, option2, option3};
    const hash = calculateVendHash({...itemGroup, ...shopGroup, ...cardGroup, ...optionGroup});
    return {hash, server: 'HEL' as ServerName, ...shopGroup, ...itemGroup, ...cardGroup, ...optionGroup};
  });
  return vendInfo;
};

const parseTableNif = ($: cheerio.Root, table: cheerio.Element[]): VendInfo[] => {
  const vendInfo = table.map((vend) => {
    const col = $(vend).find('td');

    const itemCol = col.eq(3);
    const itemName = cleanShopText(itemCol.find('a').text());
    const itemIDMatch = itemCol.find('a').attr('href')?.match(/\d+/g);
    if (!itemIDMatch) throw new Error('itemID not found for item: ' + itemName);
    const itemID = itemIDMatch[0];
    const refinement = itemCol.find('strong').text();
    const itemGroup = {itemID, itemName, refinement};

    const shopNameCol = col.eq(0);
    const shopName = cleanShopText(shopNameCol.text());
    const matchShopID = shopNameCol.find('a').attr('href')?.match(/\d+/g);
    if (!matchShopID) throw new Error('ShopID is not found while parsing vend info: ' + itemID);
    const shopID = matchShopID[0];
    const amount = Number(cleanShopText(col.eq(9).text()));
    const price = cleanShopPrice(col.eq(8).text());
    const merchant = cleanShopText(col.eq(1).text());
    const position = cleanShopText(col.eq(2).text());
    const shopGroup = {shopID, shopName, amount, price, merchant, position};

    const card3 = cleanShopText(col.eq(7).text());
    const card2 = cleanShopText(col.eq(6).text());
    const card1 = cleanShopText(col.eq(5).text());
    const card0 = cleanShopText(col.eq(4).text());
    const cardGroup = {card0, card1, card2, card3};

    const optContainer = itemCol.children('ul').children('li');
    const option1 = cleanShopText(optContainer.eq(0).text()) || '-';
    const option2 = cleanShopText(optContainer.eq(1).text()) || '-';
    const option3 = cleanShopText(optContainer.eq(2).text()) || '-';
    const optionGroup = {option1, option2, option3};
    const hash = calculateVendHash({...itemGroup, ...shopGroup, ...cardGroup, ...optionGroup});
    return {hash, server: 'NIF' as ServerName, ...shopGroup, ...itemGroup, ...cardGroup, ...optionGroup};
  });

  return vendInfo;
};

const parseTableInfo = ($: cheerio.Root, server: ServerName): VendInfo[] => {
  const table = getTableFromDOM($, server);
  if (table.length === 0) return [];
  const vends = server === 'HEL' ? parseTableHel($, table) : parseTableNif($, table);
  return vends;
};

const getItemInfoFromDOM = ($: cheerio.Root, server: ServerName) => {
  const infoTable = server === 'HEL' ? $('table').eq(1) : $('table.vertical-table');
  const itemID = infoTable.find('tr').eq(0).children('td').eq(0).text().trim();
  const name = infoTable.find('tr').eq(2).children('td').eq(0).text().trim();
  const type = infoTable.find('tr').eq(2).children('td').eq(-1).text().trim();
  const location = cleanShopText(infoTable.find('tr').eq(9).children('td').eq(0).text().trim());
  return {itemID, name, type, location};
};

const scrapeItemInfoNif = async (itemID: string) => {
  const url = process.env.URL_NIF_ITEM + itemID;
  const response = await fetch(url, {headers: fetchHeader});
  if (!response.ok) throw new Error(response.statusText);

  // await fs.writeFile(path.resolve(__dirname, './mocks/nif_ADInfoResponse.txt'), await response.text());
  const $itemInfo = cheerio.load(await response.text());
  const itemInfo = getItemInfoFromDOM($itemInfo, 'NIF');
  return itemInfo;
};

export const scrapeVends = async (item: string, page = 1, server: ServerName) => {
  if (!item) throw new Error('Invalid item ' + item);
  const encItem = encodeURIComponent(item);
  const p = `&p=${page}`;
  const url = server === 'HEL' ? process.env.URL_HEL + encItem + p : process.env.URL_NIF + encItem + p;

  const response = await fetch(url, {headers: fetchHeader});
  if (!response.ok) throw new Error(response.statusText);

  const $ = cheerio.load(await response.text());
  return parseTableInfo($, server);
};

export const scrapeItem = async (itemID: string, itemName: string, server: ServerName): Promise<Scrape> => {
  if (!itemID) throw new Error('Invalid itemID ' + itemID);
  if (!itemName) throw new Error('Invalid itemName ' + itemName);

  const encItem = encodeURIComponent(itemName);
  const url = server === 'HEL' ? process.env.URL_HEL + itemID : process.env.URL_NIF + encItem;

  const response = await fetch(url, {headers: fetchHeader});
  if (!response.ok) throw new Error(response.statusText);

  const $ = cheerio.load(await response.text());

  const itemInfo = server === 'HEL' ? getItemInfoFromDOM($, server) : await scrapeItemInfoNif(itemID);
  const {itemID: id, name, type, location} = itemInfo;

  if (!id || !name) throw new Error(`No item found for: ${itemID}:${itemName} in ${server}`);

  const vendsOnPage = parseTableInfo($, server);
  const arrOfVendsArr: Array<VendInfo[]> = [vendsOnPage];
  const numOfPages = getNumOfPages($);
  if (numOfPages > 1) {
    // Starting from Second page
    const item = server === 'HEL' ? id : name;
    for (let i = 2; i <= numOfPages; i++) {
      arrOfVendsArr.push(await scrapeVends(item, i, server));
    }
  }
  const flatVends = arrOfVendsArr.flat();
  const vends = server === 'HEL' ? flatVends : flatVends.sort((a, b) => a.price - b.price);

  const timestamp = getUnixTime(new Date());
  return {itemID: id, name, type, server, equipLocation: location, timestamp, vends};
};
