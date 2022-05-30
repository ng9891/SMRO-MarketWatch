"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = __importStar(require("cheerio"));
const getUnixTime_1 = __importDefault(require("date-fns/getUnixTime"));
const helpers_1 = require("../helpers/helpers");
const fetchHeader = {
    Referer: 'https://www.google.com/',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
    'X-Amzn-Trace-Id': 'Root=1-6293e894-7f78d4e0492efe3451e6fe5d',
};
const getItemInfoFromDOM = ($) => {
    const infoTable = $('table').eq(1);
    const name = infoTable.find('tr').eq(2).children('td').eq(0).text().trim();
    const type = infoTable.find('tr').eq(2).children('td').eq(-1).text().trim();
    const location = (0, helpers_1.cleanShopText)(infoTable.find('tr').eq(9).children('td').eq(0).text().trim());
    return { name, type, location };
};
const getTableFromDOM = ($) => {
    const headerEl = $('h3')
        .toArray()
        .filter((el) => $(el).text() === 'Vending information:')[0];
    if (!headerEl)
        return [];
    const tableEl = $(headerEl);
    const table = tableEl.next().find('tr').toArray();
    table.shift(); // Eliminate Table header
    return table;
};
const parseTableInfo = ($, itemID, table) => {
    if (table.length === 0)
        return [];
    const vendInfo = table.map((vend) => {
        const col = $(vend).find('td');
        const shopName = (0, helpers_1.cleanShopText)(col.eq(col.length - 1).text());
        const shopURL = col
            .eq(col.length - 1)
            .find('span a')
            .attr('href');
        const matchShopID = shopURL === null || shopURL === void 0 ? void 0 : shopURL.match(/\d+/g);
        if (!matchShopID)
            throw new Error('ShopID is not found while parsing vend info: ' + itemID);
        const shopID = matchShopID[0];
        const amount = Number((0, helpers_1.cleanShopText)(col.eq(col.length - 2).text()));
        const price = (0, helpers_1.cleanShopPrice)(col.eq(col.length - 3).text());
        const card3 = (0, helpers_1.cleanShopText)(col.eq(col.length - 4).text());
        const card2 = (0, helpers_1.cleanShopText)(col.eq(col.length - 5).text());
        const card1 = (0, helpers_1.cleanShopText)(col.eq(col.length - 6).text());
        const card0 = (0, helpers_1.cleanShopText)(col.eq(col.length - 7).text());
        const cardGroup = { card0, card1, card2, card3 };
        const itemNameCol = col.eq(col.length - 8);
        const itemName = (0, helpers_1.cleanShopText)(itemNameCol.find('.item_name').text());
        const refinement = (0, helpers_1.cleanShopText)(itemNameCol.contents().eq(0).text()) || '-';
        const itemGroup = { itemID, itemName, refinement };
        const shopGroup = { shopID, shopName, amount, price };
        const optContainer = itemNameCol.children('ul').children('li');
        const option1 = (0, helpers_1.cleanShopText)(optContainer.eq(0).text()) || '-';
        const option2 = (0, helpers_1.cleanShopText)(optContainer.eq(1).text()) || '-';
        const option3 = (0, helpers_1.cleanShopText)(optContainer.eq(2).text()) || '-';
        const optionGroup = { option1, option2, option3 };
        const hash = (0, helpers_1.calculateVendHash)(Object.assign(Object.assign(Object.assign(Object.assign({}, itemGroup), shopGroup), cardGroup), optionGroup));
        return Object.assign(Object.assign(Object.assign(Object.assign({ hash }, shopGroup), itemGroup), cardGroup), optionGroup);
    });
    return vendInfo;
};
// Scraps only the first vending page.
const scrapItemInfoByID = (itemID) => __awaiter(void 0, void 0, void 0, function* () {
    if (!itemID)
        throw new Error('Invalid itemID ' + itemID);
    // if (!process.env.ITEM_URL) throw new Error('No ITEM_URL found in the .env file.');
    const url = process.env.ITEM_URL + itemID;
    const response = yield fetch(url, { headers: fetchHeader });
    if (!response.ok)
        throw new Error(response.statusText);
    const $ = cheerio.load(yield response.text());
    const { name, type, location } = getItemInfoFromDOM($);
    if (!name)
        throw Error('Item not found for ID: ' + itemID);
    const table = getTableFromDOM($);
    const vendInfoArr = parseTableInfo($, itemID, table);
    const timestamp = (0, getUnixTime_1.default)(new Date());
    return { itemID, name, type, equipLocation: location, timestamp, vends: [...vendInfoArr] };
});
exports.default = scrapItemInfoByID;
