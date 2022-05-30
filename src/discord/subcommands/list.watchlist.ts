import {Subcommand} from '../../ts/interfaces/Subcommand';
import {SlashCommandSubcommandBuilder} from '@discordjs/builders';
import {getUserInfo} from '../../db/actions/users.action';
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
    const discriminator = mention && !mention.bot ? mention.discriminator : interaction.user.discriminator;

    const user = await getUserInfo(userID, userName, discriminator);
    await interaction.editReply(getListingMsg(user));
  },
};
