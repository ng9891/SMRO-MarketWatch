import {Subcommand} from '../../ts/interfaces/Subcommand';
import {SlashCommandSubcommandBuilder} from '@discordjs/builders';
import {GuildMember, PermissionResolvable} from 'discord.js';
import {getWatchListInfo, updateWatchLists, createNewWatchList} from '../../db/actions/watchlist.action';
import {getRecurrenceUpdateMsg} from '../responses/valid.response';
import {getNoPermissionMsg} from '../responses/invalid.response';
import {scrapeItem} from '../../scraper/scraper';
import Scheduler from '../../scheduler/Scheduler';
import {checkMarket} from '../../scheduler/checkMarket';
import {getUnixTime} from 'date-fns';

export const recurrenceUpdate: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName('update')
    .setDescription('Updates the recurrence of an item. **Must have permission!**')
    .addStringOption((option) =>
      option
        .setName('server')
        .setDescription('Decide which server to put the watchlist')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option.setName('item-query').setDescription('Find item.').setRequired(true).setAutocomplete(true)
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

    const member = interaction.member as GuildMember;
    const permission =
      (process.env.PERMISSION_TO_CHANGE_SCRAPE_TIME as PermissionResolvable) || ('BAN_MEMBERS' as PermissionResolvable);
    if (!member.permissions.has(permission)) return getNoPermissionMsg();

    let wl = await getWatchListInfo(itemID);
    if (!wl) {
      const itemInfo = await scrapeItem(itemID, 'test', 'HEL');
      wl = await createNewWatchList(recurrence, {userID, userName}, itemInfo);
    } else {
      const newWl = {...wl, setByID: userID, setByName: userName, recurrence, setOn: getUnixTime(new Date())};
      const updatedWl = await updateWatchLists([newWl]);
      wl = updatedWl[0];
    }

    if (wl?.subs && wl.subs > 0) Scheduler.createJob(wl, checkMarket);

    await interaction.editReply(getRecurrenceUpdateMsg(wl));
  },
};
