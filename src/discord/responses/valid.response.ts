import {AppUser} from '../../ts/interfaces/AppUser';
import {Watchlist} from '../../ts/interfaces/Watchlist';
import {MessageEmbed} from 'discord.js';
import {table} from 'table';
import {formatDistanceToNow, fromUnixTime} from 'date-fns';
import {formatPrice} from '../../helpers/helpers';
import {List} from '../../ts/interfaces/List';
import {ListKey} from '../../ts/types/ListKey';

export const getDefaultEmbed = (status: string, wl: Watchlist, list: AppUser['list'] = {}) => {
  const {itemID, itemName: name, nextOn} = wl;
  const id = itemID as ListKey;
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
    listStr += `\n **${key}**: ${refineStr}${value.itemName}`;
  }

  const embed = new MessageEmbed()
    .setTitle(`${itemID}: ${refinement}${name}`)
    .setURL(`${process.env.ITEM_URL as string}${itemID}`)
    .setThumbnail(`${process.env.THUMBNAIL_URL}${itemID}.png`)
    .addFields(
      {name: 'Action', value: `**${status}**`},
      {name: 'Price Threshold', value: threshold.toLocaleString('en-US') + ' z'},
      {
        name: `Your list of ${listSize}/${maxListSize} (${maxListSize - listSize} left):`,
        value: listStr,
      },
      {
        name: 'Next Check is going to be:',
        value: formatDistanceToNow(fromUnixTime(nextOn), {addSuffix: true}),
      }
    );

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
    const {itemName, threshold, timestamp} = value;
    data.push([key, itemName, formatPrice(threshold), formatDistanceToNow(fromUnixTime(timestamp))]);
  }
  return table(data, tableConfig);
};

export const getListingMsg = (user: AppUser) => {
  const header = ['ID', 'Name', '<$', 'Added'];
  const table = getListAsTable(user.list, header);
  if (!user.list) return 'List is empty.';
  const len = Object.keys(user.list).length;
  const sizeStr = `Total of ${len} out of ${process.env.MAX_LIST_SIZE}.`;

  return `[${user.userName}]'s list.\`\`\`${table}${sizeStr}\`\`\``;
};

export const getRecurrenceUpdateMsg = (wl: Watchlist) => {
  const {itemID, itemName, recurrence, subs} = wl;
  return `\`\`\`Updated [${itemID}:${itemName}] with [${subs || 0} sub(s)] to check every ${recurrence} min.\`\`\``;
};

export const getHelpMsg = () => {
  return "```The purpose of this Bot is to notify users of a sale/deal in the SMRO market. Players can focus on playing (or not to play) the game and won't have to worry about missing a deal for an item they want to buy ever!```";
};
