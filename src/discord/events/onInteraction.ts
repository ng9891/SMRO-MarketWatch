import {Interaction} from 'discord.js';
import CommandList from '../commands/_CommandList';

export const onInteraction = async (interaction: Interaction) => {
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
