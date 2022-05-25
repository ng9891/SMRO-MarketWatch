import {AppUser} from '../../ts/interfaces/AppUser';
import {Watchlist} from '../../ts/interfaces/Watchlist';
import {MessageEmbed} from 'discord.js';
import {table} from 'table';
import {formatDistanceToNow, fromUnixTime} from 'date-fns';
import {formatPrice} from '../../helpers/helpers';
import {List} from '../../ts/interfaces/List';

export const getDefaultEmbed = (status: string, wl: Watchlist, list: AppUser['list'] = {}) => {
  const {itemID, itemName: name, nextOn} = wl;
  const threshold = list[itemID]?.threshold ? list[itemID].threshold : 0;
  const refinement = list[itemID]?.refinement ? list[itemID].refinement : '';
  const listSize = Object.keys(list).length;
  const maxListSize = Number(process.env.MAX_LIST_SIZE);

  let listStr = '';
  for (const [key, value] of Object.entries(list)) {
    const refineStr = refinement ? `+${refinement} ` : '';
    listStr += `\n **${key}**: ${refineStr}${value.itemName}`;
  }

  const embed = new MessageEmbed()
    .setTitle(`${itemID}: ${name}`)
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

export const getListAsTable = (list: {[key: string]: List} | undefined) => {
  if (!list) return 'List is empty.';
  const data = [['ID', 'Name', '$', 'Added']];
  for (const [key, value] of Object.entries(list)) {
    const {itemName, threshold, timestamp} = value;
    data.push([key, itemName, formatPrice(threshold), formatDistanceToNow(fromUnixTime(timestamp))]);
  }
  return table(data, tableConfig);
};

export const getListingMsg = (user: AppUser) => {
  const table = getListAsTable(user.list);
  if (!user.list) return 'List is empty.';
  const len = Object.keys(user.list).length;
  const sizeStr = `Total of ${len} out of ${process.env.MAX_LIST_SIZE}.`;

  return `${user.userName}'s list.\`\`\`${table}${sizeStr}\`\`\``;
};
