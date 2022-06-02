import {Interaction, AutocompleteInteraction} from 'discord.js';
import CommandList from '../commands/_CommandList';
import {itemQuery} from '../autocomplete/itemQuery.autocomplete';
import {serverQuery} from '../autocomplete/serverQuery.autocomplete';

export const onInteraction = async (interaction: Interaction) => {
  if (interaction.isAutocomplete()) {
    const autoIteraction = interaction as AutocompleteInteraction;
    if (autoIteraction.commandName === 'watchlist') {
      const focusedOption = autoIteraction.options.getFocused(true);
      console.log(focusedOption.name);
      if (focusedOption.name === 'item-query') return await itemQuery(autoIteraction);
      if (focusedOption.name === 'server') return await serverQuery(autoIteraction);
    }
    return;
  }

  if (!interaction.isCommand()) return;
  for (const Command of CommandList) {
    if (interaction.commandName === Command.data.name) {
      try {
        const resp = await Command.run(interaction);
        if (resp) {
          if (interaction.deferred) await interaction.editReply(resp);
          else await interaction.reply(resp);
        }
      } catch (error) {
        const err = error as Error;
        console.log(err);
        if (interaction.deferred) await interaction.editReply(err.message);
        else await interaction.reply(err.message);
      }
    }
  }
};
