import {AppUser} from '../../ts/interfaces/AppUser';
import {Watchlist} from '../../ts/interfaces/Watchlist';
import {MessageEmbed, MessageActionRow, MessageOptions} from 'discord.js';
import {table} from 'table';
import {formatDistanceToNow, fromUnixTime, getUnixTime} from 'date-fns';
import {formatPrice} from '../../helpers/helpers';
import {List} from '../../ts/interfaces/List';
import {ListKey} from '../../ts/types/ListKey';
import {VendInfo} from '../../ts/interfaces/VendInfo';
import {listingSelectMenu} from '../select/listing.select';

export const getDefaultEmbed = (status: string, wl: Watchlist, user: AppUser): MessageEmbed => {
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

export const getListAsTable = (list: {[key: string]: List} | undefined, header: string[]): string => {
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

export const getListingMsg = (user: AppUser): string => {
  const header = ['SV', 'ID', 'Name', '<$', 'Added'];
  const table = getListAsTable(user.list, header);
  if (!user.list) return 'List is empty.';
  const len = Object.keys(user.list).length;
  const sizeStr = `Total of ${len} out of ${process.env.MAX_LIST_SIZE}.`;

  return `\`[${user.userName}#${user.discriminator}]\`'s list.\n\`\`\`${table}${sizeStr}\`\`\``;
};

export const getRecurrenceMsg = (
  jobs: {itemID: string; itemName: string; subs: string; recurrence: number; nextOn: string; server: string}[]
): string => {
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
  const {itemID, itemName, recurrence, subs, server, setByName} = wl;
  return `\`\`\`${setByName} updated [${itemID}:${itemName}] in [${server}] with [${
    subs || 0
  } sub(s)] to check every ${recurrence} min.\`\`\``;
};

export const getHelpMsg = (): string => {
  return "```The purpose of this Bot is to notify users of a sale/deal in the SMRO market. Players can focus on playing (or not to play) the game and won't have to worry about missing a deal for an item they want to buy ever!```";
};

export const getNotificationMsg = (
  userID: string,
  threshold: number,
  vends: VendInfo[],
  isEquip: boolean,
  refine: undefined | null | string = ''
) => {
  // Header
  const data: Array<string[]> = [];
  data.push(isEquip ? ['ID', 'Price', '+', 'Card', 'E1', 'E2', 'E3'] : ['ID', 'Price', 'Amount']);

  for (const vend of vends) {
    if (isEquip) {
      const {shopID, price, refinement, card0, card1, card2, card3} = vend;
      data.push([shopID, formatPrice(price), refinement, card0, card1, card2, card3]);
    } else {
      const {shopID, price, amount} = vend;
      data.push([shopID, formatPrice(price), amount + '']);
    }
  }
  const {itemID, itemName, server} = vends[0];
  const date = new Date();
  const url = server === 'HEL' ? process.env.URL_HEL + itemID : process.env.URL_NIF + encodeURIComponent(itemName);
  const listing = `\`\`\`${table(data, tableConfig)}\`\`\``;

  const embed = new MessageEmbed().setTitle(`${itemID}: ${itemName}`).setURL(url).setTimestamp(date);

  if (isEquip && refine) embed.addField('Refinement', refine);

  embed.addFields(
    {name: 'Server', value: server},
    {name: 'Threshold', value: formatPrice(threshold)},
    {name: 'Listing', value: listing},
    {name: 'In-game command', value: `@ws ${itemID}`},
    {name: 'Timestamp', value: `${getUnixTime(date)}`}
  );

  const selectMenu = new MessageActionRow().addComponents(listingSelectMenu);
  return {content: `<@${userID}>`, embeds: [embed], components: [selectMenu]} as MessageOptions;
};
