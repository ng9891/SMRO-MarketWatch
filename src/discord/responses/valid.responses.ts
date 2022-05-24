import {Scrape} from '../../interfaces/Scrape';
import {AppUser} from '../../interfaces/AppUser';
import {MessageEmbed} from 'discord.js';

export const getDefaultEmbed = (status: string, {listSize = 0, threshold}: AppUser, {itemID, name}: Scrape) => {
  const maxListSize = Number(process.env.MAX_LIST_SIZE);

  const embed = new MessageEmbed()
    .setTitle(`${itemID}: ${name}`)
    .setURL(`${process.env.ITEM_URL as string}${itemID}`)
    .setThumbnail(`${process.env.THUMBNAIL_URL}${itemID}.png`)
    .addFields(
      {name: 'ID', value: itemID.toString()},
      {name: 'Action', value: `**${status}**`},
      {name: 'Price Threshold', value: threshold.toLocaleString('en-US') + ' z'},
      {
        name: `Your list ${listSize}/${maxListSize} (${maxListSize - listSize} left):`,
        value: `
        **1234**: This nuts,
        **456**: Another nut,
        **789**: lorem lorem lorem lorem lorem lorem lorem,
        **147**: lorem,
        **789**: lorem,
        **147**: lorem,
        **789**: lorem,
        **147**: lorem,
        **789**: lorem,
        **147**: lorem,
        `,
      },
      {
        name: 'Next Check is going to be in:',
        value: `TODO min`,
      }
    );

  return embed;
};
