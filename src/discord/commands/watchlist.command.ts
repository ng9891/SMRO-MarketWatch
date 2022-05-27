import {SlashCommandBuilder} from '@discordjs/builders';
import {Command} from '../../ts/interfaces/Command';
import {add} from '../subcommands/add.watchlist';
import {remove} from '../subcommands/remove.watchlist';
import {recurrence} from '../subcommands/recurrence.watchlist';
import {list} from '../subcommands/list.watchlist';

export const watchlist: Command = {
  data: new SlashCommandBuilder()
    .setName('watchlist')
    .setDescription('Manage watchlist')
    .addSubcommand(add.data)
    .addSubcommand(remove.data)
    .addSubcommand(recurrence.data)
    .addSubcommand(list.data),
  run: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
      case 'add': {
        return await add.run(interaction);
      }
      case 'remove': {
        return await remove.run(interaction);
      }
      case 'recurrence': {
        return await recurrence.run(interaction);
      }
      case 'list': {
        return await list.run(interaction);
      }
      default: {
        return 'Command not found.';
      }
    }
  },
};
