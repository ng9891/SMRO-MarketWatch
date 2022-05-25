import {Subcommand} from '../../ts/interfaces/Subcommand';
import {SlashCommandSubcommandBuilder} from '@discordjs/builders';

export const remove: Subcommand = {
  data: new SlashCommandSubcommandBuilder().setName('delete').setDescription('Delete an item from the watchlist.'),
  run: async (interaction) => {
    await interaction.deferReply();

    await interaction.editReply('');
  },
};
