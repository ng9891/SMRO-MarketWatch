import {SlashCommandBuilder} from '@discordjs/builders';
import {Command} from '../../ts/interfaces/Command';
import {add} from '../subcommands/add.watchlist';
import {remove} from '../subcommands/remove.watchlist';
import {recurrenceUpdate} from '../subcommands/recurrence.update.watchlist';
import {recurrenceList} from '../subcommands/recurrence.list.watchlist';
import {list} from '../subcommands/list.watchlist';

export const watchlist: Command = {
  data: new SlashCommandBuilder()
    .setName('watchlist')
    .setDescription('Manage watchlist')
    .addSubcommand(add.data)
    .addSubcommand(remove.data)
    .addSubcommand(list.data)
    .addSubcommandGroup((group) =>
      group
        .setName('recurrence')
        .setDescription('recurrency')
        .addSubcommand(recurrenceUpdate.data)
        .addSubcommand(recurrenceList.data)
    ),
  run: async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const isRecurrenceGroup = interaction.options.getSubcommandGroup(false);
    if (isRecurrenceGroup) {
      switch (subcommand) {
        case 'update': {
          return await recurrenceUpdate.run(interaction);
        }
        case 'list': {
          return await recurrenceList.run(interaction);
        }
        default: {
          return 'Command not found.';
        }
      }
    }

    switch (subcommand) {
      case 'add': {
        return await add.run(interaction);
      }
      case 'remove': {
        return await remove.run(interaction);
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
