"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotInWatchlistMsg = exports.getNoPermissionMsg = exports.getItemNotOnListMsg = exports.getMaxListSizeMsg = exports.getInvalidMaxPriceMsg = exports.getInvalidPriceFormatMsg = void 0;
const getInvalidPriceFormatMsg = () => {
    return 'Invalid threshold. Please us the correct format. Example: `250m` or `1.5k` or `1500`';
};
exports.getInvalidPriceFormatMsg = getInvalidPriceFormatMsg;
const getInvalidMaxPriceMsg = () => {
    return 'Invalid threshold. Please input a threshold less than `2b`';
};
exports.getInvalidMaxPriceMsg = getInvalidMaxPriceMsg;
const printAppUserList = (list) => {
    if (!list || Object.keys(list).length === 0)
        return 'Empty List';
    let str = '';
    for (const [key, value] of Object.entries(list)) {
        str += `\n${key}: ${value.itemName}`;
    }
    return str;
};
const getMaxListSizeMsg = (itemID, itemName = '', list) => {
    let str = `\nFailed to add: [${itemID}: ${itemName}]. \nYour list is full. Please remove an item from your list:`;
    if (!list)
        return str;
    str += '```';
    str += printAppUserList(list);
    str += '```';
    str += `Total of ${Object.keys(list).length} out of ${process.env.MAX_LIST_SIZE}.`;
    return str;
};
exports.getMaxListSizeMsg = getMaxListSizeMsg;
const getItemNotOnListMsg = (itemID, list) => {
    let str = `\nFailed to remove: [${itemID}]. ItemID is not in the list:\n`;
    if (!list)
        return str;
    str += '```';
    str += printAppUserList(list);
    str += '```';
    str += `Total of ${Object.keys(list).length} out of ${process.env.MAX_LIST_SIZE}.`;
    return str;
};
exports.getItemNotOnListMsg = getItemNotOnListMsg;
const getNoPermissionMsg = () => {
    return '```You do not have enough permission to use this command. Please contact an administrator if you need help.```';
};
exports.getNoPermissionMsg = getNoPermissionMsg;
const getNotInWatchlistMsg = (itemID) => {
    return `[ItemID:\`${itemID}\`] is not in the watch list.`;
};
exports.getNotInWatchlistMsg = getNotInWatchlistMsg;
