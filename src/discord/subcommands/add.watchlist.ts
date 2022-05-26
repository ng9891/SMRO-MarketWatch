import {List} from '../../ts/interfaces/List';
import {Subcommand} from '../../ts/interfaces/Subcommand';
import {SlashCommandSubcommandBuilder} from '@discordjs/builders';
import scrapItemInfoByID from '../../scraper/scraper';
import {addSub, getWatchListInfo, createNewWatchList, updateWatchList} from '../../db/actions/watchlist.action';
import {getUserInfo, setUserInfo} from '../../db/actions/users.action';
import {parsePriceString} from '../../helpers/helpers';
import {getDefaultEmbed} from '../responses/valid.response';
import {getInvalidPriceFormatMsg, getInvalidMaxPriceMsg, getMaxListSizeMsg} from '../responses/invalid.response';

const isMaxListSize = (listSize: number | undefined) => {
  if (!listSize) return false;
  if (listSize <= Number(process.env.MAX_LIST_SIZE)) return true;
  return false;
};

export const add: Subcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName('add')
    .setDescription('Add/Update an Item ID to the watchlist.')
    .addIntegerOption((option) => option.setName('itemid').setDescription('ID of the Item. e.g 6635').setRequired(true))
    .addStringOption((option) =>
      option.setName('threshold').setDescription('Price threshold for notifications. e.g 250m').setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('refinement').setDescription('Minimum refinement of the equipment if applicable. e.g 11 or 12')
    ),
  run: async (interaction) => {
    try {
      await interaction.deferReply();
      const userID = interaction.user.id;
      const userName = interaction.user.username;
      const itemID = interaction.options.getInteger('itemid', true).toString();
      const threshold = interaction.options.getString('threshold', true);
      const refine = interaction.options.getInteger('refinement');
      const refinement = refine ? Math.abs(refine).toString() : null;
      const validPrice = parsePriceString(threshold);
      if (!validPrice) throw new Error(getInvalidPriceFormatMsg());

      const maxThreshold = Number(process.env.MAX_THRESHOLD);
      if (validPrice >= maxThreshold) throw new Error(getInvalidMaxPriceMsg());

      // Scraping item info
      const itemInfo = await scrapItemInfoByID(itemID);
      const newList: List = {
        itemID,
        threshold: validPrice,
        itemName: itemInfo.name,
        timestamp: itemInfo.timestamp,
        userID,
        userName,
      };
      if (refinement) newList.refinement = refinement;

      const user = await getUserInfo(userID, userName);
      const list = user.list;

      // If its not an update. Check for list size
      if (list && !list[itemID]) {
        const isFull = isMaxListSize(user.listSize);
        if (isFull) throw new Error(getMaxListSizeMsg(itemID, itemInfo.name, user?.list));
      }

      const newUser = await setUserInfo({...user, list: {...user.list, [itemID]: newList}});

      // Check if recurrence is set.
      let wl = await getWatchListInfo(itemID);
      if (!wl) {
        const recurrence = Number(process.env.DEFAULT_RECURRANCE_MINUTES);
        wl = await createNewWatchList(recurrence, newUser, itemInfo);
      } else if (wl.subs === 0) {
        // WatchList exists but doesn't have sub. Might not need this when setting job
        const newWl = Object.assign(wl, {setByID: userID, setByName: userName});
        wl = await updateWatchList(newWl);
      }
      //TODO: set job.
      //TODO: Initial check?

      const isNewSub = await addSub(newList);
      const action = isNewSub ? 'ADD' : 'UPDATE';
      const embed = getDefaultEmbed(action, wl, newUser.list);
      await interaction.editReply({embeds: [embed]});
    } catch (error) {
      const err = error as Error;
      // console.error(err);
      await interaction.editReply(err.message);
    }
  },
};
