import {Interaction} from 'discord.js';
import CommandList from '../commands/_CommandList';
import {itemQuery} from '../autocomplete/itemQuery.autocomplete';
import {btnIDArr, changeThreshold} from '../button/threshold.button';
import {serverQuery} from '../autocomplete/serverQuery.autocomplete';
import {listingSelectMenu, listingRun} from '../select/listing.select';

export const onInteraction = async (interaction: Interaction) => {
  if (interaction.isAutocomplete()) {
    if (interaction.commandName === 'watchlist') {
      const focusedOption = interaction.options.getFocused(true);
      if (focusedOption.name === 'item-query') return await itemQuery(interaction);
      if (focusedOption.name === 'server') return await serverQuery(interaction);
    }
  }

  if (interaction.isButton()) {
    for (const id of btnIDArr) {
      if (interaction.customId === id) {
        await changeThreshold(interaction);
        break;
      }
    }
    return;
  }

  if (interaction.isSelectMenu()) {
    if (interaction.customId === listingSelectMenu.customId) await listingRun(interaction);
    return;
  }

  if (!interaction.isCommand()) return;
  try {
    for (const Command of CommandList) {
      if (interaction.commandName === Command.data.name) {
        const resp = await Command.run(interaction);
        if (resp) {
          interaction.deferred ? await interaction.editReply(resp) : await interaction.reply(resp);
        }
        break;
      }
    }
  } catch (error) {
    console.error(error);
    console.trace('trace' + error);
    if (error instanceof Error) {
      if (interaction.deferred) await interaction.editReply(error.message);
      else await interaction.reply(error.message);
    }
  }
};
