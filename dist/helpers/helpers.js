"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendsNotInHistory = exports.checkHashInHistory = exports.isItemAnEquip = exports.isSameRefinement = exports.calculateNextExec = exports.calculateVendHash = exports.formatPrice = exports.displayInBillions = exports.displayInMillions = exports.displayInThousands = exports.parsePriceString = exports.checkValidPriceString = exports.convertToBillions = exports.convertToMillions = exports.convertToThousands = exports.cleanShopPrice = exports.cleanShopText = void 0;
const addMinutes_1 = __importDefault(require("date-fns/addMinutes"));
const differenceInMinutes_1 = __importDefault(require("date-fns/differenceInMinutes"));
const fromUnixTime_1 = __importDefault(require("date-fns/fromUnixTime"));
const firestore_1 = require("firebase-admin/firestore");
const cleanShopText = (text) => {
    return text
        .split(/\n|\\n/)
        .reduce((prev, str) => {
        if (!str)
            return prev;
        if (str === '( Enchant )')
            return prev;
        if (str === 'None')
            return (prev += '-');
        return (prev += ' ' + str.trim());
    }, '')
        .trim();
};
exports.cleanShopText = cleanShopText;
const cleanShopPrice = (text) => {
    return Number(text.replace(/\( Enchant \)/, '').replace(/\\n|,|\s|z/g, ''));
};
exports.cleanShopPrice = cleanShopPrice;
const convertToThousands = (num) => {
    return num * 1000;
};
exports.convertToThousands = convertToThousands;
const convertToMillions = (num) => {
    return num * 1000000;
};
exports.convertToMillions = convertToMillions;
const convertToBillions = (num) => {
    return num * 1000000000;
};
exports.convertToBillions = convertToBillions;
const checkValidPriceString = (price) => {
    const regex = /^\d+(\.?\d*)?[k|m|b]?$/g;
    const found = price.match(regex);
    return found ? found[0] : null;
};
exports.checkValidPriceString = checkValidPriceString;
const parsePriceString = (price) => {
    const valid = (0, exports.checkValidPriceString)(price);
    if (!valid)
        return null;
    const num = Number.parseFloat(valid);
    if (isNaN(num))
        return null;
    if (price.endsWith('b'))
        return (0, exports.convertToBillions)(num);
    if (price.endsWith('m'))
        return (0, exports.convertToMillions)(num);
    if (price.endsWith('k'))
        return (0, exports.convertToThousands)(num);
    return num;
};
exports.parsePriceString = parsePriceString;
const displayInThousands = (num) => {
    return parseFloat((num / 1000).toFixed(2)) + 'k';
};
exports.displayInThousands = displayInThousands;
const displayInMillions = (num) => {
    return parseFloat((num / 1000000).toFixed(2)) + 'm';
};
exports.displayInMillions = displayInMillions;
const displayInBillions = (num) => {
    return parseFloat((num / 1000000000).toFixed(2)) + 'b';
};
exports.displayInBillions = displayInBillions;
const formatPrice = (num) => {
    if (num <= 0)
        return '0';
    if (num < 1000000)
        return (0, exports.displayInThousands)(num);
    if (num < 1000000000)
        return (0, exports.displayInMillions)(num);
    return (0, exports.displayInBillions)(num);
};
exports.formatPrice = formatPrice;
const calculateVendHash = (vend) => {
    const { itemID, shopID, shopName, price, refinement, merchant, position } = vend;
    let vendor = '';
    if (merchant)
        vendor = (merchant === null || merchant === void 0 ? void 0 : merchant.replace(/\s/g, '')) + (position === null || position === void 0 ? void 0 : position.replace(/\s/g, ''));
    const name = shopName ? shopName.split(' ').join('') : `${shopID}?${refinement}?${itemID}`;
    return `${refinement}${itemID}${shopID}${name}${price}${vendor}`;
};
exports.calculateVendHash = calculateVendHash;
const calculateNextExec = (start, current, recurrence) => {
    const started = start instanceof Date ? start : (0, fromUnixTime_1.default)(start);
    const now = current instanceof Date ? current : (0, fromUnixTime_1.default)(current);
    if (started > now)
        return started;
    if (recurrence < 0)
        return now;
    const diff = (0, differenceInMinutes_1.default)(now, started);
    const addAmount = recurrence * Math.floor(diff / recurrence);
    const newStartPoint = (0, addMinutes_1.default)(started, addAmount);
    return (0, addMinutes_1.default)(newStartPoint, recurrence);
};
exports.calculateNextExec = calculateNextExec;
const isSameRefinement = (userRefine, vendRefine) => {
    const userRefinement = Number(userRefine.match(/\d+/g));
    const vendRefinement = Number(vendRefine.match(/\d+/g));
    return userRefinement === vendRefinement;
};
exports.isSameRefinement = isSameRefinement;
const isItemAnEquip = (itemType, equipLocation) => {
    if (itemType === 'Card' || itemType === 'Etc' || equipLocation === '-')
        return false;
    return true;
};
exports.isItemAnEquip = isItemAnEquip;
const checkHashInHistory = (hash, hashesArr) => {
    if (hashesArr instanceof firestore_1.QuerySnapshot)
        return hashesArr.docs.some((scrape) => {
            const data = scrape.data();
            return data.hash && data.hash === hash;
        });
    return hashesArr.some((scrape) => {
        if (typeof scrape === 'string')
            return scrape === hash;
        return scrape.hash && scrape.hash === hash;
    });
};
exports.checkHashInHistory = checkHashInHistory;
const vendsNotInHistory = (vend1, history) => {
    return vend1.reduce((prev, curr) => {
        const { hash } = curr;
        const checkedHash = hash ? hash : (0, exports.calculateVendHash)(curr);
        const isIn = (0, exports.checkHashInHistory)(checkedHash, history);
        if (!isIn)
            prev.push(curr);
        return prev;
    }, []);
};
exports.vendsNotInHistory = vendsNotInHistory;
