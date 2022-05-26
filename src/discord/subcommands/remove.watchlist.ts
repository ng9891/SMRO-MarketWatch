import {Subcommand} from '../../ts/interfaces/Subcommand';
import {SlashCommandSubcommandBuilder} from '@discordjs/builders';
import {getUserInfo, setUserInfo} from '../../db/actions/users.action';
import {listKey} from '../../ts/interfaces/AppUser';
import {getWatchListInfo, unSub} from '../../db/actions/watchlist.action';
import {getDefaultEmbed} from '../responses/valid.response';
import {getItemNotOnListMsg} from '../responses/invalid.response';

export const remove: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName('remove')
    .setDescription('Remove an item from the watchlist.')
    .addIntegerOption((option) =>
      option.setName('itemid').setDescription('Item ID to remove from watchlist').setRequired(true)
    ),
  run: async (interaction) => {
    try {
      await interaction.deferReply();
      const userID = interaction.user.id;
      const userName = interaction.user.username;
      const itemID = interaction.options.getInteger('itemid', true).toString();

      const user = await getUserInfo(userID, userName);
      const id = itemID as listKey;

      const list = user.list ? user.list : undefined;
      if (!list) throw new Error(getItemNotOnListMsg(itemID, list));

      const {[id]: delItem, ...rest} = list;
      if (!delItem) throw new Error(getItemNotOnListMsg(itemID, list));

      const newUser = Object.assign(user, {list: rest});
      await setUserInfo(newUser);
      await unSub(itemID, userID);

      const wl = await getWatchListInfo(itemID);
      if (!wl) throw new Error('Error. Deleted an item not on the Watchlist.');

      const resp = getDefaultEmbed('REMOVE', wl, list);
      await interaction.editReply({embeds: [resp]});
    } catch (error) {
      const err = error as Error;
      await interaction.editReply(err.message);
    }
  },
};
