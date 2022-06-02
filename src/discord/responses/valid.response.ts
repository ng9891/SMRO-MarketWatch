import {AppUser} from '../../ts/interfaces/AppUser';
import {Watchlist} from '../../ts/interfaces/Watchlist';
import {MessageEmbed} from 'discord.js';
import {table} from 'table';
import {formatDistanceToNow, fromUnixTime} from 'date-fns';
import {formatPrice} from '../../helpers/helpers';
import {List} from '../../ts/interfaces/List';
import {ListKey} from '../../ts/types/ListKey';
import {VendInfo} from '../../ts/interfaces/VendInfo';
import {ServerName} from '../../ts/types/ServerName';

export const getDefaultEmbed = (status: string, wl: Watchlist, user: AppUser) => {
  const {itemID, itemName: name, nextOn, server} = wl;
  const id = (server + itemID) as ListKey;
  const list = user?.list || {};
  const {[id]: item, ...rest} = list;
  const threshold = item ? item.threshold : 0;
  const refinement = item?.refinement ? `+${item.refinement} ` : '';

  const newList = status === 'REMOVE' ? rest : list;

  const listSize = Object.keys(newList).length;
  const maxListSize = Number(process.env.MAX_LIST_SIZE);

  let listStr = 'Empty list';
  if (listSize > 0) listStr = '';
  for (const [key, value] of Object.entries(newList)) {
    const refineStr = value.refinement ? `+${value.refinement} ` : '';
    listStr += `\n ${value.server} | **${value.itemID}**: ${refineStr}${value.itemName}`;
  }

  const url = server === 'HEL' ? process.env.URL_HEL + itemID : process.env.URL_NIF + encodeURIComponent(name);

  const embed = new MessageEmbed()
    .setTitle(`${itemID}: ${refinement}${name}`)
    .setURL(`${url}`)
    .setThumbnail(`${process.env.THUMBNAIL_URL}${itemID}.png`)
    .addFields(
      {name: 'Action', value: `**${status}**`},
      {name: 'Server', value: `**${server}**`},
      {name: 'Price Threshold', value: threshold.toLocaleString('en-US') + ' z'},
      {
        name: `Your list of ${listSize}/${maxListSize} (${maxListSize - listSize} left):`,
        value: listStr,
      },
      {
        name: 'Next Check is going to be:',
        value: formatDistanceToNow(fromUnixTime(nextOn), {addSuffix: true}),
      }
    )
    .setFooter({text: `By: ${user.userName}#${user.discriminator}`})
    .setTimestamp(new Date());

  return embed;
};

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

export const getListAsTable = (list: {[key: string]: List} | undefined, header: string[]) => {
  if (!list) return 'List is empty.';
  const data = [header];
  for (const [key, value] of Object.entries(list)) {
    const {itemID, itemName, threshold, timestamp, refinement, server} = value;
    const refine = !refinement || refinement === '-' ? '' : `+${refinement} `;
    const added = formatDistanceToNow(fromUnixTime(timestamp));
    data.push([server, itemID, `${refine}${itemName}`, formatPrice(threshold), added]);
  }
  return table(data, tableConfig);
};

export const getListingMsg = (user: AppUser) => {
  const header = ['SV', 'ID', 'Name', '<$', 'Added'];
  const table = getListAsTable(user.list, header);
  if (!user.list) return 'List is empty.';
  const len = Object.keys(user.list).length;
  const sizeStr = `Total of ${len} out of ${process.env.MAX_LIST_SIZE}.`;

  return `[\`${user.userName}]\`'s list.\n\`\`\`${table}${sizeStr}\`\`\``;
};

export const getRecurrenceMsg = (
  jobs: {itemID: string; itemName: string; subs: string; recurrence: number; nextOn: string; server: string}[]
) => {
  let resp = '```';
  const data = [['SV', 'ID', 'Name', 'Recur', 'Next in', 'Sub']];
  jobs.forEach((job) => {
    data.push([job.server, job.itemID, job.itemName, `${job.recurrence}min`, job.nextOn, job.subs]);
  });
  const tab = table(data, tableConfig);
  resp += `${tab}Total of ${jobs.length} job(s).`;
  resp += '```';
  return resp;
};

export const getRecurrenceUpdateMsg = (wl: Watchlist) => {
  const {itemID, itemName, recurrence, subs, server} = wl;
  return `\`\`\`Updated [${itemID}:${itemName}] in [${server}] with [${
    subs || 0
  } sub(s)] to check every ${recurrence} min.\`\`\``;
};

export const getHelpMsg = () => {
  return "```The purpose of this Bot is to notify users of a sale/deal in the SMRO market. Players can focus on playing (or not to play) the game and won't have to worry about missing a deal for an item they want to buy ever!```";
};

export const getNotificationMsg = (userID: string, vends: VendInfo[], server: ServerName, isEquip: boolean) => {
  const data = [];
  // Header
  data.push(isEquip ? ['ID', 'Price', '+', 'Card', 'E1', 'E2', 'E3'] : ['ID', 'Price', 'Amount']);

  for (const vend of vends) {
    if (isEquip) {
      const {shopID, price, refinement, card0, card1, card2, card3} = vend;
      data.push([shopID, formatPrice(price), refinement, card0, card1, card2, card3]);
    } else {
      const {shopID, price, amount} = vend;
      data.push([shopID, formatPrice(price), amount]);
    }
  }
  const {itemID, itemName} = vends[0];
  const tab = table(data, tableConfig);
  const msg = `<@${userID}>\nNEW LISTING:\n\`\`\`${server} | ${itemID}:${itemName}\n${tab}@ws ${itemID}\`\`\``;
  return msg;
};
