import {AppUser} from '../../ts/interfaces/AppUser';
import {Watchlist} from '../../ts/interfaces/Watchlist';
import {MessageEmbed} from 'discord.js';
import {formatDistanceToNow, fromUnixTime} from 'date-fns';

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
