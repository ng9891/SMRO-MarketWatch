import {Subcommand} from '../../ts/interfaces/Subcommand';
import {SlashCommandSubcommandBuilder} from '@discordjs/builders';
import {getUserInfo, setUserInfo} from '../../db/actions/users.action';
import {ListKey} from '../../ts/types/ListKey';
import {ServerName} from '../../ts/types/ServerName';
import {getWatchListInfo, unSub} from '../../db/actions/watchlist.action';
import {getDefaultEmbed} from '../responses/valid.response';
import {getItemNotOnListMsg, getSelectFromAutocompleteMsg} from '../responses/invalid.response';
import Scheduler from '../../scheduler/Scheduler';

export const remove: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName('remove')
    .setDescription('Remove an item from the watchlist.')
    .addStringOption((option) =>
      option
        .setName('server')
        .setDescription('Decide which server to put the watchlist')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option.setName('item-query').setDescription('Find the item.').setRequired(true).setAutocomplete(true)
    ),
  run: async (interaction) => {
    await interaction.deferReply();
    const userID = interaction.user.id;
    const userName = interaction.user.username;
    const discriminator = interaction.user.discriminator;

    const query = interaction.options.getString('item-query');
    if (!query) return getSelectFromAutocompleteMsg();
    const [itemID, itemName] = query.split('=');
    if (!itemID || !itemName) return getSelectFromAutocompleteMsg();

    const serverQuery = interaction.options.getString('server');
    if (!serverQuery) return getSelectFromAutocompleteMsg();
    const server = serverQuery as ServerName;

    const user = await getUserInfo(userID, userName, discriminator);
    const id = itemID as ListKey;

    const list = user.list ? user.list : undefined;
    if (!list) return getItemNotOnListMsg(itemID, list);

    const {[server + id]: delItem, ...rest} = list;
    if (!delItem) return getItemNotOnListMsg(itemID, list);
    const newUser = Object.assign({...user}, {list: rest});
    await setUserInfo(newUser);
    await unSub(itemID, userID, server);

    const wl = await getWatchListInfo(itemID, server);
    if (!wl) return 'Error. Deleted an item not in the Watchlist.';
    if (!wl?.subs || wl.subs === 0) Scheduler.cancelJob(itemID, server);

    const resp = getDefaultEmbed('REMOVE', wl, user);
    await interaction.editReply({embeds: [resp]});
  },
};
