import {Command} from '../../interfaces/Command';
import {Scrape} from '../../interfaces/Scrape';
import {AppUser} from '../../interfaces/AppUser';
import {SlashCommandBuilder} from '@discordjs/builders';
import {addSub} from '../../db/actions/watchlist.action';
import {parsePriceString} from '../../helpers/helpers';
import {getInvalidPriceFormatMsg, getInvalidMaxPriceMsg} from '../responses/invalid.responses';
import {getDefaultEmbed} from '../responses/valid.responses';

export const add: Command = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Adds an Item ID to the watchlist.')
    .addIntegerOption((option) =>
      option.setName('item-id').setDescription('ID of the Item. e.g 6635').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('threshold').setDescription('Price threshold for notifications. e.g 250m').setRequired(true)
    ),
  run: async (interaction) => {
    await interaction.deferReply();
    const userID = interaction.user.id;
    const itemID = interaction.options.getInteger('item-id', true).toString();
    const threshold = interaction.options.getString('threshold', true);

    const validPrice = parsePriceString(threshold);
    if (!validPrice) {
      const resp = getInvalidPriceFormatMsg();
      await interaction.editReply(resp);
      return;
    }
    const maxThreshold = Number(process.env.MAX_THRESHOLD);
    if (validPrice >= maxThreshold) {
      const resp = getInvalidMaxPriceMsg();
      await interaction.editReply(resp);
      return;
    }

    try {
      // TODO: check for itemid
      const user = {userID, threshold: validPrice, listSize: 0} as AppUser;
      const scrape = {itemID, name: 'test'} as Scrape;

      const added = addSub(userID, itemID, validPrice);

      const embed = getDefaultEmbed('ADD', user, scrape);
      await interaction.editReply({embeds: [embed]});
    } catch (error) {
      const err = error as Error;
      await interaction.editReply(err.message);
    }
  },
};
