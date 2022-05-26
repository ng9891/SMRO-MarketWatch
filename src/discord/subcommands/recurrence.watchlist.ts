import {Subcommand} from '../../ts/interfaces/Subcommand';
import {SlashCommandSubcommandBuilder} from '@discordjs/builders';
import {GuildMember, PermissionResolvable} from 'discord.js';
import {getWatchListInfo, updateWatchList, createNewWatchList} from '../../db/actions/watchlist.action';
import {getRecurrenceUpdateMsg} from '../responses/valid.response';
import {getNoPermissionMsg} from '../responses/invalid.response';
import scrapItemInfoByID from '../../scraper/scraper';

export const recurrence: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName('recurrence')
    .setDescription('Change the check recurrence of an item. **Must have permission!**')
    .addIntegerOption((option) =>
      option.setName('itemid').setDescription('The ID of the item you wish to change.').setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('recurrence').setDescription('New recurrence interval in minutes.').setRequired(true)
    ),
  run: async (interaction) => {
    await interaction.deferReply();
    const userID = interaction.user.id;
    const userName = interaction.user.username;
    const itemID = interaction.options.getInteger('itemid', true)?.toString();
    const recurrence = Math.abs(interaction.options.getInteger('recurrence', true));

    try {
      const member = interaction.member as GuildMember;
      const permission =
        (process.env.PERMISSION_TO_CHANGE_SCRAPE_TIME as PermissionResolvable) ||
        ('BAN_MEMBERS' as PermissionResolvable);
      if (!member.permissions.has(permission)) throw new Error(getNoPermissionMsg());

      let wl = await getWatchListInfo(itemID);
      if (!wl) {
        const itemInfo = await scrapItemInfoByID(itemID);
        wl = await createNewWatchList(recurrence, {userID, userName}, itemInfo);
      } else {
        wl = {...wl, setByID: userID, setByName: userName, recurrence};
      }

      await updateWatchList(wl);
      const resp = getRecurrenceUpdateMsg(wl);
      // TODO: set up job if subs > 0
      await interaction.editReply(resp);
    } catch (error) {
      const err = error as Error;
      interaction.editReply(err.message);
    }
  },
};
