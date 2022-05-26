import {Subcommand} from '../../ts/interfaces/Subcommand';
import {SlashCommandSubcommandBuilder} from '@discordjs/builders';
import {getUserInfo, setUserInfo} from '../../db/actions/users.action';
import {getListingMsg} from '../responses/valid.response';

export const list: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName('list')
    .setDescription('Display the watchlist of a user.')
    .addUserOption((option) => option.setName('user').setDescription('Optional. Specify the user.')),
  run: async (interaction) => {
    await interaction.deferReply();
    const mention = interaction.options.getUser('user');
    const userID = mention && !mention.bot ? mention.id : interaction.user.id;
    const userName = mention && !mention.bot ? mention.username : interaction.user.username;

    try {
      const user = await getUserInfo(userID, userName);
      const resp = getListingMsg(user);
      await interaction.editReply(resp);
    } catch (error) {
      const err = error as Error;
      await interaction.editReply(err.message);
    }
  },
};
