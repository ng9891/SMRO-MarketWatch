import {SlashCommandBuilder} from '@discordjs/builders';
import {Command} from '../../ts/interfaces/Command';
import {getHelpMsg} from '../responses/valid.response';

export const help: Command = {
  data: new SlashCommandBuilder().setName('help').setDescription('Bot description.'),
  run: async () => {
    return getHelpMsg();
  },
};
