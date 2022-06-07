import {MessageSelectMenu, SelectMenuInteraction, MessageActionRow, MessageButton} from 'discord.js';
import {remove} from '../subcommands/remove.watchlist';
import {parseListingEmbed, parsePriceString} from '../../helpers/helpers';
import {generateThresholdBtn} from '../button/threshold.button';

export const listingSelectMenu = new MessageSelectMenu()
  .setCustomId('listing')
  .setPlaceholder('Nothing selected')
  .setMinValues(1)
  .setMaxValues(1)
  .addOptions([
    {
      label: 'Update Item Threshold',
      description: 'Gives you a series of threshold options to choose from',
      value: 'update',
    },
    {
      label: 'Remove Item',
      description: 'Remove from your watchlist',
      value: 'remove',
    },
    {
      label: 'None',
      description: 'Erase this manu',
      value: 'none',
    },
  ]);

export const listingRun = async (interaction: SelectMenuInteraction) => {
  const requestUserID = interaction.user.id;
  const author = interaction.message.content;
  const authorID = author.slice(2, author.length - 1);
  if (requestUserID !== authorID)
    return await interaction.reply({content: 'Sorry. You cannot interract with this listing', ephemeral: true});

  await interaction.deferUpdate();

  const selected = interaction.values[0];
  const {threshold} = parseListingEmbed(interaction);
  if (!threshold) {
    await interaction.editReply({components: []});
    return await interaction.followUp('Sorry. Could not find Embed information.');
  }

  const thresh = parsePriceString(threshold);
  if (!thresh) {
    await interaction.editReply({components: []});
    return await interaction.followUp('Sorry. Could not find threshold information.');
  }

  switch (selected) {
    case 'remove': {
      await remove.run(interaction);
      await interaction.editReply({components: []});
      break;
    }
    case 'update': {
      const btns = generateThresholdBtn(thresh);
      const maxItemPerRow = 5;

      let rowBtn = [] as MessageButton[];
      let count = 0;
      const actionRows = [] as MessageActionRow[];
      btns.forEach((btn, idx) => {
        if (count === maxItemPerRow) {
          const action = new MessageActionRow().addComponents(rowBtn);
          actionRows.push(action);
          count = 0;
          rowBtn = [];
        }
        rowBtn.push(btn);
        if (idx === btns.length - 1) {
          const action = new MessageActionRow().addComponents(rowBtn);
          actionRows.push(action);
        }
        count += 1;
      });
      await interaction.editReply({components: actionRows});
      break;
    }
    default: {
      await interaction.editReply({components: []});
    }
  }
};
