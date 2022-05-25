import {Subcommand} from '../../ts/interfaces/Subcommand';
import {SlashCommandSubcommandBuilder} from '@discordjs/builders';
import {GuildMember, PermissionResolvable} from 'discord.js';
import {getWatchListInfo, updateRecurrence} from '../../db/actions/watchlist.action';
import {getCronUpdateMsg} from '../responses/valid.response';
import {getNoPermissionMsg, getNotInWatchlistMsg} from '../responses/invalid.response';

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

      const wl = await getWatchListInfo(itemID);
      if (!wl) throw new Error(getNotInWatchlistMsg(itemID));

      const newWl = {...wl, setByID: userID, setByName: userName, recurrence};

      const {nextOn, itemName} = await updateRecurrence(newWl);
      const resp = getCronUpdateMsg(itemID, itemName, recurrence, nextOn);
      // TODO: set up job.
      await interaction.editReply(resp);
    } catch (error) {
      const err = error as Error;
      interaction.editReply(err.message);
    }
  },
};
