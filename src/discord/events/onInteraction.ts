import {Interaction} from 'discord.js';
import CommandList from '../commands/_CommandList';

export const onInteraction = async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  for (const Command of CommandList) {
    if (interaction.commandName === Command.data.name) {
      try {
        await interaction.deferReply();
        const resp = await Command.run(interaction);
        if (resp) await interaction.editReply(resp);
        break;
      } catch (error) {
        const err = error as Error;
        console.log(err);
        await interaction.editReply(err.message);
      }
    }
  }
};
