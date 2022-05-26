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
        await add.run(interaction);
        break;
      }
      case 'remove': {
        await remove.run(interaction);
        break;
      }
      case 'recurrence': {
        await recurrence.run(interaction);
        break;
      }
      case 'list': {
        await list.run(interaction);
        break;
      }
      default: {
        await interaction.reply('Command not found.');
      }
    }
  },
};
