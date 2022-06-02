"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationMsg = exports.getHelpMsg = exports.getRecurrenceUpdateMsg = exports.getRecurrenceMsg = exports.getListingMsg = exports.getListAsTable = exports.getDefaultEmbed = void 0;
const discord_js_1 = require("discord.js");
const table_1 = require("table");
const date_fns_1 = require("date-fns");
const helpers_1 = require("../../helpers/helpers");
const getDefaultEmbed = (status, wl, user) => {
    const { itemID, itemName: name, nextOn, server } = wl;
    const id = (server + itemID);
    const list = (user === null || user === void 0 ? void 0 : user.list) || {};
    const _a = list, _b = id, item = _a[_b], rest = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
    const threshold = item ? item.threshold : 0;
    const refinement = (item === null || item === void 0 ? void 0 : item.refinement) ? `+${item.refinement} ` : '';
    const newList = status === 'REMOVE' ? rest : list;
    const listSize = Object.keys(newList).length;
    const maxListSize = Number(process.env.MAX_LIST_SIZE);
    let listStr = 'Empty list';
    if (listSize > 0)
        listStr = '';
    for (const [key, value] of Object.entries(newList)) {
        const refineStr = value.refinement ? `+${value.refinement} ` : '';
        listStr += `\n ${value.server} | **${value.itemID}**: ${refineStr}${value.itemName}`;
    }
    const url = server === 'HEL' ? process.env.URL_HEL + itemID : process.env.URL_NIF + encodeURIComponent(name);
    const embed = new discord_js_1.MessageEmbed()
        .setTitle(`${itemID}: ${refinement}${name}`)
        .setURL(`${url}`)
        .setThumbnail(`${process.env.THUMBNAIL_URL}${itemID}.png`)
        .addFields({ name: 'Action', value: `**${status}**` }, { name: 'Server', value: `**${server}**` }, { name: 'Price Threshold', value: threshold.toLocaleString('en-US') + ' z' }, {
        name: `Your list of ${listSize}/${maxListSize} (${maxListSize - listSize} left):`,
        value: listStr,
    }, {
        name: 'Next Check is going to be:',
        value: (0, date_fns_1.formatDistanceToNow)((0, date_fns_1.fromUnixTime)(nextOn), { addSuffix: true }),
    })
        .setFooter({ text: `By: ${user.userName}#${user.discriminator}` })
        .setTimestamp(new Date());
    return embed;
};
exports.getDefaultEmbed = getDefaultEmbed;
const tableConfig = {
    border: {
        topBody: `─`,
        topJoin: `┬`,
        topLeft: `┌`,
        topRight: `┐`,
        bottomBody: `─`,
        bottomJoin: `┴`,
        bottomLeft: `└`,
        bottomRight: `┘`,
        bodyLeft: `│`,
        bodyRight: `│`,
        bodyJoin: `│`,
        joinBody: `─`,
        joinLeft: `├`,
        joinRight: `┤`,
        joinJoin: `┼`,
    },
    singleLine: true,
};
const getListAsTable = (list, header) => {
    if (!list)
        return 'List is empty.';
    const data = [header];
    for (const [key, value] of Object.entries(list)) {
        const { itemID, itemName, threshold, timestamp, refinement, server } = value;
        const refine = !refinement || refinement === '-' ? '' : `+${refinement} `;
        const added = (0, date_fns_1.formatDistanceToNow)((0, date_fns_1.fromUnixTime)(timestamp));
        data.push([server, itemID, `${refine}${itemName}`, (0, helpers_1.formatPrice)(threshold), added]);
    }
    return (0, table_1.table)(data, tableConfig);
};
exports.getListAsTable = getListAsTable;
const getListingMsg = (user) => {
    const header = ['SV', 'ID', 'Name', '<$', 'Added'];
    const table = (0, exports.getListAsTable)(user.list, header);
    if (!user.list)
        return 'List is empty.';
    const len = Object.keys(user.list).length;
    const sizeStr = `Total of ${len} out of ${process.env.MAX_LIST_SIZE}.`;
    return `[\`${user.userName}]\`'s list.\n\`\`\`${table}${sizeStr}\`\`\``;
};
exports.getListingMsg = getListingMsg;
const getRecurrenceMsg = (jobs) => {
    let resp = '```';
    const data = [['SV', 'ID', 'Name', 'Recur', 'Next in', 'Sub']];
    jobs.forEach((job) => {
        data.push([job.server, job.itemID, job.itemName, `${job.recurrence}min`, job.nextOn, job.subs]);
    });
    const tab = (0, table_1.table)(data, tableConfig);
    resp += `${tab}Total of ${jobs.length} job(s).`;
    resp += '```';
    return resp;
};
exports.getRecurrenceMsg = getRecurrenceMsg;
const getRecurrenceUpdateMsg = (wl) => {
    const { itemID, itemName, recurrence, subs, server } = wl;
    return `\`\`\`Updated [${itemID}:${itemName}] in [${server}] with [${subs || 0} sub(s)] to check every ${recurrence} min.\`\`\``;
};
exports.getRecurrenceUpdateMsg = getRecurrenceUpdateMsg;
const getHelpMsg = () => {
    return "```The purpose of this Bot is to notify users of a sale/deal in the SMRO market. Players can focus on playing (or not to play) the game and won't have to worry about missing a deal for an item they want to buy ever!```";
};
exports.getHelpMsg = getHelpMsg;
const getNotificationMsg = (userID, vends, server, isEquip) => {
    const data = [];
    // Header
    data.push(isEquip ? ['ID', 'Price', '+', 'Card', 'E1', 'E2', 'E3'] : ['ID', 'Price', 'Amount']);
    for (const vend of vends) {
        if (isEquip) {
            const { shopID, price, refinement, card0, card1, card2, card3 } = vend;
            data.push([shopID, (0, helpers_1.formatPrice)(price), refinement, card0, card1, card2, card3]);
        }
        else {
            const { shopID, price, amount } = vend;
            data.push([shopID, (0, helpers_1.formatPrice)(price), amount]);
        }
    }
    const { itemID, itemName } = vends[0];
    const tab = (0, table_1.table)(data, tableConfig);
    const msg = `<@${userID}>\nNEW LISTING:\n\`\`\`${server} | ${itemID}:${itemName}\n${tab}@ws ${itemID}\`\`\``;
    return msg;
};
exports.getNotificationMsg = getNotificationMsg;
