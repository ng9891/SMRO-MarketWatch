import {Command} from '../../ts/interfaces/Command';
import {SlashCommandBuilder} from '@discordjs/builders';
import {getUserInfo, setUserInfo} from '../../db/actions/users.action';
import {getListingMsg} from '../responses/valid.responses';

export const list: Command = {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('Get tracking list')
    .addUserOption((option) => option.setName('user').setDescription('Specifying the user. Optional')),
  run: async (interaction) => {
    await interaction.deferReply();
    const mention = interaction.options.getUser('user');
    const userID = mention && !mention.bot ? mention.id : interaction.user.id;
    const userName = mention && !mention.bot ? mention.username : interaction.user.username;

    try {
      const user = await getUserInfo(userID);
      const newUser = user ? user : await setUserInfo({userID, userName});

      const resp = getListingMsg(newUser);
      await interaction.editReply(resp);
    } catch (error) {
      const err = error as Error;
      await interaction.editReply(err.message);
    }
  },
};
